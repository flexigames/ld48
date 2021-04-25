import React, {useState} from 'react'
import styled from 'styled-components'
import {keyBy, sample, times} from 'lodash'
import {Floor, Tile} from './types'
import {
  canBePlaced,
  createFloor,
  place,
  resetSize,
  wasJustCompleted
} from './floor'
import {cloneRotated, createTile} from './tile'

export default function App() {
  const [currentTile, setCurrentTile] = useState<Tile>()

  const [score, setScore] = useState(0)

  const [floors, setFloors] = useState([
    createFloor(),
    createFloor(),
    createFloor(),
    createFloor()
  ])

  const [tiles, setTiles] = useState([createTile(), createTile(), createTile()])

  const [groups, setGroups] = useState<Group[]>()

  const [currentMove, setCurentMove] = useState<number>(0)

  const [challenge, setChallenge] = useState<ChallengeData>(generateChallenge())

  return (
    <Main>
      depthscraper
      <Column>
        {floors.map((floor, index) => (
          <FloorView
            key={index}
            floorData={floor}
            onClick={(floor) => onPlace(index, floor)}
            onHover={(index) => onHover(floor, index)}
          />
        ))}
      </Column>
      <Tiles>
        <Challenge {...challenge} />
        <Score>{score}</Score>
        {tiles.map((tileData, index) => (
          <TileView
            key={index}
            onClick={setCurrentTile}
            data={tileData}
            selected={currentTile === tileData}
          />
        ))}
      </Tiles>
    </Main>
  )

  function onHover(floor: Floor, offset: number) {
    if (!currentTile) return

    for (const floor of floors) {
      floor.tilePreview = null
    }
    currentTile.offset = offset
    floor.tilePreview = cloneRotated(currentTile)
    setFloors([...floors])
  }

  function onPlace(index: number, selectedFloor: Floor) {
    if (!currentTile) return

    const rotatedTile = cloneRotated(currentTile)

    if (!canBePlaced(selectedFloor, rotatedTile)) return

    const newFloors = floors
      .map((floor, secondIndex) =>
        secondIndex === index ? place(selectedFloor, rotatedTile) : floor
      )
      .map(resetSize)

    for (const floor of newFloors) {
      if (wasJustCompleted(floor)) {
        newFloors.push(createFloor())
      }
    }

    const newGroups = calculateGroups(newFloors, currentMove)

    checkChallenge(newGroups)

    const groupByPosition = keyBy(
      groups,
      (group) => `${group.position.x}-${group.position.y}`
    )
    const newGroupByPosition = keyBy(
      newGroups,
      (group) => `${group.position.x}-${group.position.y}`
    )
    for (const positionKey in newGroupByPosition) {
      if (
        newGroupByPosition[positionKey].count >
        (groupByPosition[positionKey]?.count ?? 0)
      ) {
        setScore((score) => score + newGroupByPosition[positionKey].count)
      }
    }

    setGroups(newGroups)
    for (const group of newGroups) {
      const floor = newFloors[group.position.y]
      floor.segments[group.position.x].size = group.count
    }

    setFloors(newFloors)

    setTiles(tiles.map((tile) => (tile === currentTile ? createTile() : tile)))

    setCurentMove((round) => round + 1)
    setCurrentTile(null)
  }

  function checkChallenge(groups: Group[]) {
    const relevantGroups = groups.filter(
      ({completedAtMove}) => !completedAtMove || completedAtMove === currentMove
    )
    for (const relevantGroup of relevantGroups) {
      if (
        relevantGroup.color === challenge.color &&
        relevantGroup.count >= challenge.size
      ) {
        setChallenge(generateChallenge())
        setScore((score) => score + challenge.reward)
        return
      }
    }
  }
}

type ChallengeData = {
  color: Color
  size: number
  reward: number
}

const ChallengeText = styled.div`
  width: 500px;
  text-align: center;
`

function generateChallenge() {
  return {
    color: sample([Color.Red, Color.Yellow, Color.Green]),
    size: sample(times(10)) + 5,
    reward: 50
  }
}

type FloorProps = {
  floorData: Floor
  onClick?: (floorData: Floor) => any
  onHover?: (index: number) => any
}

