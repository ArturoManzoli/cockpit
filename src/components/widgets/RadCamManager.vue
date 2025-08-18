<template>
  <div
    ref="widgetBase"
    class="w-full rounded-lg overflow-hidden"
    :class="[isWrapped ? 'h-[50px]' : 'h-full']"
    :width="canvasSize.width"
    :height="canvasSize.height"
    :style="interfaceStore.globalGlassMenuStyles"
  >
    <div class="flex flex-col justify-between h-auto pt-2 cursor-pointer">
      <div class="flex justify-between w-full h-[25px] px-2">
        <v-icon class="cursor-grab opacity-40" @mousedown="enableMovingOnDrag" @mouseup="disableMovingOnDrag">
          mdi-drag
        </v-icon>
        <div>RadCam Manager</div>
        <v-btn
          :icon="isWrapped ? 'mdi-chevron-down' : 'mdi-chevron-up'"
          variant="text"
          size="36"
          class="mt-[-6px]"
          @click="toggleWrapContainer"
        />
      </div>
      <div v-show="!isWrapped" class="px-1 pt-2">
        <iframe
          ref="iframe"
          :src="`http://${vehicleStore.globalAddress}/extensionv2/radcammanager/`"
          frameborder="0"
          class="w-full h-[665px]"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { computed, onMounted, ref, toRefs, watch } from 'vue'

import { useAppInterfaceStore } from '@/stores/appInterface'
import { useMainVehicleStore } from '@/stores/mainVehicle'
import { useWidgetManagerStore } from '@/stores/widgetManager'
import { CustomWidget, Widget } from '@/types/widgets'

const vehicleStore = useMainVehicleStore()
const widgetStore = useWidgetManagerStore()
const interfaceStore = useAppInterfaceStore()

const props = defineProps<{
  /**
   * Widget instance
   */
  widget: CustomWidget
}>()
const widget = toRefs(props).widget

const currentWidget = ref<Widget>(props.widget)
const widgetBase = ref<HTMLElement | null>(null)
const isWrapped = ref(false)
const wrapDirection = ref<'left' | 'right'>('right')
const containerRef = ref<HTMLElement | null>(null)

const setStandardSizes = (): void => {
  isWrapped.value = !isWrapped.value
  if (isWrapped.value) {
    widget.value.size = {
      width: 0.3616453407714491,
      height: 0.041284618602176325,
    }
  } else {
    widget.value.size = {
      width: 0.3616453407714491,
      height: 0.7172753373374253,
    }
  }
}

const toggleWrapContainer = (): void => {
  setStandardSizes()
}

const updateWrapDirection = (): void => {
  if (widgetBase.value) {
    const widgetRect = widgetBase.value.getBoundingClientRect()
    const screenWidth = window.innerWidth
    const widgetCenterX = widgetRect.left + widgetRect.width / 2

    if (widgetCenterX < screenWidth / 2) {
      wrapDirection.value = 'left'
    } else {
      wrapDirection.value = 'right'
    }
  }
}

const enableMovingOnDrag = (): void => {
  widgetStore.allowMovingAndResizing(currentWidget.value.hash, true)
  window.addEventListener('mouseup', disableMovingOnDrag)
  window.addEventListener('dragend', disableMovingOnDrag)
}

const disableMovingOnDrag = (): void => {
  updateWrapDirection()
  widgetStore.allowMovingAndResizing(currentWidget.value.hash, false)
  window.removeEventListener('mouseup', disableMovingOnDrag)
  window.removeEventListener('dragend', disableMovingOnDrag)
}

const { width: windowWidth } = useWindowSize()
const canvasSize = computed(() => ({
  width: currentWidget.value.size.width * windowWidth.value,
  height: currentWidget.value.size.height * windowWidth.value,
}))

watch(
  () => widgetStore.editingMode,
  (newValue) => {
    if (newValue === true) {
      disableMovingOnDrag()
      isWrapped.value = false
    }
  }
)

onMounted(() => {
  updateWrapDirection()
  window.addEventListener('resize', updateWrapDirection)
  containerRef.value = document.querySelector('.main')
  disableMovingOnDrag()
  setStandardSizes()
})
</script>

<style scoped>
.cursor-col-resize {
  cursor: col-resize;
}

.cursor-col-resize:hover,
.cursor-col-resize:active {
  background-color: #ffffff55;
}
</style>
