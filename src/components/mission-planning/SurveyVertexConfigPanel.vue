<template>
  <div
    class="flex flex-col h-full min-h-0 w-full justify-start"
    :style="[interfaceStore.globalGlassMenuStyles, { boxShadow: '-6px 0 8px -2px #00000033' }]"
  >
    <div class="flex flex-col flex-1 min-h-0">
      <ExpansiblePanel
        mark-expanded
        compact
        elevation-effect
        no-bottom-divider
        darken-content
        invert-chevron
        :is-expanded="true"
        class="flex flex-col flex-1 min-h-0"
      >
        <template #title>
          <p class="ml-10 text-center text-[13px] font-normal">
            {{ vertexIndexDisplay }}
          </p>
        </template>

        <template #content>
          <div class="flex flex-col flex-1 min-h-0">
            <div
              v-if="selectedVertex"
              class="flex flex-col justify-center w-full items-center px-2 my-2 mb-2 bg-[#EEEEEE22] text-white rounded-bl-md rounded-br-md"
            >
              <div class="flex w-full gap-x-4 my-[4px] justify-between text-[12px] text-center mb-[2px]">
                <p class="w-[50px] text-start">Latitude:</p>
                <input
                  :value="editableLat"
                  class="text-right w-[130px] mt-[2px] bg-transparent h-[15px] border-transparent focus:outline-none text-xs"
                  @input="onLatInput"
                />
                <p class="w-[20px]">°</p>
              </div>

              <v-divider class="border-white/20 my-1 w-full" />

              <div class="flex w-full gap-x-4 mt-[4px] justify-between text-[12px] text-center mb-[5px]">
                <p class="w-[50px] text-start">Longitude:</p>
                <input
                  :value="editableLng"
                  class="text-right w-[130px] mt-[2px] bg-transparent h-[15px] border-transparent focus:outline-none text-xs"
                  @input="onLngInput"
                />
                <p class="w-[20px]">°</p>
              </div>
            </div>

            <div v-else class="px-3 py-2 text-white/60 text-[12px]">
              Select a polygon vertex to edit its coordinates.
            </div>
          </div>
        </template>
      </ExpansiblePanel>
    </div>

    <div v-if="selectedVertex" class="flex flex-col mt-auto">
      <v-btn
        class="bg-[#00000077] text-white ma-2"
        variant="plain"
        size="small"
        prepend-icon="mdi-delete"
        @click="handleRemove"
      >
        Delete vertex
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import type L from 'leaflet'
import { computed, ref, watch } from 'vue'

import ExpansiblePanel from '@/components/ExpansiblePanel.vue'
import { useAppInterfaceStore } from '@/stores/appInterface'
import { SurveyVertexType } from '@/types/mission'

const props = defineProps<{
  /**
   * Selected vertex to edit
   */
  selectedVertex: L.LatLng | undefined
  /**
   * The index of the vertex to edit
   */
  vertexIndex: number
}>()

const emit = defineEmits<{
  (e: 'updateVertex', payload: SurveyVertexType): void
  (e: 'removeVertex', index: number): void
  (e: 'close'): void
}>()

const interfaceStore = useAppInterfaceStore()

const editableLat = ref<string>('')
const editableLng = ref<string>('')

const vertexIndexDisplay = computed(() => `Vertex ${props.vertexIndex + 1} parameters`)

watch(
  () => props.selectedVertex,
  (newVertex) => {
    if (!newVertex) return
    editableLat.value = newVertex.lat.toString()
    editableLng.value = newVertex.lng.toString()
  },
  { immediate: true }
)

const onLatInput = (event: Event): void => {
  const input = event.target as HTMLInputElement
  editableLat.value = input.value
  commitCoordinates()
}

const onLngInput = (event: Event): void => {
  const input = event.target as HTMLInputElement
  editableLng.value = input.value
  commitCoordinates()
}

const commitCoordinates = (): void => {
  const lat = parseFloat(editableLat.value)
  const lng = parseFloat(editableLng.value)

  if (Number.isNaN(lat) || Number.isNaN(lng)) return

  emit('updateVertex', {
    index: props.vertexIndex,
    lat,
    lng,
  })
}

const handleRemove = (): void => {
  emit('removeVertex', props.vertexIndex)
}
</script>
