import React, {useState, useEffect} from 'react'
import styled from 'styled-components'
import {flowRight, sample, times} from 'lodash'

const segmentCount = 6;



export default function App() {
  const [currentTile, setCurrentTile] = useState<TileData>()

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

  useScroll()

  return <Main>
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

    setFloors(floors.map((floor, secondIndex) => secondIndex === index ? selectedFloor.place(currentTile) : floor))

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
    {floorData.segments.map((color: Color, index) => <ColorSquare someColor={previewTile[index] ?? color}/>)}
  </SegmentContainer>
}

type TileProps = {
  data: TileData;
  onClick?: (data: TileData) => any;
  selected: boolean;
}


function Tile({data, onClick, selected}: TileProps) {
  return <SegmentContainer onClick={() => onClick?.(data)} selected={selected}>
    {data.segments.map((color: Color) => <ColorSquare someColor={color}/>)}
  </SegmentContainer>
}

const SegmentContainer = styled.div<{selected?: boolean, hasIssue?: boolean}>`\
  display: flex;
  flex-direction: row;
  gap: 6px;
  ${({hasIssue}) =>  `opacity: ${hasIssue ? '0.5' : '1'};`}
  ${({selected}) =>  `border: 2px dotted ${selected ? 'black' : 'transparent'};`}
`

enum Color {
  Red = 1,
  Yellow,
  Green
}

type Segments = Color[];

class TileData {
  segments: Segments;

  constructor() {
    this.segments = times(segmentCount).map(n => undefined);
    this.fillRandomly();
  }

  fillRandomly() {
    this.segments = this.segments.map(() => sample([Color.Red, Color.Yellow, Color.Green, undefined, undefined, undefined, undefined, undefined, undefined]))
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

class FloorData {
  segments: Segments;
  tilePreview?: TileData;

  constructor() {
    this.segments = times(segmentCount).map(n => undefined);
  }

  canBePlaced(tile: TileData) {
    for (let i = 0; i < segmentCount; i++) {
      console.log(tile.segments[i], this.segments[i])
      if (tile.segments[i] && this.segments[i]) {
        return false
      }
    }
    return true
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
      newFloorData.segments[i] = this.segments[i] ?? tile.segments[i]
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
