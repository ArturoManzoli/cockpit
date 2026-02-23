import type { Map } from 'leaflet'
import { Ref, ref } from 'vue'

const mapLayer = ref<Map | undefined>()

// Composable to access the map layer instance
export const useMapLayer = (): {
  /**
   * Map layer reference
   */
  mapLayer: Ref<Map | undefined>
} => {
  return {
    mapLayer,
  }
}

// Set the map layer reference
export const setMapLayer = (map: Map | undefined): void => {
  mapLayer.value = map
}
