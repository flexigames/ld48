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
    new FloorData()
  ])

  const [tiles, setTiles] = useState([
    new TileData(),
    new TileData(),
    new TileData()
  ])

  const [groups, setGroups] = useState<Group[]>()

  useScroll()

  return <Main>
     {score}
      <Column>
        {floors.map((floor, index) => 
          <Floor floorData={floor} onClick={(floor) => onPlace(index, floor)} onHover={() => {
            for (const floor of floors) {
              floor.tilePreview = null
            }
            floor.tilePreview = currentTile
            setFloors([...floors])
          }} />
        )}
      </Column>
      <Column>{tiles.map(tileData => <Tile onClick={setCurrentTile} data={tileData} selected={currentTile === tileData} />)}</Column>
    </Main>

  function onPlace(index: number, selectedFloor: FloorData) {
    if (!currentTile) return

    if (!selectedFloor.canBePlaced(currentTile)) return

    const newFloors = floors.map((floor, secondIndex) => secondIndex === index ? selectedFloor.place(currentTile).resetSize() : floor)

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

  function useScroll() {
    useEffect(() => {
      function listener (event) {
          const step = event.deltaY / 100
          if (currentTile) {
            setCurrentTile(null)
            setCurrentTile(currentTile.rotate(step === 1))
          }
      }
      document.addEventListener('wheel', listener);
      return () => document.removeEventListener('wheel', listener)
    }, [currentTile])
  }
}

type FloorProps = {
  floorData: FloorData;
  onClick?: (floorData: FloorData) => any;
  onHover?: () => any;
}

function Floor({floorData, onClick, onHover}: FloorProps) {
  const previewTile = floorData?.tilePreview?.segments ?? {}

  const placingIssue = floorData?.tilePreview && !floorData.canBePlaced(floorData?.tilePreview)

  return <SegmentContainer hasIssue={placingIssue} onClick={() => onClick?.(floorData)} onMouseEnter={onHover}>
    {floorData.segments.map(({color, size}, index) => <ColorSquare someColor={previewTile[index]?.color ?? color}>{size ?? ''}</ColorSquare>)}
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
  gap: 6px;
  ${({hasIssue}) =>  `opacity: ${hasIssue ? '0.5' : '1'};`}
  ${({selected}) =>  `border: 2px dotted ${selected ? 'black' : 'transparent'};`}
`

enum Color {
  Red = 1,
  Yellow,
  Green
}


class TileData {
  segments: Segment[];

  constructor() {
    this.segments = times(segmentCount).map(n => undefined);
    this.fillRandomly();
  }

  fillRandomly() {
    this.segments = this.segments.map(() => ({color : sample([Color.Red, Color.Yellow, Color.Green, undefined, undefined, undefined, undefined, undefined, undefined])}))
    return this;
  }

  rotate(direction: boolean) {
    const segmentCopy = [...this.segments]
    for (let i = 0; i < segmentCount; i++) {
      this.segments[i] = segmentCopy[(i + segmentCount + (direction ? 1 : -1)) % segmentCount]
    }
    return this
  }
}

type Segment = {
  color?: Color;
  size?: number;
}

class FloorData {
  segments:  Segment[];
  tilePreview?: TileData;

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
}

interface ColorSquareProps {
  someColor: Color;
}



const ColorSquare = styled.div<ColorSquareProps>`
  width: 100px;
  height: 100px;
  margin: 2px;
  background-color: ${({someColor}: {someColor: Color}) => colorToHtmlColor(someColor)};
`

const empty = new FloorData();

function colorToHtmlColor(color: Color) {
  if (color === Color.Red) return 'red';
  if (color === Color.Yellow) return 'yellow';
  if (color === Color.Green) return 'green';
  return 'black';
}

const Column = styled.div`
  display: flex;
  flex-direction: column;
`

const Main = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;

  background-color: #eeeee4;
  color: #242422;
  font-size: 75px;
  flex-direction: row;
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
