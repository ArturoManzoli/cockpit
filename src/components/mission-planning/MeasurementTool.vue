<template>
  <v-tooltip location="top center" :text="props.isActive ? 'End Measure Mode' : 'Measure Mode'">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        v-bind="tooltipProps"
        class="absolute m-3 rounded-sm shadow-sm bottom-12 right-[178px] text-[14px]"
        :class="{ 'bg-red-500': props.isActive }"
        :style="
          props.isActive
            ? { ...interfaceStore.globalGlassMenuStyles, backgroundColor: '#ef4444' }
            : interfaceStore.globalGlassMenuStyles
        "
        size="x-small"
        icon="mdi-ruler"
        @click="toggleMeasurement"
      />
    </template>
  </v-tooltip>
  <div v-if="props.isActive" class="measurement-total-distance-tag" :style="interfaceStore.globalGlassMenuStyles">
    <div class="measurement-report">
      <div class="measurement-report-header">
        <div class="measurement-report-title">Measure Mode</div>
        <div class="measurement-report-menu-container">
          <button class="measurement-report-menu-button" @click.stop="toggleMenu">
            <v-icon icon="mdi-dots-vertical" size="16" />
          </button>
          <div v-show="menuVisible" class="measurement-report-menu">
            <button class="measurement-report-menu-item" @click="handleMenuAction('options')">Options</button>
            <button
              class="measurement-report-menu-item"
              :class="{ disabled: !hasEnoughPoints }"
              :disabled="!hasEnoughPoints"
              @click="handleMenuAction('clear')"
            >
              Clear Metrics
            </button>
            <button
              class="measurement-report-menu-item"
              :class="{ disabled: !hasEnoughPoints }"
              :disabled="!hasEnoughPoints"
              @click="handleMenuAction('export')"
            >
              Export Measurements
            </button>
          </div>
        </div>
      </div>
      <div class="measurement-report-row">
        <span class="measurement-report-label">Total Distance:</span>
        <span class="measurement-report-value">{{ formattedTotalDistance }}</span>
      </div>
      <template v-if="measurementPoints.length >= 3">
        <div class="measurement-report-row">
          <span class="measurement-report-label">Area (auto-closed):</span>
          <span class="measurement-report-value">{{ formattedArea }}</span>
        </div>
        <div class="measurement-report-row">
          <span class="measurement-report-label">Perimeter (auto-closed):</span>
          <span class="measurement-report-value">{{ formattedPerimeter }}</span>
        </div>
      </template>
      <div class="measurement-report-row">
        <span class="measurement-report-label">Avg Segment length:</span>
        <span class="measurement-report-value">{{ formattedAvgSegment }}</span>
      </div>
      <div class="measurement-report-row">
        <span class="measurement-report-label">Min/Max length:</span>
        <span class="measurement-report-value">{{ formattedMin }} / {{ formattedMax }}</span>
      </div>
      <div class="measurement-report-row">
        <span class="measurement-report-label">Segments:</span>
        <span class="measurement-report-value">{{ numSegments }}</span>
      </div>
      <div class="measurement-report-row">
        <span class="measurement-report-label">Vertexes:</span>
        <span class="measurement-report-value">{{ measurementPoints.length }}</span>
      </div>
    </div>
  </div>
  <v-dialog v-model="optionsDialogVisible" persistent max-width="500px">
    <v-card :style="interfaceStore.globalGlassMenuStyles">
      <v-card-title class="text-lg text-center font-semibold">Measurement Options</v-card-title>
      <v-icon icon="mdi-close" class="absolute top-3 right-3" @click="optionsDialogVisible = false" />
      <v-card-text>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Unit System</label>
          <v-select
            v-model="localUnitSystem"
            theme="dark"
            :items="unitSystemItems"
            item-title="title"
            item-value="value"
            density="compact"
            hide-details
            class="w-full border"
          />
          <p class="text-[11px] opacity-70 mt-1">Unit system for displaying distances and areas.</p>
        </div>
        <div class="mb-6">
          <v-checkbox
            v-model="showDistanceTags"
            label="Show Distance Tags"
            theme="dark"
            density="compact"
            hide-details
            class="w-full"
          />
          <v-checkbox
            v-model="showAngleTags"
            label="Show Angle Tags"
            theme="dark"
            density="compact"
            hide-details
            class="w-full"
          />
        </div>
        <div class="mb-2">
          <label class="block text-sm font-medium mb-1">Tag Size: {{ tagSize }}px</label>
          <v-slider
            v-model="tagSize"
            min="8"
            max="20"
            step="1"
            thumb-label="always"
            density="compact"
            color="white"
          ></v-slider>
        </div>
        <div class="mb-4">
          <div class="flex flex-row justify-between items-center w-full gap-x-3">
            <v-menu
              :close-on-content-click="false"
              location="top start"
              origin="top start"
              transition="scale-transition"
              class="overflow-hidden"
            >
              <template #activator="{ props }">
                <span class="text-sm font-bold text-white text-start">Distance Tag Background</span>
                <div
                  v-bind="props"
                  class="w-[20px] h-[20px] border-2 border-slate-600 rounded-full cursor-pointer"
                  :style="{
                    backgroundColor: `rgba(${distanceTagColor.r}, ${distanceTagColor.g}, ${distanceTagColor.b}, ${distanceTagColor.a})`,
                  }"
                ></div>
              </template>
              <v-card class="overflow-hidden">
                <v-color-picker v-model="distanceTagColor" mode="rgba" width="400px" theme="dark" />
              </v-card>
            </v-menu>
          </div>
        </div>
        <div class="mb-4">
          <div class="flex flex-row justify-between items-center w-full gap-x-3">
            <v-menu
              :close-on-content-click="false"
              location="top start"
              origin="top start"
              transition="scale-transition"
              class="overflow-hidden"
            >
              <template #activator="{ props }">
                <span class="text-sm font-bold text-white text-start">Angle Tag Background</span>
                <div
                  v-bind="props"
                  class="w-[20px] h-[20px] border-2 border-slate-600 rounded-full cursor-pointer"
                  :style="{
                    backgroundColor: `rgba(${angleTagColor.r}, ${angleTagColor.g}, ${angleTagColor.b}, ${angleTagColor.a})`,
                  }"
                ></div>
              </template>
              <v-card class="overflow-hidden">
                <v-color-picker v-model="angleTagColor" mode="rgba" width="400px" theme="dark" />
              </v-card>
            </v-menu>
          </div>
        </div>
        <div class="mb-4">
          <div class="flex flex-row justify-between items-center w-full gap-x-3">
            <v-menu
              :close-on-content-click="false"
              location="top start"
              origin="top start"
              transition="scale-transition"
              class="overflow-hidden"
            >
              <template #activator="{ props }">
                <span class="text-sm font-bold text-white text-start">Line Color</span>
                <div
                  v-bind="props"
                  class="w-[20px] h-[20px] border-2 border-slate-600 rounded-full cursor-pointer"
                  :style="{
                    backgroundColor: `rgba(${lineColor.r}, ${lineColor.g}, ${lineColor.b}, ${lineColor.a})`,
                  }"
                ></div>
              </template>
              <v-card class="overflow-hidden">
                <v-color-picker v-model="lineColor" mode="rgba" width="400px" theme="dark" />
              </v-card>
            </v-menu>
          </div>
        </div>
      </v-card-text>
      <v-divider class="mx-8" />
      <v-card-actions>
        <div class="flex justify-end w-full pa-1">
          <v-btn color="white" @click="optionsDialogVisible = false">Close</v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import L from 'leaflet'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'

