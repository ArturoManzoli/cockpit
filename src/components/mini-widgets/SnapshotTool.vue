<template>
  <div
    ref="recorderWidget"
    class="flex justify-around pl-1 pr-[3px] py-1 text-center text-white rounded-lg w-[70px] h-9 align-center bg-slate-800/60"
  >
    <v-menu v-model="isSnapshotMenuOpen" :location="menuLocation" offset="4" transition="fade-transition">
      <template #activator="{ props }">
        <div v-bind="props" class="flex flex-col items-center justify-around pl-1 pr-2">
          <v-icon icon="mdi-menu-up" class="text-[22px] -mr-3 -ml-2 -mb-1 opacity-80 cursor-pointer" size="22" />
          <v-icon :icon="snapshotTypeIcon" class="text-[22px] -mr-3 -ml-2 mb-1 cursor-pointer opacity-60" size="14" />
        </div>
      </template>

      <v-list density="compact" class="pa-0 text-white rounded-md" :style="interfaceStore.globalGlassMenuStyles">
        <v-list-item title="Video feed" @click="handleSelectSnapshotType('video')">
          <template #append>
            <v-icon size="22" icon="mdi-video" />
          </template>
        </v-list-item>
        <v-divider />
        <v-list-item @click="handleSelectSnapshotType('workspace')">
          <template #append>
            <v-icon size="19" icon="mdi-monitor" />
          </template>
          Cockpit work area
        </v-list-item>
        <v-divider />
        <v-list-item title="Timed snapshot" @click="handleSelectSnapshotType('timed')">
          <template #append> <v-icon size="20" icon="mdi-timer-outline" /> </template>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-divider vertical />
    <v-icon icon="mdi-camera" class="mb-[-2px]" size="32" @click="handleTakeSnapshot" />
  </div>
  <v-dialog v-model="widgetStore.miniWidgetManagerVars(miniWidget.hash).configMenuOpen" width="auto">
    <div
      class="flex flex-col items-center p-2 px-4 pt-1 m-5 rounded-md gap-y-4"
      :style="interfaceStore.globalGlassMenuStyles"
    >
      <p class="text-xl font-semibold m-4">Snapshot preferences</p>
      <v-select
        v-model="nameSelectedStream"
        :items="namesAvailableStreams"
        density="compact"
        label="Stream to capture"
        variant="outlined"
        no-data-text="No streams available."
        hide-details
        theme="dark"
        class="w-[90%]"
        @update:model-value="(val) => updateCurrentStream(val)"
      />
      <v-select
        :model-value="timedSnapshotTarget"
        label="Timed snapshot target"
        :items="['Selected streams', 'Cockpit work area']"
        density="compact"
        variant="outlined"
        no-data-text="No options available."
        hide-details
        theme="dark"
        class="w-[90%] mt-2"
        @update:model-value="(val) => (timedSnapshotTarget = val)"
      />
      <div class="flex w-full justify-end items-center mt-4">
        <v-btn
          class="w-auto text-uppercase"
          variant="text"
          @click="widgetStore.miniWidgetManagerVars(miniWidget.hash).configMenuOpen = false"
        >
          Close
        </v-btn>
      </div>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onBeforeMount, onBeforeUnmount, ref, toRefs, watch } from 'vue'

import { useInteractionDialog } from '@/composables/interactionDialog'
import { isEqual, sleep } from '@/libs/utils'
import { useAppInterfaceStore } from '@/stores/appInterface'
import { useVideoStore } from '@/stores/video'
import { useWidgetManagerStore } from '@/stores/widgetManager'
import type { MiniWidget } from '@/types/widgets'

const { showDialog } = useInteractionDialog()
const interfaceStore = useAppInterfaceStore()
const widgetStore = useWidgetManagerStore()
const videoStore = useVideoStore()

const props = defineProps<{
  /**
   * Configuration of the widget
   */
  miniWidget: MiniWidget
}>()
const miniWidget = toRefs(props).miniWidget

const { namessAvailableAbstractedStreams: namesAvailableStreams } = storeToRefs(videoStore)
const recorderWidget = ref()
const isLoadingStream = ref(false)
const mediaStream = ref<MediaStream | undefined>()
const selectedExternalId = ref<string | undefined>()
const snapshotTypeIcon = ref<'mdi-video' | 'mdi-monitor' | 'mdi-timer-outline'>('mdi-video')
const snapshotType = ref<'video' | 'workspace' | 'timed'>('video')
const isSnapshotMenuOpen = ref<boolean>(false)
const timedSnapshotTarget = ref<'Selected streams' | 'Cockpit work area'>('Selected streams')
const nameSelectedStreams = ref<string[]>([])
const nameSelectedStream = computed<string | undefined>({
  get: () => nameSelectedStreams.value[0],
  set: (val) => {
    nameSelectedStreams.value = val ? [val] : []
  },
})

const menuLocation = computed<'top' | 'bottom'>(() => {
  if (!recorderWidget.value) return 'bottom'
  const rect = recorderWidget.value.getBoundingClientRect()
  return rect.top > window.innerHeight / 2 ? 'top' : 'bottom'
})

window.addEventListener('resize', () => {
  menuLocation.value
})

