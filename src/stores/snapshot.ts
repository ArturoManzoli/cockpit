import { BlobReader, BlobWriter, ZipWriter } from '@zip.js/zip.js'
import { format } from 'date-fns'
import saveAs from 'file-saver'
import { defineStore } from 'pinia'

import { useInteractionDialog } from '@/composables/interactionDialog'
import { useBlueOsStorage } from '@/composables/settingsSyncer'
import { isElectron } from '@/libs/utils'
import { snapshotStorage, videoStorage } from '@/libs/videoStorage'
import { StorageDB } from '@/types/general'
import { SnapshotType } from '@/types/snapshot'
import { DownloadProgressCallback, FileDescriptor } from '@/types/video'

import { useVideoStore } from './video'

declare global {
  /**
   *
   */
  interface Window {
    /**
     *
     */
    electronAPI?: {
      /**
       *
       */
      captureWorkspace(rect?: Electron.Rectangle): Promise<Uint8Array>
    }
  }
}

export const useSnapshotStore = defineStore('snapshot', () => {
  const videoStore = useVideoStore()
  const { showDialog } = useInteractionDialog()

  const zipMultipleFiles = useBlueOsStorage('cockpit-zip-multiple-snapshot-files', false)

  const captureStreamFrame = async (streamName: string): Promise<Blob> => {
    const streamInfo = videoStore.streamsCorrespondency.find((stream) => stream.name === streamName)
    if (!streamInfo?.externalId) {
      throw new Error('streamInfo.externalId is undefined')
    }
    const mediaStream = videoStore.getMediaStream(streamInfo.externalId)
    if (!mediaStream) throw new Error(`Stream '${streamInfo?.externalId}' not found`)

    const video = document.createElement('video')
    video.srcObject = mediaStream
    video.playsInline = true
    video.muted = true
    video.style.display = 'none'
    document.body.appendChild(video)

    await video.play()
    const track = mediaStream.getVideoTracks()[0]
    const { width = video.videoWidth, height = video.videoHeight } = track.getSettings()
    video.width = width
    video.height = height

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get 2D context')
    ctx.drawImage(video, 0, 0, width, height)

    video.pause()
    document.body.removeChild(video)

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))))
    })
  }

  // Ask the user to share their workspace once
  let captureStream: MediaStream | null = null
  let captureVideo: HTMLVideoElement | null = null

  const captureWorkspaceWebBlob = async (): Promise<Blob> => {
    if (!captureStream) {
      captureStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
    }

    if (!captureVideo) {
      captureVideo = document.createElement('video')
      captureVideo.srcObject = captureStream
      captureVideo.style.display = 'none'
      document.body.appendChild(captureVideo)

      await new Promise<void>((resolve) => {
        captureVideo!.onloadedmetadata = () => {
          captureVideo!.play()
          captureVideo!.width = captureVideo!.videoWidth
          captureVideo!.height = captureVideo!.videoHeight
          resolve()
        }
      })
    }

    const workArea = document.querySelector<HTMLElement>('#app')
    if (!workArea) throw new Error('Work area element not found')

    const { x, y, width, height } = workArea.getBoundingClientRect()

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')

    ctx.drawImage(captureVideo, x, y, width, height, 0, 0, width, height)

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to convert canvas to Blob'))
      })
    })
  }

  const captureWorkspaceElectron = async (): Promise<Blob> => {
    const workArea = document.querySelector<HTMLElement>('#app')
    if (!workArea) throw new Error('Work area element not found')
    const { x, y, width, height } = workArea.getBoundingClientRect()
    const rect: Electron.Rectangle = {
      x: Math.floor(x),
      y: Math.floor(y),
      width: Math.floor(width),
      height: Math.floor(height),
    }
    const pngBuffer = await window.electronAPI!.captureWorkspace(rect)
    return new Blob([pngBuffer], { type: 'image/png' })
  }

  const captureStreamSnapshotBlob = async (streamName: string): Promise<Blob> => {
    const response = await fetch(
      `http://192.168.1.22/mavlink-camera-manager/thumbnail?source=/dev/video2&quality=100&target_height=720`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch thumbnail snapshot')
    }
    return await response.blob()
  }

  const snapshotFilename = (type: SnapshotType, streamName: string): string => {
    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss')
    return `${type}_${streamName}_${timestamp}.jpeg`
  }

  const takeSnapshot = async (type: SnapshotType, streamName: string): Promise<void> => {
    let blob: Blob

    if (type === 'workspace') {
      if (isElectron() && window.electronAPI) {
        // ↪︎ on Electron: native capture
        blob = await captureWorkspaceElectron()
      } else {
        // ↪︎ in Chrome: screen‐capture from stream
        blob = await captureWorkspaceWebBlob()
      }
    } else if (type === 'video') {
      if (streamName === '' || streamName === undefined) {
        throw new Error('Stream name must be provided for stream snapshots.')
      }
      blob = await captureStreamFrame(streamName)
      console.log('🚀 ~ blob:', blob)
    }

    const filename = snapshotFilename(type, streamName === '' ? 'workspace' : streamName)
    await snapshotStorage.setItem(filename, blob)

    // — verify it persisted —
    const keys = await snapshotStorage.keys()
    console.log('Stored snapshot keys:', keys)

    const stored = await snapshotStorage.getItem(filename)
    if (stored) {
      console.log(`✅ Retrieved “${filename}” (${stored.size} bytes)`, stored)
    } else {
      console.warn(`⚠️ No item found under "${filename}"!`)
    }
  }

  const createZipAndDownload = async (
    files: FileDescriptor[],
    zipFilename: string,
    progressCallback?: DownloadProgressCallback
  ): Promise<void> => {
    const zipWriter = new ZipWriter(new BlobWriter('application/zip'), { level: 0 })
    const zipAddingPromises = files.map(({ filename, blob }) => {
      zipWriter.add(filename, new BlobReader(blob), { onprogress: progressCallback })
    })
    Promise.all(zipAddingPromises)
    const blob = await zipWriter.close()
    saveAs(blob, zipFilename)
  }

  const downloadFiles = async (
    db: StorageDB | LocalForage,
    keys: string[],
    shouldZip = false,
    zipFilenamePrefix = 'Cockpit-Snapshot-Files',
    progressCallback?: DownloadProgressCallback
  ): Promise<void> => {
    console.log('🚀 ~ keys:', keys)
    const maybeFiles = await Promise.all(
      keys.map(async (key) => ({
        blob: await db.getItem(key),
        filename: key,
      }))
    )
    console.log('🚀 ~ maybeFiles:', maybeFiles)
    /* eslint-disable jsdoc/require-jsdoc  */
    const files = maybeFiles.filter((file): file is { blob: Blob; filename: string } => file.blob !== undefined)

    if (files.length === 0) {
      showDialog({ message: 'No files found.', variant: 'error' })
      return
    }

    if (shouldZip) {
      await createZipAndDownload(files, `${zipFilenamePrefix}.zip`, progressCallback)
    } else {
      files.forEach(({ blob, filename }) => saveAs(blob, filename))
    }
  }

  const downloadFilesFromSnapshotDB = async (
    fileNames: string[],
    progressCallback?: DownloadProgressCallback
  ): Promise<void> => {
    console.debug(`Downloading files from the snapshot database: ${fileNames.join(', ')}`)
    if (zipMultipleFiles.value) {
      const ZipFilename = fileNames.length > 1 ? 'Cockpit-Snapshot-Capturing' : 'Cockpit-Snapshot-Capturing'
      await downloadFiles(snapshotStorage, fileNames, true, ZipFilename, progressCallback)
    } else {
      await downloadFiles(snapshotStorage, fileNames)
    }
  }

  return { snapshotStorage, captureStreamSnapshotBlob, downloadFilesFromSnapshotDB, snapshotFilename, takeSnapshot }
})
