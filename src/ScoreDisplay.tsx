import React from 'react'
import styled, {keyframes, css} from 'styled-components'
import {useAnimationTrigger} from './animation'
import {rubberBand} from 'react-animations'

export default function ScoreDisplay({scoreAddition, score}) {
  const showAnimation = useAnimationTrigger(score)
  return (
    <ScoreView>
      {<Score showAnimation={showAnimation}>{score}</Score>}
      {showAnimation && <ScoreAddition>+{scoreAddition}</ScoreAddition>}
    </ScoreView>
  )
}

const Score = styled.div`
  ${({showAnimation}) =>
    showAnimation
      ? css`
          animation: 0.7s ${keyframes`${rubberBand}`};
        `
      : css`
          animation: none;
        `}
`

const ScoreView = styled.div`
  margin-bottom: 8px;
  font-size: 5rem;
  position: relative;
`

const ScoreAddition = styled.div`
  position: absolute;
  right: -40px;
  font-size: 2rem;
  font-weight: bold;
  color: rgba(119, 110, 101, 0.9);
  z-index: 100;
  animation: move-up 600ms ease-in;
  animation-fill-mode: both;
  animation-delay: 0.1s;

  @keyframes move-up {
    0% {
      top: 25px;
      opacity: 1;
    }
    100% {
      top: -50px;
      opacity: 0;
    }
  }
`
