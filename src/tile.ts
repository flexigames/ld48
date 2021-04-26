import {sample, times} from 'lodash'
import {segmentCount} from './const'
import {Color, Tile} from './types'

export function createTile(): Tile {
  const newTile = {
    segments: times(segmentCount).map(() => ({color: undefined})),
    offset: 0
  }
  return fillRandomly(newTile)
}

// mutates
export function fillRandomly(tile: Tile): Tile {
  while (tile.segments.every((segment) => !segment.color)) {
    tile.segments = tile.segments.map(() => ({
      color: sample([
        Color.Red,
        Color.Yellow,
        Color.Green,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      ])
    }))
  }

  while (!tile.segments[0].color) {
    let lastSegment = tile.segments[0]
    tile.segments = [...tile.segments.slice(1, segmentCount), lastSegment]
  }

  return tile
}

export function cloneRotated(tile: Tile, offset?: number): Tile {
  const segmentCopy = [...tile.segments]
  const newTile = createTile()
  for (let i = 0; i < segmentCount; i++) {
    newTile.segments[i] =
      segmentCopy[(i + segmentCount - (offset ?? tile.offset)) % segmentCount]
  }
  return newTile
}
