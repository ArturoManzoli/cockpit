import L from 'leaflet'
import { computed, ComputedRef, ref } from 'vue'

import { useMissionStore } from '@/stores/mission'

type LatLng = [number, number]

const surveyAreaSquareMetersById = ref<Record<string, number>>({})

const toRad = (rotationInDegrees: number): number => (rotationInDegrees * Math.PI) / 180
const norm360 = (rotationInDegrees: number): number => ((rotationInDegrees % 360) + 360) % 360
const earthRadiusMeters = 6_378_137

export const setSurveyAreaSquareMeters = (id: string, areaSquareMeters: number): void => {
  surveyAreaSquareMetersById.value = { ...surveyAreaSquareMetersById.value, [id]: areaSquareMeters }
}

export const removeSurveyAreaSquareMeters = (id: string): void => {
  const next = { ...surveyAreaSquareMetersById.value }
  delete next[id]
  surveyAreaSquareMetersById.value = next
}

export const clearAllSurveyAreas = (): void => {
  surveyAreaSquareMetersById.value = {}
}

const calculateHaversineDistance = (start: LatLng, end: LatLng): number => {
  const deltaLatitude = toRad(end[0] - start[0])
  const deltaLongitude = toRad(end[1] - start[1])
  const lat1Rad = toRad(start[0])
  const lat2Rad = toRad(end[0])

  const a = Math.sin(deltaLatitude / 2) ** 2 + Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLongitude / 2) ** 2
  const centralAngle = 2 * Math.asin(Math.sqrt(a))

  return earthRadiusMeters * centralAngle
}

// bearing from a to b in degrees
export const bearingBetween = (a: L.LatLng, b: L.LatLng): number => {
  const theta1 = toRad(a.lat)
  const theta2 = toRad(b.lat)
  const deltaLambda = toRad(b.lng - a.lng)
  const y = Math.sin(deltaLambda) * Math.cos(theta2)
  const x = Math.cos(theta1) * Math.sin(theta2) - Math.sin(theta1) * Math.cos(theta2) * Math.cos(deltaLambda)
  return norm360((Math.atan2(y, x) * 180) / Math.PI)
}

// smallest difference between two bearings
export const deltaBearing = (b1: number, b2: number): number => {
  const d = Math.abs(b2 - b1)
  return d > 180 ? 360 - d : d
}

export const centroidLatLng = (vertices: L.LatLng[]): L.LatLng => {
  if (vertices.length === 0) return L.latLng(0, 0)
  if (vertices.length < 3) {
    const avgLat = vertices.reduce((sum, p) => sum + p.lat, 0) / vertices.length
    const avgLng = vertices.reduce((sum, p) => sum + p.lng, 0) / vertices.length
    return L.latLng(avgLat, avgLng)
  }

  let meanLatDeg = 0
  let meanLngDeg = 0
  for (const pt of vertices) {
    meanLatDeg += pt.lat
    meanLngDeg += pt.lng
  }
  meanLatDeg /= vertices.length
  meanLngDeg /= vertices.length

  const meanLatRad = (meanLatDeg * Math.PI) / 180
  const meanLngRad = (meanLngDeg * Math.PI) / 180
  const cosMeanLat = Math.cos(meanLatRad)

  const projectedPoints = vertices.map((pt) => {
    const latRad = (pt.lat * Math.PI) / 180
    const lngRad = (pt.lng * Math.PI) / 180
    return {
      x: earthRadiusMeters * (lngRad - meanLngRad) * cosMeanLat,
      y: earthRadiusMeters * (latRad - meanLatRad),
    }
  })

  let twiceSignedArea = 0
  let centroidTermX = 0
  let centroidTermY = 0
  for (let i = 0; i < projectedPoints.length; i++) {
    const j = (i + 1) % projectedPoints.length
    const cross = projectedPoints[i].x * projectedPoints[j].y - projectedPoints[j].x * projectedPoints[i].y
    twiceSignedArea += cross
    centroidTermX += (projectedPoints[i].x + projectedPoints[j].x) * cross
    centroidTermY += (projectedPoints[i].y + projectedPoints[j].y) * cross
  }

  const polygonArea = twiceSignedArea / 2

  if (Math.abs(polygonArea) < 1e-9) {
    const avgLat = vertices.reduce((sum, p) => sum + p.lat, 0) / vertices.length
    const avgLng = vertices.reduce((sum, p) => sum + p.lng, 0) / vertices.length
    return L.latLng(avgLat, avgLng)
  }

  const centroidX = centroidTermX / (6 * polygonArea)
  const centroidY = centroidTermY / (6 * polygonArea)
  const latRad = centroidY / earthRadiusMeters + meanLatRad
  const lngRad = centroidX / (earthRadiusMeters * cosMeanLat) + meanLngRad
  const latDeg = (latRad * 180) / Math.PI
  const lngDeg = (lngRad * 180) / Math.PI

  return L.latLng(latDeg, lngDeg)
}

