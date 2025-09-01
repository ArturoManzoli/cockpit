import { LatLng } from 'leaflet'
import { type ComputedRef, computed } from 'vue'

import {
  bearingBetween,
  deltaBearing,
  formatSeconds,
  formatWh,
  useMissionStats,
} from '@/composables/useMissionStatistics'
import { BatteryChemistry } from '@/libs/vehicle/types'
import { useMainVehicleStore } from '@/stores/mainVehicle'
import { useMissionStore } from '@/stores/mission'

export const basePowerAtOneMs = 29.6 // ~29.6 W @ 1 m/s with 2 standard batteries, no payload
export const massSlopeWPerKg1Mps = 0.68 // ~0.68 W per extra kg @ 1 m/s
export const speedExponent = 3.2 // P ~ v^α

export const kgPerWhByChem: Record<BatteryChemistry, number> = {
  'li-ion': 0.005, // ≈5 g/Wh
  'li-po': 0.006, // ≈6 g/Wh
  'lifepo4': 0.009, // ≈9 g/Wh
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useBlueBoatMissionEstimates = (): {
  /**
   * Vehicle turning time penalty in seconds
   */
  turnPenaltySeconds: ComputedRef<number>
  /**
   * Cruise speed in meters per second
   */
  speedMps: ComputedRef<number>
  /**
   * Extra payload in kilograms (excluding standard 2 266 Wh battery mass)
   */
  payloadKg: ComputedRef<number>
  /**
   * Battery mass in kilograms (based on chemistry and capacity)
   */
  batteryMassKg: ComputedRef<number>
  /**
   * Power estimate in Watts
   */
  powerW: ComputedRef<number>
  /**
   * Estimated mission time in seconds
   */
  missionETASeconds: ComputedRef<number>
  /**
   * Estimated mission energy consumption in Watt-hours
   */
  missionEnergyWh: ComputedRef<number>
  /**
   * Formatted time to complete the mission
   */
  timeToCompleteMission: ComputedRef<string>
  /**
   * Formatted total energy consumption for the mission in Wh
   */
  totalEnergy: ComputedRef<string>
} => {
  const missionStore = useMissionStore()
  const vehicleStore = useMainVehicleStore()
  const { missionLengthMeters } = useMissionStats()

  // Vehicle turning time penalty in seconds (hardcoded for now)
  const turnPenaltySeconds = computed(() => {
    const wps = missionStore.currentPlanningWaypoints || []
    let secs = 0
    if (wps.length >= 2) secs += 1 // adds deceleration time
    for (let i = 1; i < wps.length - 1; i++) {
      const prev = wps[i - 1].coordinates as unknown as LatLng
      const cur = wps[i].coordinates as unknown as LatLng
      const next = wps[i + 1].coordinates as unknown as LatLng
      const diff = deltaBearing(bearingBetween(prev, cur), bearingBetween(cur, next))
      if (diff > 45) secs += 1 + 1 + Math.ceil(diff / 15)
    }
    return secs
  })

  // Vehicle parameter input
  const speedMps = computed<number>(() => {
    const speed = Number((missionStore as any).defaultCruiseSpeed)
    return speed > 0 ? speed : 1
  })

  // Extra payload in kg
  const payloadKg = computed<number>(() => {
    const payload = Number(vehicleStore.vehiclePayloadParameters?.extraPayloadKg)
    return Number.isFinite(payload) && payload >= 0 ? payload : 0
  })

  // Battery mass & capacity from count
  const batteryMassKg = computed<number>(() => {
    const battCapacity = Number(vehicleStore.vehiclePayloadParameters?.batteryCapacity) || 2 * 266.4 // default pack capacity
    const chem = (vehicleStore.vehiclePayloadParameters?.batteryChemistry ?? 'li-ion') as BatteryChemistry
    const kgPerWh = kgPerWhByChem[chem] ?? kgPerWhByChem['li-ion']
    return battCapacity * kgPerWh
  })

  // Power estimate
  const powerW = computed(() => {
    const originalBatteryMassKg = 1.152 * 2 // default battery pack mass
    const totalExtraMass = payloadKg.value + (batteryMassKg.value - originalBatteryMassKg)
    const pAt1 = Math.max(5, basePowerAtOneMs + massSlopeWPerKg1Mps * totalExtraMass)
    const speed = Math.max(0.1, speedMps.value)
    return pAt1 * Math.pow(speed / 1.0, speedExponent)
  })

  // Estimate mission time with added penalties
  const missionETASeconds = computed(() => {
    if (speedMps.value <= 0) return NaN
    return missionLengthMeters.value / speedMps.value + turnPenaltySeconds.value
  })

  // Energy consumption estimate (Wh)
  const missionEnergyWh = computed(() => {
    if (!isFinite(missionETASeconds.value)) return NaN
    return (powerW.value * missionETASeconds.value) / 3600
  })

  const timeToCompleteMission = computed(() => formatSeconds(missionETASeconds.value))
  const totalEnergy = computed(() => formatWh(missionEnergyWh.value))

  return {
    turnPenaltySeconds,
    speedMps,
    payloadKg,
    batteryMassKg,
    powerW,
    missionETASeconds,
    missionEnergyWh,
    timeToCompleteMission,
    totalEnergy,
  }
}
