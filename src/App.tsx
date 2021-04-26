import React, {useEffect, useState} from 'react'
import styled, {keyframes, css} from 'styled-components'
import {flipInX, rubberBand} from 'react-animations'
import {maxBy, random, sample} from 'lodash'
import {Floor, Segment, Tile} from './types'
import {canBePlaced, createFloor, placeTile, wasJustCompleted} from './floor'
import {cloneRotated, createTile} from './tile'
import {segmentCount} from './const'
import {addHighscore, getHighscores, Score} from './firebase'

type Groups = Record<number, Group>

const groups: Groups = {}

export default function App() {
  const [currentTile, setCurrentTile] = useState<Tile>()

  const [score, setScore] = useState(0)

  const [movesLeft, setMovesLeft] = useState(30)

  const [floors, setFloors] = useState([
    createFloor(),
    createFloor(),
    createFloor(),
    createFloor()
  ])

  const [tiles, setTiles] = useState([createTile(), createTile(), createTile()])

  const [currentMove, setCurentMove] = useState<number>(0)

  const [challenge, setChallenge] = useState<ChallengeData>(generateChallenge)

  const [highscores, setHighscores] = useState<Score[]>([])

  const [gameover, setGameover] = useState(false)

  useEffect(() => {
    getHighscores().then(setHighscores)
  })

  useEffect(() => {
    if (movesLeft === 0) setGameover(true)
  }, [movesLeft])

  useEffect(() => {
    if (gameover) {
      const name = prompt(`what is your name?`).slice(0, 10)
      addHighscore(score, name)
    }
  }, [gameover])

  return (
    <Main>
      depthscraper
      <Column>
        {floors.map((floor, index) => (
          <FloorView
            key={index}
            floorData={floor}
            groups={groups}
            y={index}
            onClick={(floor) => onPlace(index, floor)}
            onHover={(index) => onHover(floor, index)}
          />
        ))}
      </Column>
      <Tiles>
        {movesLeft > 0 && <Challenge {...challenge} />}
        <ScoreView>{score}</ScoreView>
        {gameover ? 'game over' : <>{movesLeft} moves left</>}
        {tiles.map((tileData, index) => (
          <TileView
            key={index}
            onClick={setCurrentTile}
            data={tileData}
            selected={currentTile === tileData}
          />
        ))}
      </Tiles>
      <Highscores>
        <strong>highscore</strong>
        {highscores.map(({name, score}, index) => (
          <div key={index}>
            {name ?? 'anon'}: {score}
          </div>
        ))}
      </Highscores>
    </Main>
  )

  function onHover(floor: Floor, offset: number) {
    if (!currentTile) return
    if (movesLeft <= 0) return

    for (const floor of floors) {
      floor.tilePreview = null
    }
    currentTile.offset = offset
    floor.tilePreview = cloneRotated(currentTile)
    setFloors([...floors])
  }

  function onPlace(y: number, selectedFloor: Floor) {
    if (!currentTile) return
    if (movesLeft <= 0) return

    const rotatedTile = cloneRotated(currentTile)

    if (!canBePlaced(selectedFloor, rotatedTile)) return

    setMovesLeft((moves) => moves - 1)

    const newFloors = placeTile(floors, rotatedTile, y)

    for (const floor of newFloors) {
      if (wasJustCompleted(floor)) {
        newFloors.push(createFloor())
      }
    }

    const oldGroupIds = Object.keys(groups)

    createGroupsForNewSegments(groups, y, rotatedTile.segments)

    for (let x = 0; x < segmentCount; x++) {
      if (!rotatedTile.segments[x].color) continue
      mergeGroups(newFloors, groups, {x, y})
    }

    updateScore(oldGroupIds)

    updateGroupCompletedState(floors, groups)

    checkChallenge(Object.values(groups))

    updateSizeText(newFloors, groups)

    setFloors(newFloors)

    const newTiles = tiles.map((tile) =>
      tile === currentTile ? createTile() : tile
    )

    setTiles(newTiles)

    if (!isPlacementPossible(newFloors, newTiles)) {
      setGameover(true)
    }

    setCurentMove((round) => round + 1)
    setCurrentTile(null)
  }

  function updateScore(oldGroupIds: string[]) {
    for (const group of Object.values(groups)) {
      if (!oldGroupIds.includes(String(group.id)))
        setScore((score) => score + group.positions.length)
    }
  }

  function updateGroupCompletedState(floors: Floor[], groups: Groups) {
    for (const group of Object.values(groups)) {
      if (group.completedAtMove) continue

      if (
        group.positions.every((position) =>
          hasNoEmptyNeighbours(floors, position)
        )
      ) {
        group.completedAtMove = currentMove
      }
    }
  }

  function updateSizeText(floors: Floor[], groups: Groups) {
    for (const group of Object.values(groups)) {
      const sizeTextPosition = getSizeTextPosition(group)
      const floor = floors[sizeTextPosition.y]
      floor.segments[sizeTextPosition.x].size = group.positions.length
    }
  }

  function checkChallenge(groups: Group[]) {
    const relevantGroups = groups.filter(
      ({completedAtMove}) => !completedAtMove || completedAtMove === currentMove
    )
    for (const relevantGroup of relevantGroups) {
      if (
        relevantGroup.color === challenge.color &&
        relevantGroup.positions.length >= challenge.size
      ) {
        setChallenge(generateChallenge())
        setMovesLeft((moves) => moves + challenge.reward)
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
  width: 300px;
  text-align: center;
  font-size: 1.5rem;
`

function generateChallenge() {
  const color = sample([Color.Red, Color.Yellow, Color.Green])

  const uncompletedGroups = findUncompletedGroups(groups)

  const sampledGroup = maxBy(
    uncompletedGroups.filter((group) => group.color === color),
    (group) => group.positions.length
  )

  const size = random(5) + 5 + (sampledGroup?.positions?.length ?? 0)

  return {
    color: color,
    size,
    reward: size + random(3)
  }
}

type FloorProps = {
  floorData: Floor
  onClick?: (floorData: Floor) => any
  onHover?: (index: number) => any
  y: number
  groups: Groups
}

function FloorView({floorData, onClick, onHover, groups, y}: FloorProps) {
  const previewTile = floorData?.tilePreview?.segments ?? {}

  const placingIssue =
    floorData?.tilePreview && !canBePlaced(floorData, floorData?.tilePreview)

  return (
    <SegmentContainer
      hasIssue={placingIssue}
      onClick={() => onClick?.(floorData)}
    >
      {floorData.segments.map(({color, size}, x) => (
        <ColorSquare
          key={x}
          onMouseEnter={() => onHover(x)}
          someColor={color}
          previewColor={previewTile[x]?.color}
          completed={Boolean(getGroup(groups, {x, y})?.completedAtMove)}
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
        <ColorSquare small key={index} someColor={color} />
      ))}
    </SegmentContainer>
  )
}

function Challenge({color, size, reward}: ChallengeData) {
  return (
    <ChallengeText>{`Create a ${Color[color]} Group of Size ${size} (+${reward} moves)`}</ChallengeText>
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
  animation: 1s ${keyframes`${flipInX}`};
`

enum Color {
  Red = 1,
  Yellow,
  Green
}

interface ColorSquareProps {
  someColor: Color
  previewColor?: Color
  completed?: boolean
  small?: boolean
  children?: any
  onMouseEnter?: () => void
}

function ColorSquare(props: ColorSquareProps) {
  const [currentColor, setCurrentColor] = useState(props.someColor)
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    if (!props.small && currentColor !== props.someColor) {
      setCurrentColor(props.someColor)
      setShowAnimation(true)
      setTimeout(() => setShowAnimation(false), 700)
    }
  }, [props.someColor])

  return (
    <ColorSquareContainer
      showAnimation={showAnimation}
      resultingColor={props.previewColor || props.someColor}
      {...props}
    />
  )
}

const ColorSquareContainer = styled.div<ColorSquareProps>`
  width: ${({small}) => (small ? '50px' : '100px')};
  height: ${({small}) => (small ? '50px' : '100px')};
  margin: 2px;
  box-sizing: border-box;
  border-radius: 2px;
  align-items: center;
  justify-content: center;
  display: flex;
  opacity: ${({completed}) => (completed ? `0.7` : `1`)};
  background-color: ${({resultingColor}: {resultingColor: Color}) =>
    colorToHtmlColor(resultingColor)};
  ${({showAnimation}) =>
    showAnimation
      ? css`
          animation: 0.7s ${keyframes`${rubberBand}`};
        `
      : css`
          animation: none;
        `}
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

type Position = {
  x: number
  y: number
}

type Group = {
  id: number
  color: Color
  completedAtMove?: number
  positions: Position[]
}

const Tiles = styled(Column)`
  position: fixed;
  right: 32px;
  bottom: 32px;
  width: 300px;
  display: flex;
  font-size: 2.5rem;
  align-items: center;
`

const ScoreView = styled.div`
  margin-bottom: 16px;
  font-size: 7rem;
`

function getSegment(floors: Floor[], position: Position) {
  return floors[position.y]?.segments?.[position.x]
}

function mergeGroups(
  floors: Floor[],
  groups: Groups,
  position: Position
): Groups {
  const currentSegment = getSegment(floors, position)

  for (const neighborPosition of getNeighborPositions(position)) {
    const neighbor = getSegment(floors, neighborPosition)
    if (!neighbor || neighbor.color !== currentSegment.color) continue

    const currentGroup = getGroup(groups, position)
    const neighborGroup = getGroup(groups, neighborPosition)

    if (currentGroup.id === neighborGroup.id) continue

    const newPositions = [...currentGroup.positions, ...neighborGroup.positions]
    const newGroup = createGroup(currentGroup.color, newPositions)

    groups[newGroup.id] = newGroup
    delete groups[currentGroup.id]
    delete groups[neighborGroup.id]
  }

  return groups
}

let nextGroupId = 1

function createGroup(color: Color, positions: Position[] = []): Group {
  return {
    id: ++nextGroupId,
    positions,
    color
  }
}

function getGroup(groups: Groups, position: Position): Group {
  return Object.entries(groups).find(([, group]) =>
    group.positions.some(({x, y}) => position.x === x && position.y === y)
  )?.[1]
}

function getNeighborPositions(position: Position): Position[] {
  const offsets = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0]
  ]

  return offsets.map(([x, y]) => ({x: position.x + x, y: position.y + y}))
}

function createGroupsForNewSegments(
  groups: Groups,
  y: number,
  segments: Segment[]
) {
  for (let x = 0; x < segmentCount; x++) {
    const segment = segments[x]
    if (!segment.color) continue

    const group = createGroup(segment.color, [{x, y}])
    groups[group.id] = group
  }
}

function getSizeTextPosition(group: Group): Position {
  return group.positions.reduce((bestSoFar, current) =>
    current.y >= bestSoFar.y ? current : bestSoFar
  )
}

function hasNoEmptyNeighbours(floors: Floor[], position: Position) {
  return getNeighborPositions(position)
    .map((neighborPosition) => getSegment(floors, neighborPosition))
    .filter((segment) => segment)
    .every((neighbor) => neighbor?.color)
}

function findUncompletedGroups(groups: Groups) {
  return Object.values(groups).filter(({completedAtMove}) => !completedAtMove)
}

const Highscores = styled.div`
  position: fixed;
  left: 16px;
  top: 16px;
  font-size: 1rem;

  display: flex;
  flex-direction: column;
`

function isPlacementPossible(floors: Floor[], tiles: Tile[]) {
  const floorsWithEmptySegments = floors.filter((floor) =>
    floor.segments.some((segment) => !segment.color)
  )

  for (const tile of tiles) {
    for (const floor of floorsWithEmptySegments) {
      for (let offset = 0; offset < segmentCount; offset++) {
        if (canBePlaced(floor, cloneRotated(tile, offset))) return true
      }
    }
  }

  return false
}

// window.addEventListener('beforeunload', function (e) {
//   e.preventDefault()
//   e.returnValue = 'Are you sure you want to leave?'
// })