export const polygonAreaSquareMeters = (position: LatLng[]): number => {
  if (position.length < 3) return 0
  let lat0 = 0,
    lon0 = 0
  for (const [lat, lon] of position) {
    lat0 += lat
    lon0 += lon
  }
  lat0 /= position.length
  lon0 /= position.length
  const phi0 = toRad(lat0),
    lambda0 = toRad(lon0)
  const pts = position.map(([lat, lon]) => {
    const phi = toRad(lat),
      lambda = toRad(lon)
    return { x: earthRadiusMeters * (lambda - lambda0) * Math.cos(phi0), y: earthRadiusMeters * (phi - phi0) }
  })
  let sum = 0
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length
    sum += pts[i].x * pts[j].y - pts[j].x * pts[i].y
  }
  return Math.abs(sum) / 2
}

export const formatMetersShort = (distance: number): string => {
  if (!isFinite(distance) || distance <= 0) return '—'
  if (distance < 1000) return `${distance.toFixed(0)} m`
  return `${(distance / 1000).toFixed(2)} km`
}
export const formatSeconds = (s: number): string => {
  if (!isFinite(s) || s <= 0) return '—'
  const time = Math.floor(s / 3600)
  const distance = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  if (time > 0) return `${time}h ${distance}m`
  if (distance > 0) return `${distance}m ${sec}s`
  return `${sec}s`
}
export const formatWh = (energy: number): string => (energy <= 0 || !isFinite(energy) ? '—' : `${energy.toFixed(2)} Wh`)
export const formatArea = (area: number): string => {
  if (area <= 0 || !isFinite(area)) return '—'
  if (area < 1e6) return `${area.toFixed(0)} m²`
  return `${(area / 1e6).toFixed(3)} km²`
}

/* eslint-disable jsdoc/require-jsdoc */
export const useMissionStats = (): {
  missionLengthMeters: ComputedRef<number>
  missionCoverageAreaSquareMeters: ComputedRef<number>
  totalMissionLength: ComputedRef<string>
  totalSurveyCoverage: ComputedRef<string>
} => {
  const missionStore = useMissionStore()

  const missionLengthMeters = computed(() => {
    const wps = missionStore.currentPlanningWaypoints || []
    if (wps.length < 2) return 0
    let total = 0
    for (let i = 0; i < wps.length - 1; i++) {
      total += calculateHaversineDistance(wps[i].coordinates as LatLng, wps[i + 1].coordinates as LatLng)
    }
    return total
  })

  // Coverage area (surveys only for now)
  const missionCoverageAreaSquareMeters = computed(() => {
    const areasMap = surveyAreaSquareMetersById.value as Record<string, number>
    if (areasMap && Object.keys(areasMap).length > 0) {
      return Object.values(areasMap).reduce((acc, v) => acc + (Number(v) || 0), 0)
    }

    const anyStore = missionStore as any
    const surveys = Array.isArray(anyStore.surveys) ? anyStore.surveys : []
    if (surveys.length > 0) {
      return surveys.reduce((acc: number, s: any) => {
        const poly = (s.polygonCoordinates || []) as LatLng[]
        return acc + polygonAreaSquareMeters(poly)
      }, 0)
    }

    const wps = missionStore.currentPlanningWaypoints || []
    if (wps.length >= 3) {
      const first = wps[0].coordinates as LatLng
      const last = wps[wps.length - 1].coordinates as LatLng
      if (calculateHaversineDistance(first, last) < 3) {
        return polygonAreaSquareMeters(wps.map((w) => w.coordinates as LatLng))
      }
    }
    return 0
  })

  // String formatting
  const totalMissionLength = computed(() => formatMetersShort(missionLengthMeters.value))
  const totalSurveyCoverage = computed(() => formatArea(missionCoverageAreaSquareMeters.value))

  return {
    missionLengthMeters,
    missionCoverageAreaSquareMeters,
    totalMissionLength,
    totalSurveyCoverage,
  }
}