const flashEffect = async (): Promise<void> => {
  const flashOverlay = document.createElement('div')
  flashOverlay.style.position = 'fixed'
  flashOverlay.style.top = '0'
  flashOverlay.style.left = '0'
  flashOverlay.style.width = '100%'
  flashOverlay.style.height = '100%'
  flashOverlay.style.backgroundColor = 'black'
  flashOverlay.style.opacity = '0'
  flashOverlay.style.transition = 'opacity 0.1s ease'
  flashOverlay.style.zIndex = '9999'

  document.body.appendChild(flashOverlay)

  void flashOverlay.offsetWidth
  flashOverlay.style.opacity = '0.4'
  await new Promise((resolve) => setTimeout(resolve, 50))
  flashOverlay.style.opacity = '0'
  await new Promise((resolve) => setTimeout(resolve, 100))
  document.body.removeChild(flashOverlay)
}

const handleTakeSnapshot = (): void => {
  isSnapshotMenuOpen.value = false
  flashEffect()
}

const handleSelectSnapshotType = (type: 'video' | 'workspace' | 'timed'): void => {
  snapshotType.value = type
  isSnapshotMenuOpen.value = false
  switch (type) {
    case 'video':
      snapshotTypeIcon.value = 'mdi-video'
      break
    case 'workspace':
      snapshotTypeIcon.value = 'mdi-monitor'
      break
    case 'timed':
      snapshotTypeIcon.value = 'mdi-timer-outline'
      break
  }
}

const externalStreamId = computed(() => selectedExternalId.value)

watch(
  () => videoStore.streamsCorrespondency,
  () => (mediaStream.value = undefined),
  { deep: true }
)

onBeforeMount(async () => {
  // Set initial widget options if they don't exist
  if (Object.keys(miniWidget.value.options).length === 0) {
    miniWidget.value.options = {
      internalStreamName: undefined as string | undefined,
    }
  }
  nameSelectedStream.value = miniWidget.value.options.internalStreamName

  if (nameSelectedStream.value) {
    selectedExternalId.value = videoStore.externalStreamId(nameSelectedStream.value)
  }
})

watch(nameSelectedStream, () => {
  miniWidget.value.options.internalStreamName = nameSelectedStream.value
  mediaStream.value = undefined
})

watch(
  () => videoStore.streamsCorrespondency,
  (newStreamsCorrespondency) => {
    if (!selectedExternalId.value) return

    const matchingStream = newStreamsCorrespondency.find((stream) => stream.externalId === selectedExternalId.value)

    if (matchingStream) {
      if (nameSelectedStream.value !== matchingStream.name) {
        nameSelectedStream.value = matchingStream.name
      }
    } else {
      // The externalId no longer exists; handle accordingly
      nameSelectedStream.value = undefined
      selectedExternalId.value = undefined
    }
  },
  { deep: true }
)

watch(nameSelectedStream, (newName) => {
  selectedExternalId.value = newName ? videoStore.externalStreamId(newName) : undefined
  miniWidget.value.options.internalStreamName = newName
  mediaStream.value = undefined
})

// eslint-disable-next-line jsdoc/require-jsdoc
function assertStreamIsSelectedAndAvailable(
  selectedStream: undefined | string
): asserts selectedStream is NonNullable<undefined | string> {
  nameSelectedStream.value = selectedStream

  if (nameSelectedStream.value === undefined) {
    showDialog({ message: 'No stream selected.', variant: 'error' })
    return
  }

  if (namesAvailableStreams.value.includes(nameSelectedStream.value)) return

  const errorMsg = `The selected stream is not available. Please check its source or select another stream.`
  showDialog({ message: errorMsg, variant: 'error' })
  throw new Error(errorMsg)
}

const updateCurrentStream = async (internalStreamName: string | undefined): Promise<void> => {
  assertStreamIsSelectedAndAvailable(internalStreamName)

  mediaStream.value = undefined
  isLoadingStream.value = true

  let millisPassed = 0
  const timeStep = 100
  const waitingTime = 3000
  while (isLoadingStream.value && millisPassed < waitingTime) {
    // @ts-ignore: The media stream can (and probably will) get defined as we selected a stream
    isLoadingStream.value = mediaStream.value === undefined || !mediaStream.value.active
    await sleep(timeStep)
    millisPassed += timeStep
  }

  if (isLoadingStream.value) {
    showDialog({ message: 'Could not load media stream.', variant: 'error' })
    return
  }

  miniWidget.value.options.internalStreamName = internalStreamName
}

let streamConnectionRoutine: ReturnType<typeof setInterval> | undefined = undefined

if (widgetStore.isRealMiniWidget(miniWidget.value.hash)) {
  streamConnectionRoutine = setInterval(() => {
    // If the video recording widget is cold booted, assign the first stream to it
    if (miniWidget.value.options.internalStreamName === undefined && !namesAvailableStreams.value.isEmpty()) {
      miniWidget.value.options.internalStreamName = namesAvailableStreams.value[0]
      nameSelectedStream.value = miniWidget.value.options.internalStreamName
    }

    // If the stream name is defined, try to connect the widget to the MediaStream
    if (externalStreamId.value !== undefined) {
      const updatedMediaStream = videoStore.getMediaStream(miniWidget.value.options.internalStreamName)
      // If the widget is not connected to the MediaStream, try to connect it
      if (!isEqual(updatedMediaStream, mediaStream.value)) {
        mediaStream.value = updatedMediaStream
      }
    }
  }, 1000)
}
onBeforeUnmount(() => clearInterval(streamConnectionRoutine))
</script>
