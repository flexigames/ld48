import React, {useState, useEffect} from 'react'
import styled from 'styled-components'
import {keyBy, sample, times} from 'lodash'

const segmentCount = 6;

export default function App() {
  const [currentTile, setCurrentTile] = useState<TileData>()

  const [score, setScore] = useState(0)

  const [floors, setFloors] = useState([
    new FloorData(),
    new FloorData(),
    new FloorData(),
    new FloorData(),
  ])

  const [tiles, setTiles] = useState([
    new TileData(),
    new TileData(),
    new TileData()
  ])

  const [groups, setGroups] = useState<Group[]>()

  return <Main>
      depthscraper
      <Column>
        {floors.map((floor, index) => 
          <Floor floorData={floor} onClick={(floor) => onPlace(index, floor)} onHover={(index) => onHover(floor, index)} />
        )}
      </Column>
      <Tiles>      <Score>{score}</Score>{tiles.map(tileData => <Tile onClick={setCurrentTile} data={tileData} selected={currentTile === tileData} />)}</Tiles>
    </Main>

  function onHover(floor: FloorData, offset: number) {
      for (const floor of floors) {
        floor.tilePreview = null
      }
      currentTile.offset = offset
      floor.tilePreview = currentTile.cloneRotated()
      setFloors([...floors])
  }

  function onPlace(index: number, selectedFloor: FloorData) {
    if (!currentTile) return
    
    const rotatedTile = currentTile.cloneRotated()

    if (!selectedFloor.canBePlaced(rotatedTile)) return

    const newFloors = floors.map((floor, secondIndex) => secondIndex === index ? selectedFloor.place(rotatedTile) : floor).map(it => it.resetSize())

    for (const floor of newFloors) {
      if (floor.wasJustCompleted()) {
        newFloors.push(new FloorData())
      }
    }


    const newGroups = calculateGroups(newFloors)

    const groupByPosition = keyBy(groups, group => `${group.position.x}-${group.position.y}`)
    const newGroupByPosition = keyBy(newGroups, group => `${group.position.x}-${group.position.y}`)
    for (const positionKey in newGroupByPosition) {
      if (newGroupByPosition[positionKey].count > (groupByPosition[positionKey]?.count ?? 0)) {
        setScore(score => score + newGroupByPosition[positionKey].count)
      }
    }

    setGroups(newGroups)
    for (const group of newGroups) {
      const floor = newFloors[group.position.y]
      floor.segments[group.position.x].size = group.count
    }

    setFloors(newFloors)

    setTiles(tiles.map(tile => tile === currentTile ?  new TileData() : tile))

    setCurrentTile(null)
  }
}

type FloorProps = {
  floorData: FloorData;
  onClick?: (floorData: FloorData) => any;
  onHover?: (index: number) => any;
}

function Floor({floorData, onClick, onHover}: FloorProps) {
  const previewTile = floorData?.tilePreview?.segments ?? {}

  const placingIssue = floorData?.tilePreview && !floorData.canBePlaced(floorData?.tilePreview)

  return <SegmentContainer hasIssue={placingIssue} onClick={() => onClick?.(floorData)}>
    {floorData.segments.map(({color, size}, index) => <ColorSquare onMouseEnter={() => onHover(index)} someColor={previewTile[index]?.color ?? color}>{size ?? ''}</ColorSquare>)}
  </SegmentContainer>
}

type TileProps = {
  data: TileData;
  onClick?: (data: TileData) => any;
  selected: boolean;
}


function Tile({data, onClick, selected}: TileProps) {
  return <SegmentContainer onClick={() => onClick?.(data)} selected={selected}>
    {data.segments.map(({color}) => <ColorSquare someColor={color}/>)}
  </SegmentContainer>
}

const SegmentContainer = styled.div<{selected?: boolean, hasIssue?: boolean}>`
  display: flex;
  flex-direction: row;
  text-align: center;
  align-items: center;
  gap: 6px;
  border-radius: 4px;
  ${({hasIssue}) =>  `opacity: ${hasIssue ? '0.5' : '1'};`}
  ${({selected}) =>  `border: 4px solid ${selected ? 'black' : 'transparent'};`}
`

enum Color {
  Red = 1,
  Yellow,
  Green
}


class TileData {
  segments: Segment[];
  offset = 0;

  constructor() {
    this.segments = times(segmentCount).map(n => ({color: undefined}));
    this.fillRandomly();
  }

  fillRandomly() {
    while (this.segments.every(segment => !segment.color)) {
      this.segments = this.segments.map(() => ({color : sample([Color.Red, Color.Yellow, Color.Green, undefined, undefined, undefined, undefined, undefined, undefined])}))
    }

    while (!this.segments[0].color) {
      let lastSegment = this.segments[0]
      this.segments = [...(this.segments.slice(1, segmentCount)), lastSegment]
    }

    return this;
  }

