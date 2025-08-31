import { computed } from 'vue'

import { useMissionStore } from '@/stores/mission'

// ---------- helpers ----------
type LatLng = [number, number]
const toRad = (deg: number) => (deg * Math.PI) / 180
const norm360 = (deg: number) => ((deg % 360) + 360) % 360

const llDistance = (a: LatLng, b: LatLng): number => {
  const R = 6371008.8
  const dLat = toRad(b[0] - a[0])
  const dLon = toRad(b[1] - a[1])
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

const bearingBetween = (a: LatLng, b: LatLng): number => {
  const φ1 = toRad(a[0])
  const φ2 = toRad(b[0])
  const Δλ = toRad(b[1] - a[1])
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  return norm360((Math.atan2(y, x) * 180) / Math.PI)
}

const deltaBearing = (b1: number, b2: number) => {
  const d = Math.abs(b2 - b1)
  return d > 180 ? 360 - d : d
}

// local tangent-plane polygon area (m²), robust for small/medium areas
const polygonAreaM2 = (latlngs: LatLng[]): number => {
  if (latlngs.length < 3) return 0
  const R = 6378137
  let lat0 = 0,
    lon0 = 0
  for (const [lat, lon] of latlngs) {
    lat0 += lat
    lon0 += lon
  }
  lat0 /= latlngs.length
  lon0 /= latlngs.length
  const φ0 = toRad(lat0),
    λ0 = toRad(lon0)
  const pts = latlngs.map(([lat, lon]) => {
    const φ = toRad(lat),
      λ = toRad(lon)
    return { x: R * (λ - λ0) * Math.cos(φ0), y: R * (φ - φ0) }
  })
  let sum = 0
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length
    sum += pts[i].x * pts[j].y - pts[j].x * pts[i].y
  }
  return Math.abs(sum) / 2
}

// ---------- formatting (unchanged) ----------
export const formatMetersShort = (m: number): string => {
  if (!isFinite(m) || m <= 0) return '—'
  if (m < 1000) return `${m.toFixed(0)} m`
  return `${(m / 1000).toFixed(2)} km`
}
export const formatSeconds = (s: number): string => {
  if (!isFinite(s) || s <= 0) return '—'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}
export const formatWh = (wh: number): string => (wh <= 0 || !isFinite(wh) ? '—' : `${wh.toFixed(0)} Wh`)
export const formatArea = (m2: number): string => {
  if (m2 <= 0 || !isFinite(m2)) return '—'
  if (m2 < 1e6) return `${m2.toFixed(0)} m²`
  return `${(m2 / 1e6).toFixed(3)} km²`
}

// ---------- constants derived from your chart ----------
const BASE_POWER_W_1MPS = 30 // ~29.6 W, round to 30
const BASE_BATT_COUNT = 2
const BASE_BATT_MASS_2 = 2.4 // kg for 2 batteries
const MASS_PER_BATT = 1.15 // kg per battery (from 2.4 → 4.7 → 7.0 → 9.3)
const MASS_SLOPE_W_PER_KG_1MPS = 0.7 // W/kg @ 1 m/s (fit from table)
const SPEED_EXPONENT = 3.2 // P ~ v^α (adjustable later via settings)

// utility: battery mass & capacity from count
const batteryMassKg = (count: number) =>
  Math.max(BASE_BATT_COUNT, Math.round(count || BASE_BATT_COUNT)) === BASE_BATT_COUNT
    ? BASE_BATT_MASS_2
    : BASE_BATT_MASS_2 + (Math.max(count, BASE_BATT_COUNT) - BASE_BATT_COUNT) * MASS_PER_BATT

// ---------- main composable ----------
/**
 *
 */
