export type Segment = {
  color?: Color
  size?: number
  representative?: boolean
}

export type Floor = {
  segments: Segment[]
  tilePreview?: Tile
  isCompleted: boolean
}

export type Tile = {
  segments: Segment[]
  offset: number
}

export enum Color {
  Red = 1,
  Yellow,
  Green
}