import { useMapLayer } from '@/composables/map/useMapLayer'
import {
  bearingBetween,
  calculateHaversineDistance,
  deltaBearing,
  polygonAreaSquareMeters,
} from '@/libs/mission/general-estimates'
import { type UnitSystem, DistanceDisplayUnit, formatArea, formatDistance, unitPrettyName } from '@/libs/units'
import { useAppInterfaceStore } from '@/stores/appInterface'
import { useMissionStore } from '@/stores/mission'
import type { MeasurementOptions, WaypointCoordinates } from '@/types/mission'
import type { RgbaColor } from '@/types/user-interface'

/**
 *
 */
interface Props {
  /**
   *
   */
  zoom: number
  /**
   *
   */
  isActive: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:isActive', value: boolean): void
}>()

const interfaceStore = useAppInterfaceStore()
const missionStore = useMissionStore()

const toggleMeasurement = (): void => {
  emit('update:isActive', !props.isActive)
}

const { mapLayer } = useMapLayer()

// Use a computed to get the map instance
const map = computed(() => {
  if (mapLayer.value) {
    return mapLayer.value
  }
  return null
})

// Track Alt key state for angle snapping
const isAltPressed = ref(false)

/**
 * Snaps an angle to the nearest of 0°, 45°, or 90° from horizontal
 * @param angle - Angle in degrees (0-360)
 * @returns Snapped angle in degrees
 */
const snapAngle = (angle: number): number => {
  const normalizedAngle = ((angle % 360) + 360) % 360
  const snapTargets = [0, 45, 90, 135, 180, 225, 270, 315]
  let closest = snapTargets[0]
  let minDiff = Math.abs(normalizedAngle - closest)

  for (const target of snapTargets) {
    const diff = Math.abs(normalizedAngle - target)
    if (diff < minDiff) {
      minDiff = diff
      closest = target
    }
  }

  return closest
}

/**
 * Converts bearing in degrees to compass direction
 * @param bearing - Bearing in degrees (0-360)
 * @param useFullName - Whether to use full names (e.g., "south-south-west") or abbreviations (e.g., "SSW")
 * @returns Compass direction string
 */
const bearingToCompassDirection = (bearing: number, useFullName: boolean): string => {
  const normalizedBearing = ((bearing % 360) + 360) % 360
  const directions = [
    { angle: 0, abbrev: 'N', full: 'north' },
    { angle: 22.5, abbrev: 'NNE', full: 'north-northeast' },
    { angle: 45, abbrev: 'NE', full: 'northeast' },
    { angle: 67.5, abbrev: 'ENE', full: 'east-northeast' },
    { angle: 90, abbrev: 'E', full: 'east' },
    { angle: 112.5, abbrev: 'ESE', full: 'east-southeast' },
    { angle: 135, abbrev: 'SE', full: 'southeast' },
    { angle: 157.5, abbrev: 'SSE', full: 'south-southeast' },
    { angle: 180, abbrev: 'S', full: 'south' },
    { angle: 202.5, abbrev: 'SSW', full: 'south-southwest' },
    { angle: 225, abbrev: 'SW', full: 'southwest' },
    { angle: 247.5, abbrev: 'WSW', full: 'west-southwest' },
    { angle: 270, abbrev: 'W', full: 'west' },
    { angle: 292.5, abbrev: 'WNW', full: 'west-northwest' },
    { angle: 315, abbrev: 'NW', full: 'northwest' },
    { angle: 337.5, abbrev: 'NNW', full: 'north-northwest' },
  ]

  for (let i = 0; i < directions.length; i++) {
    const current = directions[i]
    const next = directions[(i + 1) % directions.length]
    const threshold = (current.angle + next.angle) / 2

    if (normalizedBearing < threshold || (i === directions.length - 1 && normalizedBearing >= 337.5)) {
      return useFullName ? current.full : current.abbrev
    }
  }

  return useFullName ? directions[0].full : directions[0].abbrev
}

/**
 * Calculates a snapped position based on the last point and cursor position
 * @param lastPoint - The last measurement point
 * @param cursorLatlng - The cursor position
 * @returns Snapped LatLng position
 */
const calculateSnappedPosition = (lastPoint: L.LatLng, cursorLatlng: L.LatLng): L.LatLng => {
  // Calculate bearing from last point to cursor
  const bearing = bearingBetween([lastPoint.lat, lastPoint.lng], [cursorLatlng.lat, cursorLatlng.lng])

  // Snap the bearing to 0, 45, or 90 degrees
  const snappedBearing = snapAngle(bearing)

  // Calculate distance
  const distance = lastPoint.distanceTo(cursorLatlng)

  // Calculate new position using snapped bearing
  const rad = (snappedBearing * Math.PI) / 180
  const latOffset = (distance / 111320) * Math.cos(rad)
  const lngOffset = (distance / (111320 * Math.cos((lastPoint.lat * Math.PI) / 180))) * Math.sin(rad)

  return L.latLng(lastPoint.lat + latOffset, lastPoint.lng + lngOffset)
}

// State for current active measurement
const measurementPoints = ref<L.LatLng[]>([])
const measurementPolyline = shallowRef<L.Polyline | null>(null)
const measurementMarkers = shallowRef<L.Marker[]>([])
const measurementDistanceTags = shallowRef<L.Marker[]>([])
const measurementAngleTags = shallowRef<L.Marker[]>([])
const measurementAngleArcs = shallowRef<L.Polyline[]>([])
const measurementLiveLine = shallowRef<L.Polyline | null>(null)
const measurementLiveLineHeading = shallowRef<L.Marker | null>(null)
const measurementDeletePopupVisible = ref<number | null>(null)
/**
 * Track delete popup for completed measurements
 */
const completedMeasurementDeletePopupVisible = ref<{
  /**
   *
   */
  completedIndex: number
  /**
   *
   */
  markerIndex: number
} | null>(null)

/**
 * Store for completed measurements (kept visible but non-interactive)
 */
interface CompletedMeasurement {
  /**
   *
   */
  points: L.LatLng[]
  /**
   *
   */
  polyline: L.Polyline
  /**
   *
   */
  markers: L.Marker[]
  /**
   *
   */
  distanceTags: L.Marker[]
  /**
   *
   */
  angleTags: L.Marker[]
  /**
   *
   */
  angleArcs: L.Polyline[]
}
const completedMeasurements = shallowRef<CompletedMeasurement[]>([])
const menuVisible = ref<boolean>(false)
const optionsDialogVisible = ref<boolean>(false)

/**
 * Maps unit systems to their corresponding distance display units
 */
const unitSystemToDisplayUnit: Record<UnitSystem, DistanceDisplayUnit> = {
  metric: DistanceDisplayUnit.Meters,
  imperial: DistanceDisplayUnit.Feet,
  nautical: DistanceDisplayUnit.NauticalMiles,
}

/**
 * Unit system item for selector dropdown
 */
interface UnitSystemItem {
  /**
   * Display title for the unit system
   */
  title: string
  /**
   * Unit system value
   */
  value: UnitSystem
}

