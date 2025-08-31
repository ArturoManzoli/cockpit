<template>
  <div
    v-if="modelValue"
    class="absolute right-4 bottom-28 z-[210] rounded-[10px] px-3 py-2"
    :style="[interfaceStore.globalGlassMenuStyles, { width: '250px' }]"
  >
    <p class="text-sm font-semibold mb-1">Mission statistics</p>
    <v-icon icon="mdi-cog" class="absolute top-2 right-2 cursor-pointer" size="14" @click="openSettings" />
    <div class="text-xs leading-6">
      <div class="flex justify-between">
        <span>Length</span><span>{{ formattedMissionLength }}</span>
      </div>
      <div class="flex justify-between">
        <span>ETA</span><span>{{ formattedETA }}</span>
      </div>
      <div class="flex justify-between">
        <span>Energy</span><span>{{ formattedEnergy }}</span>
      </div>
      <div class="flex justify-between">
        <span>Coverage</span><span>{{ formattedArea }}</span>
      </div>
    </div>
  </div>
  <v-dialog v-model="isSettingsOpen" persistent max-width="400px">
    <template #activator="{ on, attrs }"></template>
    <v-card :style="interfaceStore.globalGlassMenuStyles">
      <v-card-title class="text-lg font-semibold">Mission Statistics Settings</v-card-title>
      <v-card-text>
        <p class="mb-4 text-sm">Configure the mission statistics display settings below.</p>
        <!-- Add your settings controls here -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Units</label>
          <select class="w-full border border-gray-300 rounded px-2 py-1">
            <option>Metric (km, m)</option>
            <option>Imperial (mi, ft)</option>
          </select>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Display Options</label>
          <div class="flex items-center mb-2">
            <input id="show-energy" type="checkbox" class="mr-2" />
            <label for="show-energy" class="text-sm">Show Energy Consumption</label>
          </div>
          <div class="flex items-center">
            <input id="show-coverage" type="checkbox" class="mr-2" />
            <label for="show-coverage" class="text-sm">Show Area Coverage</label>
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="isSettingsOpen = false">Cancel</v-btn>
        <v-btn color="primary" @click="isSettingsOpen = false">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useMissionStats } from '@/composables/useMissionStatistics'
import { useAppInterfaceStore } from '@/stores/appInterface'

const props = defineProps<{
  /**
cccccccccccccccccccccccccccc *
cccccccccccccccccccccccccccc
   */
  modelValue: boolean
}>()
defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const interfaceStore = useAppInterfaceStore()
const { formattedMissionLength, formattedETA, formattedEnergy, formattedArea } = useMissionStats()

const isSettingsOpen = ref(false)

const openSettings = (): void => {
  isSettingsOpen.value = true
}
</script>
