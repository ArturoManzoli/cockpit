/**
 * Snapshot tool types
 */
export type SnapshotType = 'workspace' | 'timed' | 'video'

/**
 * Snapshot File descriptor
 */
export interface SnapshotFileDescriptor {
  /**
   * Snapshot content
   */
  blob: Blob
  /**
   * Filename of the snapshot
   */
  filename: string
}

/**
 *
 */
export interface SnapshotLibraryFile extends SnapshotFileDescriptor {
  /**
   * Type of the snapshot
   */
  type: SnapshotType
  /**
   * Name of the stream or workspace from which the snapshot was taken
   */
  streamName: string
  /**
   * Date when the snapshot was taken
   */
  date: Date
}
