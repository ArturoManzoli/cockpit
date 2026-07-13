import { coolMissionNames } from '@/libs/funny-name/words'

/**
 * Picks a random human-friendly name to use as an automatic mission name.
 * @returns {string} A cool mission name.
 */
export const generateAutomaticMissionName = (): string => coolMissionNames.random() ?? coolMissionNames[0]

/**
 * Whether two dates fall on different calendar days, used to cycle the automatic mission name at midnight.
 * @param {Date} a First date.
 * @param {Date} b Second date.
 * @returns {boolean} `true` when the dates belong to different local calendar days.
 */
export const isNewCalendarDay = (a: Date, b: Date): boolean =>
  a.getFullYear() !== b.getFullYear() || a.getMonth() !== b.getMonth() || a.getDate() !== b.getDate()

/**
 * Milliseconds until the next local midnight from the given moment, used to schedule the automatic name cycle.
 * @param {Date} from Reference moment.
 * @returns {number} Milliseconds remaining until the next midnight.
 */
export const msUntilNextMidnight = (from: Date): number => {
  const nextMidnight = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 1, 0, 0, 0, 0)
  return nextMidnight.getTime() - from.getTime()
}