function FloorView({floorData, onClick, onHover}: FloorProps) {
  const previewTile = floorData?.tilePreview?.segments ?? {}

  const placingIssue =
    floorData?.tilePreview && !canBePlaced(floorData, floorData?.tilePreview)

  return (
    <SegmentContainer
      hasIssue={placingIssue}
      onClick={() => onClick?.(floorData)}
    >
      {floorData.segments.map(({color, size}, index) => (
        <ColorSquare
          key={index}
          onMouseEnter={() => onHover(index)}
          someColor={previewTile[index]?.color ?? color}
        >
          {size ?? ''}
        </ColorSquare>
      ))}
    </SegmentContainer>
  )
}

type TileProps = {
  data: Tile
  onClick?: (data: Tile) => any
  selected: boolean
}

function TileView({data, onClick, selected}: TileProps) {
  return (
    <SegmentContainer onClick={() => onClick?.(data)} selected={selected}>
      {data.segments.map(({color}, index) => (
        <ColorSquare key={index} someColor={color} />
      ))}
    </SegmentContainer>
  )
}

function Challenge({color, size, reward}: ChallengeData) {
  return (
    <ChallengeText>{`Create a ${Color[color]} Group of Size ${size} (+${reward})`}</ChallengeText>
  )
}

const SegmentContainer = styled.div<{selected?: boolean; hasIssue?: boolean}>`
  display: flex;
  flex-direction: row;
  text-align: center;
  align-items: center;
  gap: 6px;
  border-radius: 4px;
  ${({hasIssue}) => `opacity: ${hasIssue ? '0.5' : '1'};`}
  ${({selected}) => `border: 4px solid ${selected ? 'black' : 'transparent'};`}
`

enum Color {
  Red = 1,
  Yellow,
  Green
}

interface ColorSquareProps {
  someColor: Color
}

const ColorSquare = styled.div<ColorSquareProps>`
  width: 100px;
  height: 100px;
  margin: 2px;
  border-radius: 2px;
  align-items: center;
  justify-content: center;
  display: flex;
  background-color: ${({someColor}: {someColor: Color}) =>
    colorToHtmlColor(someColor)};
`

function colorToHtmlColor(color: Color) {
  if (color === Color.Red) return '#FF4136'
  if (color === Color.Yellow) return '#FFDC00'
  if (color === Color.Green) return '#3D9970'
  return '#272727'
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
  id: number
  position: {x: number; y: number}
  color: Color
  count: number
  completedAtMove?: number
}

function calculateGroups(floors: Floor[], currentMove: number) {
  const grid = floors.map((floor) =>
    floor.segments.map(({color}) => ({color, group: null}))
  )
  let nextGroup = 1

  const groups: Record<number, Group> = {}

  for (let y = grid.length - 1; y >= 0; y--) {
    for (let x = grid[y].length - 1; x >= 0; x--) {
      if (!grid[y][x].color) continue
      if (grid[y][x].group) continue

      const currentGroup = nextGroup
      groups[currentGroup] = {
        id: currentGroup,
        position: {
          x,
          y
        },
        color: grid[y][x].color,
        count: 0,
        completedAtMove: currentMove // Assume completed, algorithm will reset if it finds empty neighbor
      }
      nextGroup++

      const cellColor = grid[y][x].color

      setGroupForSameNeighbors(cellColor, currentGroup, x, y)
    }
  }

  return Object.values(groups)

  function setGroupForSameNeighbors(
    cellColor: Color,
    currentGroup: number,
    x: number,
    y: number
  ) {
    if (grid[y][x].group) return

    grid[y][x].group = currentGroup
    groups[currentGroup].count++

    const neighborUp = grid[y - 1]?.[x]
    if (neighborUp?.color === cellColor) {
      setGroupForSameNeighbors(cellColor, currentGroup, x, y - 1)
    }
    const neighborDown = grid[y + 1]?.[x]
    if (neighborDown?.color === cellColor) {
      setGroupForSameNeighbors(cellColor, currentGroup, x, y + 1)
    }

    const neighborRight = grid[y][x + 1]
    if (neighborRight?.color === cellColor) {
      setGroupForSameNeighbors(cellColor, currentGroup, x + 1, y)
    }

    const neighborLeft = grid[y][x - 1]
    if (neighborLeft?.color === cellColor) {
      setGroupForSameNeighbors(cellColor, currentGroup, x - 1, y)
    }

    const hasEmptyNeighbor =
      !neighborUp?.color ||
      !neighborDown?.color ||
      !neighborLeft?.color ||
      !neighborRight?.color

    if (hasEmptyNeighbor) {
      groups[currentGroup].completedAtMove = undefined
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
