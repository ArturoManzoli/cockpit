/**
 * Possible distance units.
 * Meters is the default unit, from which all other units are converted.
 */
export enum DistanceDisplayUnit {
  Meters = 'meters',
  Feet = 'feet',
  NauticalMiles = 'nautical-miles',
}

export const unitPrettyName = {
  [DistanceDisplayUnit.Meters]: 'Meters',
  [DistanceDisplayUnit.Feet]: 'Feet',
  [DistanceDisplayUnit.NauticalMiles]: 'Nautical Miles',
}

export const unitAbbreviation = {
  [DistanceDisplayUnit.Meters]: 'm',
  [DistanceDisplayUnit.Feet]: 'ft',
  [DistanceDisplayUnit.NauticalMiles]: 'nmi',
}

/**
 * Unit system type
 */
export type UnitSystem = 'imperial' | 'metric' | 'nautical'

/**
 * Converted value with unit
 */
export interface ConvertedValue {
  /**
   * The converted numeric value
   */
  value: number
  /**
   * The unit abbreviation
   */
  unit: string
}

/**
 * Converts meters to the selected unit system
 * @param meters - Distance in meters
 * @param unitSystem - Unit system to convert to ('imperial', 'metric', or 'nautical')
 * @returns Object with value and unit
 */
export const convertDistance = (meters: number, unitSystem: UnitSystem): ConvertedValue => {
  if (!isFinite(meters) || meters <= 0) {
    return { value: 0, unit: '' }
  }

  switch (unitSystem) {
    case 'imperial': {
      const feet = meters * 3.28084
      if (feet < 5280) {
        return { value: feet, unit: 'ft' }
      }
      const miles = meters * 0.000621371
      return { value: miles, unit: 'mi' }
    }
    case 'nautical': {
      const nauticalMiles = meters * 0.000539957
      return { value: nauticalMiles, unit: 'nmi' }
    }
    case 'metric':
    default: {
      if (meters < 1000) {
        return { value: meters, unit: 'm' }
      }
      return { value: meters / 1000, unit: 'km' }
    }
  }
}

/**
 * Converts square meters to the selected unit system
 * @param squareMeters - Area in square meters
 * @param unitSystem - Unit system to convert to ('imperial', 'metric', or 'nautical')
 * @returns Object with value and unit
 */
export const convertArea = (squareMeters: number, unitSystem: UnitSystem): ConvertedValue => {
  if (!isFinite(squareMeters) || squareMeters <= 0) {
    return { value: 0, unit: '' }
  }

  switch (unitSystem) {
    case 'imperial': {
      const squareFeet = squareMeters * 10.7639
      if (squareFeet < 43560) {
        return { value: squareFeet, unit: 'ft²' }
      }
      const acres = squareMeters * 0.000247105
      return { value: acres, unit: 'ac' }
    }
    case 'nautical': {
      const squareNauticalMiles = squareMeters * 0.000000291553
      return { value: squareNauticalMiles, unit: 'nmi²' }
    }
    case 'metric':
    default: {
      if (squareMeters < 1e6) {
        return { value: squareMeters, unit: 'm²' }
      }
      return { value: squareMeters / 1e6, unit: 'km²' }
    }
  }
}

/**
 * Formats distance with appropriate precision based on unit
 * @param meters - Distance in meters
 * @param unitSystem - Unit system to format for
 * @returns Formatted string
 */
export const formatDistance = (meters: number, unitSystem: UnitSystem): string => {
  const converted = convertDistance(meters, unitSystem)
  if (converted.value === 0) return '—'

  if (unitSystem === 'imperial') {
    if (converted.unit === 'ft') {
      return `${converted.value.toFixed(0)} ${converted.unit}`
    }
    return `${converted.value.toFixed(2)} ${converted.unit}`
  }

  if (unitSystem === 'nautical') {
    return `${converted.value.toFixed(3)} ${converted.unit}`
  }

  if (converted.unit === 'm') {
    return `${converted.value.toFixed(0)} ${converted.unit}`
  }
  return `${converted.value.toFixed(2)} ${converted.unit}`
}

/**
 * Formats area with appropriate precision based on unit
 * @param squareMeters - Area in square meters
 * @param unitSystem - Unit system to format for
 * @returns Formatted string
 */
export const formatArea = (squareMeters: number, unitSystem: UnitSystem): string => {
  const converted = convertArea(squareMeters, unitSystem)
  if (converted.value === 0) return '—'

  if (unitSystem === 'imperial') {
    if (converted.unit === 'ft²') {
      return `${converted.value.toFixed(0)} ${converted.unit}`
    }
    return `${converted.value.toFixed(3)} ${converted.unit}`
  }

  if (unitSystem === 'nautical') {
    return `${converted.value.toFixed(7)} ${converted.unit}`
  }

  if (converted.unit === 'm²') {
    return `${converted.value.toFixed(0)} ${converted.unit}`
  }
  return `${converted.value.toFixed(3)} ${converted.unit}`
}
