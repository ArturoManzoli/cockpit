import { onUnmounted, reactive } from 'vue'
import { App, createApp } from 'vue'

import InteractionDialogComponent from '@/components/InteractionDialog.vue'
import vuetify from '@/plugins/vuetify'
import { DialogActions } from '@/types/general'

/**
 * Options to configure the interaction dialog.
 */
interface DialogOptions {
  /**
   * The message to display in the dialog.
   * @type {string}
   */
  message: string

  /**
   * The variant type of the dialog (e.g., 'info', 'warning', 'error', 'success').
   * @type {string}
   */
  variant: string

  /**
   * The title of the dialog.
   * @type {string}
   * @optional
   */
  title?: string

  /**
   * The actions to display in the dialog.
   * Each action should be an object containing text, size, color, class, disabled, and action properties.
   * @type {DialogActions[]}
   * @optional
   */
  actions?: DialogActions[]

  /**
   * The maximum width of the dialog in pixels.
   * @type {number}
   * @optional
   */
  maxWidth?: number
}

let resolveFn: (value?: unknown) => void
let rejectFn: (reason?: any) => void

/**
 * Provides methods to control the interaction dialog.
 * @returns {object} - An object containing the showDialog and closeDialog methods.
 */
export function useInteractionDialog(): {
  /**
   * Shows the dialog with the provided options.
   * @param {DialogOptions} options - Options to configure the dialog.
   * @returns {Promise<any>} - A promise that resolves or rejects based on user action.
   */
  showDialog: (options: DialogOptions) => Promise<any>
  /**
   * Closes the dialog.
   * @returns {void}
   */
  closeDialog: () => void
} {
  const dialogProps = reactive<
    DialogOptions & {
      /**
       * Indicates whether the dialog should be shown.
       * @type {boolean}
       */
      showDialog: boolean
    }
  >({
    message: '',
    variant: '',
    title: '',
    actions: [],
    maxWidth: 600,
    showDialog: false,
  })

  let dialogApp: App<Element> | null = null

  const mountDialog = (): void => {
    const mountPoint = document.createElement('div')
    document.body.appendChild(mountPoint)
    dialogApp = createApp(InteractionDialogComponent, {
      ...dialogProps,
      onConfirmed: () => {
        if (resolveFn) resolveFn({ isConfirmed: true })
      },
      onDismissed: () => {
        if (rejectFn) rejectFn({ isConfirmed: false })
      },
    })
    dialogApp.use(vuetify)
    dialogApp.mount(mountPoint)
  }

  const showDialog = (options: DialogOptions): Promise<any> => {
    return new Promise((resolve, reject) => {
      Object.assign(dialogProps, options, { showDialog: true })
      resolveFn = resolve
      rejectFn = reject
      mountDialog()
    })
  }

  const closeDialog = (): void => {
    dialogProps.showDialog = false
    if (dialogApp) {
      dialogApp.unmount()
      dialogApp = null
    }
  }

  onUnmounted(() => {
    if (dialogApp) {
      dialogApp.unmount()
    }
  })

  return { showDialog, closeDialog }
}