/**
 * Unit system items for the selector dropdown
 */
const unitSystemItems: UnitSystemItem[] = [
  { title: unitPrettyName[unitSystemToDisplayUnit.metric], value: 'metric' },
  { title: unitPrettyName[unitSystemToDisplayUnit.imperial], value: 'imperial' },
  { title: unitPrettyName[unitSystemToDisplayUnit.nautical], value: 'nautical' },
]

// Computed properties for individual options (for v-model binding)
const localUnitSystem = computed({
  get: () => missionStore.measurementOptions.unitSystem,
  set: (value: UnitSystem) => {
    missionStore.measurementOptions = { ...missionStore.measurementOptions, unitSystem: value }
  },
})

const showDistanceTags = computed({
  get: () => missionStore.measurementOptions.showDistanceTags,
  set: (value: boolean) => {
    missionStore.measurementOptions = { ...missionStore.measurementOptions, showDistanceTags: value }
  },
})

const showAngleTags = computed({
  get: () => missionStore.measurementOptions.showAngleTags,
  set: (value: boolean) => {
    missionStore.measurementOptions = { ...missionStore.measurementOptions, showAngleTags: value }
  },
})

const tagSize = computed({
  get: () => missionStore.measurementOptions.tagSize,
  set: (value: number) => {
    missionStore.measurementOptions = { ...missionStore.measurementOptions, tagSize: value }
  },
})

const distanceTagColor = computed({
  get: () => missionStore.measurementOptions.distanceTagColor,
  set: (value: RgbaColor) => {
    missionStore.measurementOptions = { ...missionStore.measurementOptions, distanceTagColor: value }
    if (props.isActive) {
      updateMeasurementDisplay()
    }
  },
})

const angleTagColor = computed({
  get: () => missionStore.measurementOptions.angleTagColor,
  set: (value: RgbaColor) => {
    missionStore.measurementOptions = { ...missionStore.measurementOptions, angleTagColor: value }
    if (props.isActive) {
      updateMeasurementDisplay()
    }
  },
})

const lineColor = computed({
  get: () => missionStore.measurementOptions.lineColor,
  set: (value: RgbaColor) => {
    missionStore.measurementOptions = { ...missionStore.measurementOptions, lineColor: value }
    if (props.isActive) {
      updateMeasurementDisplay()
    }
  },
})

// Computed properties for report display
const hasEnoughPoints = computed(() => measurementPoints.value.length >= 2)

const totalDistance = computed(() => {
  if (!hasEnoughPoints.value) return 0
  let total = 0
  for (let i = 0; i < measurementPoints.value.length - 1; i++) {
    const dist = calculateHaversineDistance(
      [measurementPoints.value[i].lat, measurementPoints.value[i].lng],
      [measurementPoints.value[i + 1].lat, measurementPoints.value[i + 1].lng]
    )
    total += dist
  }
  return total
})

const segmentDistances = computed(() => {
  if (!hasEnoughPoints.value) return []
  const distances: number[] = []
  for (let i = 0; i < measurementPoints.value.length - 1; i++) {
    const dist = calculateHaversineDistance(
      [measurementPoints.value[i].lat, measurementPoints.value[i].lng],
      [measurementPoints.value[i + 1].lat, measurementPoints.value[i + 1].lng]
    )
    distances.push(dist)
  }
  return distances
})

const numSegments = computed(() => {
  return measurementPoints.value.length > 0 ? measurementPoints.value.length - 1 : 0
})

// Local unit conversion functions using units.ts
const localUnitConversion = computed(() => {
  const unitSystem = localUnitSystem.value
  return {
    convertDistance: (meters: number): string => formatDistance(meters, unitSystem),
    convertArea: (squareMeters: number): string => formatArea(squareMeters, unitSystem),
  }
})

const formattedTotalDistance = computed(() => {
  return hasEnoughPoints.value ? localUnitConversion.value.convertDistance(totalDistance.value) : '—'
})

const formattedAvgSegment = computed(() => {
  return hasEnoughPoints.value && numSegments.value > 0
    ? localUnitConversion.value.convertDistance(totalDistance.value / numSegments.value)
    : '—'
})

const formattedMin = computed(() => {
  return hasEnoughPoints.value && segmentDistances.value.length > 0
    ? localUnitConversion.value.convertDistance(Math.min(...segmentDistances.value))
    : '—'
})

const formattedMax = computed(() => {
  return hasEnoughPoints.value && segmentDistances.value.length > 0
    ? localUnitConversion.value.convertDistance(Math.max(...segmentDistances.value))
    : '—'
})

const formattedArea = computed(() => {
  if (measurementPoints.value.length < 3) return '—'
  const coords = measurementPoints.value.map((p) => [p.lat, p.lng] as WaypointCoordinates)
  const areaM2 = polygonAreaSquareMeters(coords)
  return localUnitConversion.value.convertArea(areaM2)
})

const formattedPerimeter = computed(() => {
  if (measurementPoints.value.length < 3) return '—'
  const first = measurementPoints.value[0]
  const last = measurementPoints.value[measurementPoints.value.length - 1]
  const closingDistance = calculateHaversineDistance([first.lat, first.lng], [last.lat, last.lng])
  const perimeter = totalDistance.value + closingDistance
  return localUnitConversion.value.convertDistance(perimeter)
})

const toggleMenu = (): void => {
  menuVisible.value = !menuVisible.value
}

// Close menu when clicking outside
const closeMenuOnOutsideClick = (e: MouseEvent): void => {
  const target = e.target as HTMLElement
  if (!target.closest('.measurement-report-menu-container')) {
    menuVisible.value = false
  }
}

watch(menuVisible, (visible) => {
  if (visible) {
    nextTick(() => {
      document.addEventListener('click', closeMenuOnOutsideClick)
    })
  } else {
    document.removeEventListener('click', closeMenuOnOutsideClick)
  }
})

// Finalize current measurement (make it non-interactive and add to completed)
const finalizeCurrentMeasurement = (): void => {
  const mapInstance = map.value
  if (!mapInstance) return

  // If there are points, finalize this measurement
  if (measurementPoints.value.length > 0 && measurementPolyline.value) {
    // Make all current markers non-interactive
    measurementMarkers.value.forEach((marker) => {
      marker.dragging?.disable()
      marker.options.interactive = false
    })

    // Store as completed measurement (keep polyline on map)
    completedMeasurements.value.push({
      points: [...measurementPoints.value],
      polyline: measurementPolyline.value,
      markers: [...measurementMarkers.value],
      distanceTags: [...measurementDistanceTags.value],
      angleTags: [...measurementAngleTags.value],
      angleArcs: [...measurementAngleArcs.value],
    })
  }

  // Reset current measurement state
  // Note: polyline is kept on map as part of completed measurement, so we just clear the reference
  measurementPoints.value = []
  measurementPolyline.value = null
  measurementMarkers.value = []
  measurementDistanceTags.value = []
  measurementAngleTags.value = []
  measurementAngleArcs.value = []
  if (measurementLiveLine.value) {
    mapInstance.removeLayer(measurementLiveLine.value)
    measurementLiveLine.value = null
  }
  if (measurementLiveLineHeading.value) {
    mapInstance.removeLayer(measurementLiveLineHeading.value)
    measurementLiveLineHeading.value = null
  }
  measurementDeletePopupVisible.value = null
}