export function useMissionStats() {
  const missionStore = useMissionStore()

  // raw geometry length
  const missionLengthMeters = computed(() => {
    const wps = missionStore.currentPlanningWaypoints || []
    if (wps.length < 2) return 0
    let total = 0
    for (let i = 0; i < wps.length - 1; i++) {
      total += llDistance(wps[i].coordinates as LatLng, wps[i + 1].coordinates as LatLng)
    }
    return total
  })

  // turn penalty seconds (your rule set)
  const turnPenaltySeconds = computed(() => {
    const wps = missionStore.currentPlanningWaypoints || []
    let secs = 0
    if (wps.length >= 2) secs += 1 // last WP braking
    for (let i = 1; i < wps.length - 1; i++) {
      const prev = wps[i - 1].coordinates as LatLng
      const cur = wps[i].coordinates as LatLng
      const next = wps[i + 1].coordinates as LatLng
      const diff = deltaBearing(bearingBetween(prev, cur), bearingBetween(cur, next))
      if (diff > 45) secs += 1 + 1 + Math.ceil(diff / 15)
    }
    return secs
  })

  // inputs (with safe fallbacks)
  const speedMps = computed<number>(() => {
    const s = Number((missionStore as any).defaultCruiseSpeed)
    return s > 0 ? s : 1
  })
  const payloadKg = computed<number>(() => {
    const p = Number((missionStore as any).payloadKg)
    return Number.isFinite(p) && p >= 0 ? p : 0
  })
  const battCount = computed<number>(() => {
    const c = Number((missionStore as any).batteryCount)
    return Number.isFinite(c) && c >= 2 ? Math.round(c) : 2
  })

  // mass- & speed-aware power estimate
  const powerW = computed(() => {
    const mBatt = batteryMassKg(battCount.value)
    const mTotExtra = mBatt - BASE_BATT_MASS_2 + payloadKg.value
    const pAt1 = Math.max(5, BASE_POWER_W_1MPS + MASS_SLOPE_W_PER_KG_1MPS * mTotExtra)
    const v = Math.max(0.1, speedMps.value)
    return pAt1 * Math.pow(v / 1.0, SPEED_EXPONENT)
  })

  // ETA with penalties
  const missionETASeconds = computed(() => {
    const v = speedMps.value
    if (v <= 0) return NaN
    return missionLengthMeters.value / v + turnPenaltySeconds.value
  })

  // Energy = Power * time
  const missionEnergyWh = computed(() => {
    if (!isFinite(missionETASeconds.value)) return NaN
    return (powerW.value * missionETASeconds.value) / 3600
  })

  // coverage area (surveys preferred; else closed path)
  const missionCoverageAreaM2 = computed(() => {
    const anyStore = missionStore as any
    if (Array.isArray(anyStore.surveys) && anyStore.surveys.length > 0) {
      return anyStore.surveys.reduce((acc: number, s: any) => {
        const poly = (s.polygonCoordinates || []) as LatLng[]
        return acc + polygonAreaM2(poly)
      }, 0)
    }
    const wps = missionStore.currentPlanningWaypoints || []
    if (wps.length >= 3) {
      const first = wps[0].coordinates as LatLng
      const last = wps[wps.length - 1].coordinates as LatLng
      if (llDistance(first, last) < 3) {
        return polygonAreaM2(wps.map((w) => w.coordinates as LatLng))
      }
    }
    return 0
  })

  // pretty strings
  const formattedMissionLength = computed(() => formatMetersShort(missionLengthMeters.value))
  const formattedETA = computed(() => formatSeconds(missionETASeconds.value))
  const formattedEnergy = computed(() => formatWh(missionEnergyWh.value))
  const formattedArea = computed(() => formatArea(missionCoverageAreaM2.value))

  return {
    // raw values
    missionLengthMeters,
    missionETASeconds,
    missionEnergyWh,
    missionCoverageAreaM2,
    powerW, // now exposed if you want to show live power
    speedMps, // reads store
    // pretty
    formattedMissionLength,
    formattedETA,
    formattedEnergy,
    formattedArea,
    // tunables you might later surface in settings
    turnPenaltySeconds,
  }
}
