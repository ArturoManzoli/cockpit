<template>
  <v-dialog v-model="isVisible" class="dialog">
    <div class="glass-modal">
      <slot></slot>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  /**
   * Visibility state of the dialog
   */
  isVisible: boolean
}>()

const isVisible = ref(props.isVisible)

watch(
  () => props.isVisible,
  (newVal) => {
    isVisible.value = newVal
  }
)

watch(isVisible, (newVal) => {
  console.log('Visibility changed:', newVal)
})
</script>

<style scoped>
.dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  --v-overlay-opacity: 0.1;
  z-index: 100;
}

.glass-modal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: auto;
  height: auto;
  border: 1px solid #cbcbcb33;
  border-radius: 12px;
  background-color: #4f4f4f33;
  backdrop-filter: blur(15px);
  box-shadow: 0px 4px 4px 0px #0000004c, 0px 8px 12px 6px #00000026;
  z-index: 100;
}
</style>
