import {Floor, Tile} from './types'
import {times} from 'lodash'
import {segmentCount} from './const'

export function createFloor(): Floor {
  return {
    segments: times(segmentCount).map(() => ({color: undefined})),
    isCompleted: false
  }
}

export function canBePlaced(floor: Floor, tile: Tile): boolean {
  for (let i = 0; i < segmentCount; i++) {
    if (tile.segments[i]?.color && floor.segments[i]?.color) {
      return false
    }
  }
  return true
}

// mutates
export function resetSize(floor: Floor): Floor {
  floor.segments = floor.segments.map((segment) => ({
    ...segment,
    size: null
  }))
  return floor
}

// doesn't clone everything, still needed?
export function clone(floor: Floor): Floor {
  const newFloor = createFloor()
  newFloor.segments = [...floor.segments]
  return newFloor
}

export function place(floor: Floor, tile: Tile): Floor {
  const newFloor = clone(floor)
  if (!canBePlaced(floor, tile)) return newFloor

  for (let i = 0; i < segmentCount; i++) {
    newFloor.segments[i].color =
      floor.segments[i]?.color ?? tile.segments[i]?.color
  }

  return newFloor
}

// mutates
export function wasJustCompleted(floor: Floor): boolean {
  if (floor?.isCompleted) return false

  floor.isCompleted = true
  return floor.segments.every((segment) => segment.color)
}
