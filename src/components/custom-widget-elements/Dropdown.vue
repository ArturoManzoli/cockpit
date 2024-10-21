<template>
  <div
    class="flex w-full"
    :class="
      widgetStore.elementToShowOnDrawer?.hash === element.hash && widgetStore.editingMode
        ? 'bg-[#00000010] '
        : 'border-0'
    "
    :style="{ width: '100%', justifyContent: element.options.layout?.align }"
  >
    <div :style="{ width: element.options.layout?.width + 'px' }">
      <v-select
        v-model="selectedOption"
        :items="options"
        item-title="name"
        item-value="value"
        theme="dark"
        density="compact"
        variant="filled"
        hide-details
        class="text-white"
        :class="{ 'pointer-events-none': widgetStore.editingMode }"
        @change="handleSelection"
      >
      </v-select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, toRefs, watch } from 'vue'

import {
  deleteCockpitActionVariable,
  listenCockpitActionVariable,
  setCockpitActionVariableData,
  unlistenCockpitActionVariable,
} from '@/libs/actions/data-lake'
import { useWidgetManagerStore } from '@/stores/widgetManager'
import { CustomWidgetElementOptions, CustomWidgetElementType, SelectorOption } from '@/types/widgets'

const widgetStore = useWidgetManagerStore()

const props = defineProps<{
  /**
   * Element instance
   */
  element: CustomWidgetElementOptions[CustomWidgetElementType.Dropdown]
}>()

const element = toRefs(props).element
const selectedOption = ref<SelectorOption | undefined>(props.element.options.lastSelected || undefined)

const options = computed(() => {
  return (
    element.value.options.layout?.selectorOptions.map((option) => ({
      ...option,
    })) || []
  )
})

watch(selectedOption, (newValue) => {
  widgetStore.updateElementOptions(element.value.hash, {
    ...element.value.options,
    lastSelected: newValue,
  })
})

const handleSelection = (value: string | number | boolean): void => {
  if (element.value.options.actionParameter?.id) {
    setCockpitActionVariableData(element.value.options.actionParameter.id, value)
  }
}

onMounted(() => {
  if (!element.value.options || Object.keys(element.value.options).length === 0) {
    widgetStore.updateElementOptions(element.value.hash, {
      cockpitAction: undefined,
      actionParameter: undefined,
      lastSelected: { name: '', value: '' },
      layout: {
        selectorOptions: [{ name: '', value: '' }],
        align: 'start',
        width: 200,
      },
    })
  }
  if (element.value.options.actionParameter) {
    listenCockpitActionVariable(element.value.options.actionParameter.name, (value) => {
      selectedOption.value = options.value.find((option) => option.value === value)
    })
  }
  if (element.value.options.lastSelected?.name !== '') {
    selectedOption.value = element.value.options.lastSelected
  }
})

onUnmounted(() => {
  if (element.value.options.actionParameter) {
    unlistenCockpitActionVariable(element.value.options.actionParameter.name)
    deleteCockpitActionVariable(element.value.options.actionParameter.name)
  }
})
</script>

<style scoped>
.select-container {
  width: 100%;
  align-items: center;
  flex-direction: row;
}
</style>