// Update a completed measurement's display (polyline, tags, etc.)
const updateCompletedMeasurementDisplay = (completed: CompletedMeasurement): void => {
  const mapInstance = map.value
  if (!mapInstance) return

  // Update points from markers
  completed.points = completed.markers.map((marker) => marker.getLatLng())

  // Update polyline
  if (completed.polyline && completed.points.length >= 2) {
    completed.polyline.setLatLngs(completed.points)
    completed.polyline.setStyle({
      color: lineColorCss.value,
      opacity: lineColor.value.a,
    })
  }

  // Remove old tags
  completed.distanceTags.forEach((tag) => tag.remove())
  completed.distanceTags = []
  completed.angleTags.forEach((tag) => tag.remove())
  completed.angleTags = []
  completed.angleArcs.forEach((arc) => arc.remove())
  completed.angleArcs = []

  // Recreate distance tags
  if (showDistanceTags.value && completed.points.length >= 2) {
    for (let i = 0; i < completed.points.length - 1; i++) {
      const start = completed.points[i]
      const end = completed.points[i + 1]
      const distance = calculateHaversineDistance([start.lat, start.lng], [end.lat, end.lng])
      const formatted = localUnitConversion.value.convertDistance(distance)

      const midLat = (start.lat + end.lat) / 2
      const midLng = (start.lng + end.lng) / 2

      const tagStyle =
        `font-size: ${tagSize.value}px; background-color: ${distanceTagColorCss.value}; color: #fff; ` +
        `padding: ${tagPadding.value}; border-radius: ${tagBorderRadius.value};`
      const tag = L.marker([midLat, midLng], {
        icon: L.divIcon({
          className: 'measurement-distance-tag',
          html: `<div class="measurement-distance-pill" style="${tagStyle}">${formatted}</div>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        }),
      }).addTo(mapInstance)
      completed.distanceTags.push(tag)
    }
  }

  // Recreate angle tags and arcs
  if (showAngleTags.value && completed.points.length >= 3) {
    for (let i = 1; i < completed.points.length - 1; i++) {
      const prev = completed.points[i - 1]
      const curr = completed.points[i]
      const next = completed.points[i + 1]

      const incomingBearing = bearingBetween([prev.lat, prev.lng], [curr.lat, curr.lng])
      const outgoingBearing = bearingBetween([curr.lat, curr.lng], [next.lat, next.lng])
      const reverseIncomingBearing = (incomingBearing + 180) % 360
      const angle = deltaBearing(reverseIncomingBearing, outgoingBearing)

      const angleText = `${angle.toFixed(1)}°`

      const { arcCenterPoint } = drawAngleArc(prev, curr, next, angle)
      const arc = measurementAngleArcs.value[measurementAngleArcs.value.length - 1]
      if (arc) {
        measurementAngleArcs.value.pop()
        completed.angleArcs.push(arc)
      }

      if (arcCenterPoint) {
        const angleTagStyle =
          `font-size: ${tagSize.value}px; background-color: ${angleTagColorCss.value}; color: #fff; ` +
          `padding: ${tagPadding.value}; border-radius: ${tagBorderRadius.value};`
        const tag = L.marker([arcCenterPoint.lat, arcCenterPoint.lng], {
          icon: L.divIcon({
            className: 'measurement-angle-tag',
            html: `<div class="measurement-angle-pill" style="${angleTagStyle}">${angleText}</div>`,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          }),
        }).addTo(mapInstance)
        completed.angleTags.push(tag)
      }
    }
  }
}

// Remove a point from a completed measurement
const removeCompletedMeasurementPoint = (completedIndex: number, markerIndex: number): void => {
  const mapInstance = map.value
  if (!mapInstance) return

  const completed = completedMeasurements.value[completedIndex]
  if (!completed || markerIndex < 0 || markerIndex >= completed.points.length) return

  // If only 2 points left, remove the entire measurement
  if (completed.points.length === 2) {
    if (completed.polyline) mapInstance.removeLayer(completed.polyline)
    completed.markers.forEach((marker) => marker.remove())
    completed.distanceTags.forEach((tag) => tag.remove())
    completed.angleTags.forEach((tag) => tag.remove())
    completed.angleArcs.forEach((arc) => arc.remove())
    completedMeasurements.value.splice(completedIndex, 1)
    completedMeasurementDeletePopupVisible.value = null
    return
  }

  // Remove the marker
  const marker = completed.markers[markerIndex]
  if (marker) {
    mapInstance.removeLayer(marker)
    completed.markers.splice(markerIndex, 1)
  }

  // Remove the point
  completed.points.splice(markerIndex, 1)

  // Update display
  updateCompletedMeasurementDisplay(completed)

  // Re-attach delete button handlers to all remaining markers after display update
  if (props.isActive) {
    completed.markers.forEach((updatedMarker, idx) => {
      attachDeleteButtonHandler(updatedMarker, completedIndex, idx)
    })
  }

  completedMeasurementDeletePopupVisible.value = null
}

// Attach delete button handler to a marker
const attachDeleteButtonHandler = (marker: L.Marker, completedIndex: number, markerIndex: number): void => {
  const markerElement = marker.getElement()
  if (!markerElement) return

  const deleteButton = markerElement.querySelector('.delete-button') as HTMLElement
  if (!deleteButton) return

  // Remove any existing listeners by cloning
  const newDeleteButton = deleteButton.cloneNode(true) as HTMLElement
  deleteButton.parentNode?.replaceChild(newDeleteButton, deleteButton)

  newDeleteButton.addEventListener('click', (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    removeCompletedMeasurementPoint(completedIndex, markerIndex)
  })
}

// Make all completed measurements editable
const makeCompletedMeasurementsEditable = (): void => {
  completedMeasurements.value.forEach((completed, completedIndex) => {
    completed.markers.forEach((marker, markerIndex) => {
      marker.dragging?.enable()
      marker.options.interactive = true

      // Remove existing handlers and add new ones
      marker.off('drag')
      marker.off('dragend')
      marker.off('click')

      marker.on('drag', () => {
        const newLatlng = marker.getLatLng()
        completed.points[markerIndex] = newLatlng.clone()
        updateCompletedMeasurementDisplay(completed)
      })

      marker.on('dragend', () => {
        const newLatlng = marker.getLatLng()
        completed.points[markerIndex] = newLatlng.clone()
        updateCompletedMeasurementDisplay(completed)
      })

      // Attach delete button handler
      attachDeleteButtonHandler(marker, completedIndex, markerIndex)

      // Add mouseover/mouseout handlers for delete popup visibility
      const updateCompletedDeletePopupVisibility = (): void => {
        const popup = marker.getElement()?.querySelector('.delete-popup') as HTMLDivElement
        if (popup) {
          const isVisible =
            completedMeasurementDeletePopupVisible.value?.completedIndex === completedIndex &&
            completedMeasurementDeletePopupVisible.value?.markerIndex === markerIndex
          popup.style.display = isVisible ? 'block' : 'none'
        }
      }

      marker.on('mouseover', () => {
        updateCompletedDeletePopupVisibility()
      })

      marker.on('mouseout', () => {
        const currentPopup = completedMeasurementDeletePopupVisible.value
        if (
          !currentPopup ||
          currentPopup.completedIndex !== completedIndex ||
          currentPopup.markerIndex !== markerIndex
        ) {
          const popup = marker.getElement()?.querySelector('.delete-popup') as HTMLDivElement
          if (popup) popup.style.display = 'none'
        }
      })

      marker.on('click', (event: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(event.originalEvent)
        const deleteButton = (event.originalEvent?.target as HTMLElement)?.closest('.delete-button')

        if (deleteButton) {
          removeCompletedMeasurementPoint(completedIndex, markerIndex)
          L.DomEvent.preventDefault(event.originalEvent)
          return
        }

        const currentPopup = completedMeasurementDeletePopupVisible.value
        if (currentPopup?.completedIndex === completedIndex && currentPopup?.markerIndex === markerIndex) {
          completedMeasurementDeletePopupVisible.value = null
        } else {
          completedMeasurementDeletePopupVisible.value = { completedIndex, markerIndex }
        }

        // Update popup visibility
        updateCompletedDeletePopupVisibility()

        // Hide other popups
        completedMeasurements.value.forEach((otherCompleted, otherCompletedIndex) => {
          otherCompleted.markers.forEach((otherMarker, otherMarkerIndex) => {
            if (otherCompletedIndex !== completedIndex || otherMarkerIndex !== markerIndex) {
              const otherPopup = otherMarker.getElement()?.querySelector('.delete-popup') as HTMLDivElement
              if (otherPopup) otherPopup.style.display = 'none'
            }
          })
        })
      })
    })
  })
}

// Watch for active state changes
watch(
  () => props.isActive,
  (isActive) => {
    const mapInstance = map.value
    if (isActive) {
      // Finalize any existing measurement and start fresh
      if (measurementPoints.value.length > 0) {
        finalizeCurrentMeasurement()
      }
      // Make all completed measurements editable again
      makeCompletedMeasurementsEditable()
    } else {
      // Finalize current measurement when exiting
      finalizeCurrentMeasurement()
      // Make all completed measurements non-interactive
      completedMeasurements.value.forEach((completed) => {
        completed.markers.forEach((marker) => {
          marker.dragging?.disable()
          marker.options.interactive = false
        })
      })
      // Hide live line
      if (measurementLiveLine.value && mapInstance) {
        mapInstance.removeLayer(measurementLiveLine.value)
      }
      if (measurementLiveLineHeading.value && mapInstance) {
        mapInstance.removeLayer(measurementLiveLineHeading.value)
      }
      menuVisible.value = false
      measurementDeletePopupVisible.value = null
    }
  }
)

// Watch for zoom changes to update display
watch(
  () => props.zoom,
  () => {
    if (props.isActive) {
      updateMeasurementDisplay()
    }
  }
)

// Watch for unit system changes
watch(
  () => missionStore.userUnitSystem,
  () => {
    if (props.isActive) {
      updateMeasurementDisplay()
    }
  }
)

// Helper functions to convert color objects to CSS strings
const distanceTagColorCss = computed(() => {
  const c = distanceTagColor.value
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`
})

const angleTagColorCss = computed(() => {
  const c = angleTagColor.value
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`
})

const lineColorCss = computed(() => {
  const c = lineColor.value
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`
})

// Proportional padding and border radius for tags
// Base font-size: 12px, base padding: 4px 8px, base border-radius: 12px
const BASE_TAG_SIZE = 10
const tagScale = computed(() => tagSize.value / BASE_TAG_SIZE)

const tagPadding = computed(() => {
  const vertical = Math.round(2 * tagScale.value)
  const horizontal = Math.round(4 * tagScale.value)
  return `${vertical}px ${horizontal}px`
})

const tagBorderRadius = computed(() => {
  return `${Math.round(8 * tagScale.value)}px`
})

// Watch for option changes
watch(
  () => missionStore.measurementOptions,
  () => {
    if (props.isActive) {
      updateMeasurementDisplay()
    }
  },
  { deep: true }
)

const updateMeasurementLiveLine = (cursorLatlng: L.LatLng): void => {
  const mapInstance = map.value
  if (!mapInstance || measurementPoints.value.length === 0) return

  const lastPoint = measurementPoints.value[measurementPoints.value.length - 1]

  // Snap position if Alt is pressed
  const targetLatlng = isAltPressed.value ? calculateSnappedPosition(lastPoint, cursorLatlng) : cursorLatlng

  const liveLineColor = lineColor.value
  const liveLineOpacity = liveLineColor.a * 0.4
  if (!measurementLiveLine.value) {
    measurementLiveLine.value = L.polyline([lastPoint, targetLatlng], {
      color: lineColorCss.value,
      weight: 1.5,
      opacity: liveLineOpacity,
      interactive: false,
    }).addTo(mapInstance)
  } else {
    if (!mapInstance.hasLayer(measurementLiveLine.value)) {
      measurementLiveLine.value.addTo(mapInstance)
    }
    measurementLiveLine.value.setStyle({
      color: lineColorCss.value,
      opacity: liveLineOpacity,
    })
    measurementLiveLine.value.setLatLngs([lastPoint, targetLatlng])
  }

  // Calculate bearing and display heading with distance
  const bearing = bearingBetween([lastPoint.lat, lastPoint.lng], [targetLatlng.lat, targetLatlng.lng])
  const distanceMeters = calculateHaversineDistance(
    [lastPoint.lat, lastPoint.lng],
    [targetLatlng.lat, targetLatlng.lng]
  )

  // Calculate midpoint for heading label
  const midLat = (lastPoint.lat + targetLatlng.lat) / 2
  const midLng = (lastPoint.lng + targetLatlng.lng) / 2
  const midPoint = L.latLng(midLat, midLng)

  // Offset text 4px perpendicular to the line to avoid overlap
  // Convert start and end points to container points (pixels)
  const startContainerPoint = mapInstance.latLngToContainerPoint(lastPoint)
  const endContainerPoint = mapInstance.latLngToContainerPoint(targetLatlng)
  const midContainerPoint = mapInstance.latLngToContainerPoint(midPoint)

  // Calculate line vector in screen coordinates
  const dx = endContainerPoint.x - startContainerPoint.x
  const dy = endContainerPoint.y - startContainerPoint.y
  const lineLengthPixels = Math.sqrt(dx * dx + dy * dy)

  // Use full names for lines larger than 250px in screen size, abbreviations for smaller lines
  const useFullName = lineLengthPixels > 250
  const headingText = bearingToCompassDirection(bearing, useFullName)
  const formattedDistance = formatDistance(distanceMeters, missionStore.measurementOptions.unitSystem)
  const combinedText = `${formattedDistance} -- ${headingText}`

  // Calculate perpendicular vector (rotate 90° clockwise to get right side)
  // Perpendicular to (dx, dy) is (-dy, dx) for clockwise rotation
  const perpX = -dy / lineLengthPixels
  const perpY = dx / lineLengthPixels

  // Apply 4px offset in perpendicular direction
  const offsetDistance = -2 // pixels
  const offsetX = perpX * offsetDistance
  const offsetY = perpY * offsetDistance

  // Apply offset and convert back to lat/lng
  const offsetContainerPoint = L.point(midContainerPoint.x + offsetX, midContainerPoint.y + offsetY)
  const offsetLatLng = mapInstance.containerPointToLatLng(offsetContainerPoint)
  const offsetLat = offsetLatLng.lat
  const offsetLng = offsetLatLng.lng

  // Rotate text to match line direction
  // Convert bearing to CSS rotation:
  // - Bearing 0° = North (up), CSS 0° = right (east)
  // - Bearing 90° = East (right), CSS 90° = down (south)
  // - So CSS rotation = bearing - 90
  // - Flip text 180° in quadrants III and IV (180°-360°) for readability
  let cssRotation = bearing - 90
  if (bearing >= 180 && bearing < 360) {
    cssRotation += 180
  }

  // Create or update heading marker
  const headingStyle =
    `font-size: 10px; color: ${lineColorCss.value}; font-weight: bold; ` +
    `text-shadow: 1px 1px 2px rgba(0,0,0,0.8); white-space: nowrap; pointer-events: none; ` +
    `transform: rotate(${cssRotation}deg); transform-origin: center center;`
  const headingHtml = `<div style="${headingStyle}">${combinedText}</div>`

  if (!measurementLiveLineHeading.value) {
    measurementLiveLineHeading.value = L.marker([offsetLat, offsetLng], {
      icon: L.divIcon({
        className: 'measurement-live-heading',
        html: headingHtml,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      }),
      interactive: false,
    }).addTo(mapInstance)
  } else {
    if (!mapInstance.hasLayer(measurementLiveLineHeading.value)) {
      measurementLiveLineHeading.value.addTo(mapInstance)
    }
    measurementLiveLineHeading.value.setLatLng([offsetLat, offsetLng])
    const icon = measurementLiveLineHeading.value.getIcon() as L.DivIcon
    if (icon) {
      icon.options.html = headingHtml
      measurementLiveLineHeading.value.setIcon(icon)
    }
  }
}

const addMeasurementPoint = (latlng: L.LatLng): void => {
  const mapInstance = map.value
  if (!mapInstance) return

  const pointIndex = measurementPoints.value.length
  measurementPoints.value.push(latlng.clone())

  const marker = L.marker(latlng, {
    draggable: true,
    icon: L.divIcon({
      className: 'measurement-point-marker',
      html: `
        <div class="measurement-point-container">
          <div class="measurement-point"></div>
          <div class="delete-popup" style="display: none;">
            <button class="delete-button">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 4h12M4 4v10a2 2 0 002 2h4a2 2 0 002-2V4M6 4V2h4v2"
                      stroke="white" stroke-width="1.5"
                      stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      `,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    }),
  }).addTo(mapInstance)

  marker.on('drag', () => {
    const newLatlng = marker.getLatLng()
    measurementPoints.value[pointIndex] = newLatlng.clone()
    updateMeasurementDisplay()
  })

  marker.on('dragend', () => {
    const newLatlng = marker.getLatLng()
    measurementPoints.value[pointIndex] = newLatlng.clone()
    updateMeasurementDisplay()
  })

  const updateDeletePopupVisibility = (): void => {
    const target = marker
    const popup = target.getElement()?.querySelector('.delete-popup') as HTMLDivElement
    if (popup) {
      const isVisible = measurementDeletePopupVisible.value === pointIndex
      popup.style.display = isVisible ? 'block' : 'none'
    }
  }

  marker.on('mouseover', () => {
    updateDeletePopupVisibility()
  })

  marker.on('mouseout', () => {
    if (measurementDeletePopupVisible.value !== pointIndex) {
      const target = marker
      const popup = target.getElement()?.querySelector('.delete-popup') as HTMLDivElement
      if (popup) popup.style.display = 'none'
    }
  })

  marker.on('click', (event: L.LeafletMouseEvent) => {
    L.DomEvent.stopPropagation(event.originalEvent)
    const target = event.target as L.Marker
    const deleteButton = (event.originalEvent?.target as HTMLElement)?.closest('.delete-button')

    if (deleteButton) {
      removeMeasurementPoint(pointIndex)
      measurementDeletePopupVisible.value = null
      L.DomEvent.preventDefault(event.originalEvent)
      return
    }

    if (measurementDeletePopupVisible.value === pointIndex) {
      measurementDeletePopupVisible.value = null
    } else {
      measurementDeletePopupVisible.value = pointIndex
    }
    updateDeletePopupVisibility()
  })

  measurementMarkers.value.push(marker)
  updateMeasurementDisplay()
}

const removeMeasurementPoint = (index: number): void => {
  const mapInstance = map.value
  if (!mapInstance || index < 0 || index >= measurementPoints.value.length) return

  if (measurementPoints.value.length === 2) {
    clearMeasurement()
    return
  }

  const marker = measurementMarkers.value[index]
  if (marker) {
    mapInstance.removeLayer(marker)
    measurementMarkers.value.splice(index, 1)
  }

  measurementPoints.value.splice(index, 1)
  updateMeasurementDisplay()
}

const updateMeasurementDisplay = (): void => {
  const mapInstance = map.value
  if (!mapInstance) return

  const points = measurementPoints.value
  if (points.length === 0) {
    return
  }

  if (points.length >= 2) {
    if (!measurementPolyline.value) {
      measurementPolyline.value = L.polyline([], {
        color: lineColorCss.value,
        weight: 2,
        dashArray: '2, 4',
        opacity: lineColor.value.a,
      }).addTo(mapInstance)
    }
    measurementPolyline.value.setStyle({
      color: lineColorCss.value,
      opacity: lineColor.value.a,
    })
    measurementPolyline.value.setLatLngs(points)

    updateMeasurementDistanceTags()
    updateMeasurementAngles()
  }
}

const updateMeasurementDistanceTags = (): void => {
  const mapInstance = map.value
  if (!mapInstance) return

  measurementDistanceTags.value.forEach((tag) => tag.remove())
  measurementDistanceTags.value = []

  if (!showDistanceTags.value) return

  const points = measurementPoints.value
  if (points.length < 2) return

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i]
    const end = points[i + 1]
    const distance = calculateHaversineDistance([start.lat, start.lng], [end.lat, end.lng])
    const formatted = localUnitConversion.value.convertDistance(distance)

    const midLat = (start.lat + end.lat) / 2
    const midLng = (start.lng + end.lng) / 2

    const tagStyle =
      `font-size: ${tagSize.value}px; background-color: ${distanceTagColorCss.value}; color: #fff; ` +
      `padding: ${tagPadding.value}; border-radius: ${tagBorderRadius.value};`
    const tag = L.marker([midLat, midLng], {
      icon: L.divIcon({
        className: 'measurement-distance-tag',
        html: `<div class="measurement-distance-pill" style="${tagStyle}">${formatted}</div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      }),
    }).addTo(mapInstance)
    measurementDistanceTags.value.push(tag)
  }
}

const updateMeasurementAngles = (): void => {
  const mapInstance = map.value
  if (!mapInstance) return

  measurementAngleTags.value.forEach((tag) => tag.remove())
  measurementAngleTags.value = []
  measurementAngleArcs.value.forEach((arc) => arc.remove())
  measurementAngleArcs.value = []

  const points = measurementPoints.value
  if (points.length < 3) return

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const next = points[i + 1]

    const incomingBearing = bearingBetween([prev.lat, prev.lng], [curr.lat, curr.lng])
    const outgoingBearing = bearingBetween([curr.lat, curr.lng], [next.lat, next.lng])
    const reverseIncomingBearing = (incomingBearing + 180) % 360
    const angle = deltaBearing(reverseIncomingBearing, outgoingBearing)

    const angleText = `${angle.toFixed(1)}°`

    const { arcCenterPoint } = drawAngleArc(prev, curr, next, angle)

    if (arcCenterPoint && showAngleTags.value) {
      const angleTagStyle =
        `font-size: ${tagSize.value}px; background-color: ${angleTagColorCss.value}; color: #fff; ` +
        `padding: ${tagPadding.value}; border-radius: ${tagBorderRadius.value};`
      const tag = L.marker([arcCenterPoint.lat, arcCenterPoint.lng], {
        icon: L.divIcon({
          className: 'measurement-angle-tag',
          html: `<div class="measurement-angle-pill" style="${angleTagStyle}">${angleText}</div>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        }),
      }).addTo(mapInstance)
      measurementAngleTags.value.push(tag)
    }
  }
}

const drawAngleArc = (
  prev: L.LatLng,
  curr: L.LatLng,
  next: L.LatLng,
  angle: number
): {
  /**
))))) *
)))))
   */
  arcCenterPoint: L.LatLng | null
} => {
  const mapInstance = map.value
  if (!mapInstance) return { arcCenterPoint: null }

  const incomingBearing = bearingBetween([prev.lat, prev.lng], [curr.lat, curr.lng])
  const outgoingBearing = bearingBetween([curr.lat, curr.lng], [next.lat, next.lng])

  const mapZoom = mapInstance.getZoom()
  const radiusMeters = Math.max(15, Math.min(50, 1000 / mapZoom))

  const dist1 = calculateHaversineDistance([prev.lat, prev.lng], [curr.lat, curr.lng])
  const dist2 = calculateHaversineDistance([curr.lat, curr.lng], [next.lat, next.lng])
  const minDist = Math.min(dist1, dist2)
  const arcRadius = Math.min(radiusMeters, minDist * 0.3)

  const reverseIncomingBearing = (incomingBearing + 180) % 360
  const rawDiff = outgoingBearing - reverseIncomingBearing
  const normalizedDiff = ((rawDiff + 540) % 360) - 180

  let startBearing: number
  let endBearing: number

  if (normalizedDiff >= 0) {
    startBearing = reverseIncomingBearing
    endBearing = reverseIncomingBearing + angle
  } else {
    startBearing = reverseIncomingBearing - angle
    endBearing = reverseIncomingBearing
  }

  const arcPoints: L.LatLng[] = []
  const steps = Math.max(8, Math.floor(angle / 2))
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    let bearing = startBearing + (endBearing - startBearing) * t
    bearing = ((bearing % 360) + 360) % 360

    const rad = (bearing * Math.PI) / 180
    const latOffset = (arcRadius / 111320) * Math.cos(rad)
    const lngOffset = (arcRadius / (111320 * Math.cos((curr.lat * Math.PI) / 180))) * Math.sin(rad)
    arcPoints.push(L.latLng(curr.lat + latOffset, curr.lng + lngOffset))
  }

  const arcColor = lineColor.value
  const arcOpacity = arcColor.a * 0.3
  const arc = L.polyline(arcPoints, {
    color: lineColorCss.value,
    weight: 1,
    opacity: arcOpacity,
  }).addTo(mapInstance)
  measurementAngleArcs.value.push(arc)

  const centerIndex = Math.floor(arcPoints.length / 2)
  const arcCenterPoint = arcPoints[centerIndex] || null

  return { arcCenterPoint }
}

const handleMenuAction = (action: string): void => {
  menuVisible.value = false
  handleMeasurementReportMenuAction(action)
}

const handleMeasurementReportMenuAction = (action: string): void => {
  switch (action) {
    case 'options':
      optionsDialogVisible.value = true
      break
    case 'clear':
      clearMeasurement()
      break
    case 'export':
      exportMeasurements()
      break
  }
}

const exportMeasurements = (): void => {
  const points = measurementPoints.value
  if (points.length < 2) return

  const data = {
    points: points.map((p) => ({ lat: p.lat, lng: p.lng })),
    totalDistance: totalDistance.value,
    area:
      measurementPoints.value.length >= 3
        ? polygonAreaSquareMeters(points.map((p) => [p.lat, p.lng] as WaypointCoordinates))
        : 0,
    segments: segmentDistances.value,
    timestamp: new Date().toISOString(),
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `measurements-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const clearMeasurement = (): void => {
  const mapInstance = map.value
  if (!mapInstance) return

  // Clear current measurement
  measurementPoints.value = []
  if (measurementPolyline.value) {
    mapInstance.removeLayer(measurementPolyline.value)
    measurementPolyline.value = null
  }
  measurementMarkers.value.forEach((marker) => marker.remove())
  measurementMarkers.value = []
  measurementDistanceTags.value.forEach((tag) => tag.remove())
  measurementDistanceTags.value = []
  measurementAngleTags.value.forEach((tag) => tag.remove())
  measurementAngleTags.value = []
  measurementAngleArcs.value.forEach((arc) => arc.remove())
  measurementAngleArcs.value = []
  if (measurementLiveLine.value) {
    mapInstance.removeLayer(measurementLiveLine.value)
    measurementLiveLine.value = null
  }
  if (measurementLiveLineHeading.value) {
    mapInstance.removeLayer(measurementLiveLineHeading.value)
    measurementLiveLineHeading.value = null
  }
  measurementDeletePopupVisible.value = null

  // Clear all completed measurements
  completedMeasurements.value.forEach((completed) => {
    if (completed.polyline) mapInstance.removeLayer(completed.polyline)
    completed.markers.forEach((marker) => marker.remove())
    completed.distanceTags.forEach((tag) => tag.remove())
    completed.angleTags.forEach((tag) => tag.remove())
    completed.angleArcs.forEach((arc) => arc.remove())
  })
  completedMeasurements.value = []
}

// Handle Alt key state for angle snapping
const handleKeyDown = (e: KeyboardEvent): void => {
  if (e.altKey) {
    isAltPressed.value = true
  }
}

const handleKeyUp = (e: KeyboardEvent): void => {
  if (e.key === 'Alt') {
    isAltPressed.value = false
  }
}

const handleWindowBlur = (): void => {
  isAltPressed.value = false
}

// Setup key listeners
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
  window.addEventListener('blur', handleWindowBlur)
})

// Cleanup on unmount
onBeforeUnmount(() => {
  document.removeEventListener('click', closeMenuOnOutsideClick)
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
  window.removeEventListener('blur', handleWindowBlur)
  clearMeasurement()
})

const handleMapClick = (e: L.LeafletMouseEvent): boolean => {
  const mapInstance = map.value
  if (!props.isActive) return false
  if (!mapInstance) {
    console.warn('MeasurementTool: Map instance not available')
    return false
  }

  const clickPoint = mapInstance.latLngToContainerPoint(e.latlng)
  const thresholdInPixels = 10

  // Check current measurement markers
  for (let i = 0; i < measurementMarkers.value.length; i++) {
    const marker = measurementMarkers.value[i]
    const markerPoint = mapInstance.latLngToContainerPoint(marker.getLatLng())
    const distance = clickPoint.distanceTo(markerPoint)
    if (distance < thresholdInPixels) {
      // Check if delete button was clicked
      const markerElement = marker.getElement()
      if (markerElement) {
        const deleteButton = (e.originalEvent?.target as HTMLElement)?.closest('.delete-button')
        if (deleteButton) {
          removeMeasurementPoint(i)
          return true
        }
      }

      measurementDeletePopupVisible.value = measurementDeletePopupVisible.value === i ? null : i
      const popup = marker.getElement()?.querySelector('.delete-popup') as HTMLDivElement
      if (popup) {
        popup.style.display = measurementDeletePopupVisible.value === i ? 'block' : 'none'
      }
      // Hide completed measurement popups
      completedMeasurementDeletePopupVisible.value = null
      completedMeasurements.value.forEach((completed) => {
        completed.markers.forEach((m) => {
          const p = m.getElement()?.querySelector('.delete-popup') as HTMLDivElement
          if (p) p.style.display = 'none'
        })
      })
      return true
    }
  }

  // Check completed measurement markers
  for (let completedIndex = 0; completedIndex < completedMeasurements.value.length; completedIndex++) {
    const completed = completedMeasurements.value[completedIndex]
    for (let markerIndex = 0; markerIndex < completed.markers.length; markerIndex++) {
      const marker = completed.markers[markerIndex]
      const markerPoint = mapInstance.latLngToContainerPoint(marker.getLatLng())
      const distance = clickPoint.distanceTo(markerPoint)
      if (distance < thresholdInPixels) {
        // Check if delete button was clicked
        const markerElement = marker.getElement()
        if (markerElement) {
          const deleteButton = (e.originalEvent?.target as HTMLElement)?.closest('.delete-button')
          if (deleteButton) {
            removeCompletedMeasurementPoint(completedIndex, markerIndex)
            return true
          }
        }

        const currentPopup = completedMeasurementDeletePopupVisible.value
        if (currentPopup?.completedIndex === completedIndex && currentPopup?.markerIndex === markerIndex) {
          completedMeasurementDeletePopupVisible.value = null
        } else {
          completedMeasurementDeletePopupVisible.value = { completedIndex, markerIndex }
        }
        const popup = marker.getElement()?.querySelector('.delete-popup') as HTMLDivElement
        if (popup) {
          const isVisible =
            completedMeasurementDeletePopupVisible.value?.completedIndex === completedIndex &&
            completedMeasurementDeletePopupVisible.value?.markerIndex === markerIndex
          popup.style.display = isVisible ? 'block' : 'none'
        }
        // Hide current measurement popup
        measurementDeletePopupVisible.value = null
        measurementMarkers.value.forEach((m) => {
          const p = m.getElement()?.querySelector('.delete-popup') as HTMLDivElement
          if (p) p.style.display = 'none'
        })
        // Hide other completed measurement popups
        completedMeasurements.value.forEach((otherCompleted, otherCompletedIndex) => {
          otherCompleted.markers.forEach((otherMarker, otherMarkerIndex) => {
            if (otherCompletedIndex !== completedIndex || otherMarkerIndex !== markerIndex) {
              const otherPopup = otherMarker.getElement()?.querySelector('.delete-popup') as HTMLDivElement
              if (otherPopup) otherPopup.style.display = 'none'
            }
          })
        })
        return true
      }
    }
  }

  // Hide all popups if clicking elsewhere
  measurementDeletePopupVisible.value = null
  measurementMarkers.value.forEach((marker) => {
    const popup = marker.getElement()?.querySelector('.delete-popup') as HTMLDivElement
    if (popup) popup.style.display = 'none'
  })
  completedMeasurementDeletePopupVisible.value = null
  completedMeasurements.value.forEach((completed) => {
    completed.markers.forEach((marker) => {
      const popup = marker.getElement()?.querySelector('.delete-popup') as HTMLDivElement
      if (popup) popup.style.display = 'none'
    })
  })

  // Remove live line and heading immediately when clicking to add a point
  if (measurementLiveLine.value && mapInstance) {
    mapInstance.removeLayer(measurementLiveLine.value)
    measurementLiveLine.value = null
  }
  if (measurementLiveLineHeading.value && mapInstance) {
    mapInstance.removeLayer(measurementLiveLineHeading.value)
    measurementLiveLineHeading.value = null
  }

  // Add the measurement point (snap if Alt is pressed)
  const targetLatlng =
    isAltPressed.value && measurementPoints.value.length > 0
      ? calculateSnappedPosition(measurementPoints.value[measurementPoints.value.length - 1], e.latlng)
      : e.latlng
  addMeasurementPoint(targetLatlng)
  return true
}

const handleMapMouseMove = (e: L.LeafletMouseEvent): boolean => {
  if (props.isActive && measurementPoints.value.length > 0) {
    updateMeasurementLiveLine(e.latlng)
    return true
  }
  return false
}

// Expose methods for parent component
defineExpose({
  addMeasurementPoint,
  removeMeasurementPoint,
  clearMeasurement,
  updateMeasurementLiveLine,
  handleMapClick,
  handleMapMouseMove,
})
</script>

<style scoped>
.measurement-total-distance-tag {
  position: absolute;
  bottom: 310px;
  right: 16px;
  padding: 6px 15px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  font-size: 14px;
  line-height: 1.6;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  pointer-events: auto;
  min-width: 250px;
}

.measurement-report {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.measurement-report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.measurement-report-title {
  font-size: 14px;
  font-weight: 600;
}

.measurement-report-menu-container {
  position: relative;
}

.measurement-report-menu-button {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  margin-right: -5px;
  transition: background-color 0.2s;
}

.measurement-report-menu-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.measurement-report-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 4px 0;
  min-width: 160px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.measurement-report-menu-item {
  display: block;
  width: 100%;
  padding: 8px 16px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.9);
  text-align: left;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s;
}

.measurement-report-menu-item:hover:not(.disabled) {
  background-color: rgba(255, 255, 255, 0.1);
}

.measurement-report-menu-item.disabled {
  color: rgba(255, 255, 255, 0.4);
  cursor: not-allowed;
  opacity: 0.5;
}

.measurement-report-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.measurement-report-label {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
}

.measurement-report-value {
  font-weight: 600;
  color: #fff;
  font-size: 13px;
  text-align: right;
}
</style>

<style>
/* Global styles for measurement elements (added to map container) */
.measurement-point-marker {
  background: none;
  border: none;
}

.measurement-point-container {
  position: relative;
}

.measurement-point-container:hover .delete-popup {
  cursor: pointer;
}

.measurement-point {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  border: 2px solid #ffffff;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
}

.delete-popup {
  position: absolute;
  top: -25px;
  left: -25px;
  background-color: rgba(239, 68, 68, 0.8);
  border-radius: 50%;
  padding: 3px 4px 5px 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-button {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  padding: 0;
}

.measurement-distance-tag {
  background: none;
  border: none;
  pointer-events: none;
}

.measurement-distance-pill {
  transform: translate(-50%, -50%);
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(6px);
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.measurement-angle-tag {
  background: none;
  border: none;
  pointer-events: none;
}

.measurement-angle-pill {
  transform: translate(-50%, -50%);
  display: inline-block;
  background: rgba(83, 110, 114, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(16px);
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