  cloneRotated() {
    const segmentCopy = [...this.segments]
    const newTile = new TileData()
    for (let i = 0; i < segmentCount; i++) {
      newTile.segments[i] = segmentCopy[(i + segmentCount - this.offset) % segmentCount]
    }
    return newTile
  }
}

type Segment = {
  color?: Color;
  size?: number;
}

class FloorData {
  segments:  Segment[];
  tilePreview?: TileData;
  isCompleted: boolean;

  constructor() {
    this.segments = times(segmentCount).map(n => ({color: undefined}));
  }

  canBePlaced(tile: TileData) {
    for (let i = 0; i < segmentCount; i++) {
      if (tile.segments[i].color && this.segments[i].color) {
        return false
      }
    }
    return true
  }

  resetSize() {
    this.segments = this.segments.map(segment => ({...segment, size: null}))
    return  this
  }

  clone() {
    const newFloorData = new FloorData()
    newFloorData.segments = [...this.segments]
    return newFloorData
  }

  place(tile: TileData) {
    const newFloorData = this.clone()
    if (!this.canBePlaced(tile)) return newFloorData

    for (let i = 0; i < segmentCount; i++) {
      newFloorData.segments[i].color = this.segments[i].color ?? tile.segments[i].color
    }
  
    return newFloorData
  }

  wasJustCompleted() {
    if (this.isCompleted) return false
  
    this.isCompleted = true
    return this.segments.every(segment => segment.color);
  }
}

interface ColorSquareProps {
  someColor: Color;
}



const ColorSquare = styled.div<ColorSquareProps>`
  width: 100px;
  height: 100px;
  margin: 2px;
  border-radius: 2px;
  align-items: center;
  justify-content: center;
  display: flex;
  background-color: ${({someColor}: {someColor: Color}) => colorToHtmlColor(someColor)};
`

const empty = new FloorData();

function colorToHtmlColor(color: Color) {
  if (color === Color.Red) return '#FF4136';
  if (color === Color.Yellow) return '#FFDC00';
  if (color === Color.Green) return '#3D9970';
  return '#272727';
}

const Column = styled.div`
  display: flex;
  flex-direction: column;
`

const Main = styled.div`
  display: flex;
  align-items: center;
  margin: 16px;

  color: #2b2b24;
  font-size: 70px;
  flex-direction: column;
  gap: 40px;
`

type Group = {
  id: number;
  position: {x: number, y: number};
  color: Color;
  count: number;
}

function calculateGroups(floors: FloorData[]) {
  const grid = floors.map(floor => floor.segments.map(({color}) => ({color, group: null})))
  let nextGroup = 1;

  const groups: Record<number, Group> = {}

  for (let y in grid) {
    for (let x in grid[y]) {
      if (!grid[y][x].color) continue;
      if (grid[y][x].group) continue;

      const currentGroup = nextGroup
      groups[currentGroup] = {
        id: currentGroup,
        position: {
          x: Number(x),
          y: Number(y)
        },
        color: grid[y][x].color,
        count: 0
      }
      nextGroup++
    
      const cellColor = grid[y][x].color
    
      setGroupForSameNeighbors(cellColor, currentGroup, Number(x), Number(y))
    }
  }


  return Object.values(groups)

  function setGroupForSameNeighbors(cellColor: Color, currentGroup: number, x: number, y: number) {
    if (grid[y][x].group) return
  
    grid[y][x].group = currentGroup
    groups[currentGroup].count++
  
    const neighborUp = grid[y - 1]?.[x]
    if (neighborUp?.color === cellColor) {
      setGroupForSameNeighbors(cellColor, currentGroup, x, y - 1)
    }
    const neigborDown = grid[y + 1]?.[x]
    if (neigborDown?.color === cellColor) {
      setGroupForSameNeighbors(cellColor, currentGroup, x, y + 1)
    }

    const neigborRight = grid[y][x+1]
    if (neigborRight?.color === cellColor) {
      setGroupForSameNeighbors(cellColor, currentGroup, x + 1, y)
    }

    const neigborLeft = grid[y][x-1]
    if (neigborLeft?.color === cellColor) {
      setGroupForSameNeighbors(cellColor, currentGroup, x - 1, y)
    }
  }
}

const Tiles = styled(Column)`
  position: fixed;
  right: -50px;
  bottom: -100px;
  transform: scale(0.5);
  display: flex;
  align-items: center;
`

const Score = styled.div`
  margin-bottom: 16px;
  font-size: 200px;
`