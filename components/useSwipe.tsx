"use client"

import { useRef, useEffect } from 'react'

interface SwipeInput {
  onSwipedLeft?: () => void
  onSwipedRight?: () => void
  onSwipedUp?: () => void
  onSwipedDown?: () => void
  preventDefaultTouchmoveEvent?: boolean
  delta?: number
}

interface TouchEventData {
  first: boolean
  initial: [number, number]
  start: [number, number]
  current: [number, number]
  length: number
  elapsed: number
}

export function useSwipe(input: SwipeInput) {
  const {
    onSwipedLeft,
    onSwipedRight,
    onSwipedUp,
    onSwipedDown,
    preventDefaultTouchmoveEvent = false,
    delta = 50
  } = input

  const eventData = useRef<TouchEventData | null>(null)
  const element = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = element.current
    if (!el) return

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      eventData.current = {
        first: true,
        initial: [touch.clientX, touch.clientY],
        start: [touch.clientX, touch.clientY],
        current: [touch.clientX, touch.clientY],
        length: 0,
        elapsed: Date.now()
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!eventData.current) return
      
      if (preventDefaultTouchmoveEvent) {
        e.preventDefault()
      }

      const touch = e.touches[0]
      eventData.current = {
        ...eventData.current,
        current: [touch.clientX, touch.clientY],
        length: Math.sqrt(
          Math.pow(touch.clientX - eventData.current.start[0], 2) +
          Math.pow(touch.clientY - eventData.current.start[1], 2)
        ),
        first: false
      }
    }

    const handleTouchEnd = () => {
      if (!eventData.current) return

      const { start, current, length } = eventData.current
      
      if (length >= delta) {
        const deltaX = current[0] - start[0]
        const deltaY = current[1] - start[1]
        const absDeltaX = Math.abs(deltaX)
        const absDeltaY = Math.abs(deltaY)

        // Horizontal swipe
        if (absDeltaX > absDeltaY) {
          if (deltaX > 0 && onSwipedRight) {
            onSwipedRight()
          } else if (deltaX < 0 && onSwipedLeft) {
            onSwipedLeft()
          }
        }
        // Vertical swipe
        else {
          if (deltaY > 0 && onSwipedDown) {
            onSwipedDown()
          } else if (deltaY < 0 && onSwipedUp) {
            onSwipedUp()
          }
        }
      }

      eventData.current = null
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: !preventDefaultTouchmoveEvent })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onSwipedLeft, onSwipedRight, onSwipedUp, onSwipedDown, preventDefaultTouchmoveEvent, delta])

  return element
}