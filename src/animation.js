import {useState, useEffect} from 'react'

export function useAnimationTrigger(prop, animationDurationInMs = 1000) {
  const [current, setCurrent] = useState(prop)
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    if (current !== prop) {
      setCurrent(prop)
      setShowAnimation(true)
      setTimeout(() => setShowAnimation(false), animationDurationInMs)
    }
  }, [prop])

  return showAnimation
}
