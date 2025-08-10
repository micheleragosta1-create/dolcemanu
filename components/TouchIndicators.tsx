"use client"

import React, { useState, useEffect } from 'react'
import { Hand, ArrowLeft, ArrowRight } from 'lucide-react'

interface TouchIndicatorProps {
  type: 'swipe' | 'tap' | 'scroll'
  direction?: 'left' | 'right' | 'up' | 'down'
  className?: string
  autoHide?: boolean
  delay?: number
}

export default function TouchIndicator({ 
  type, 
  direction = 'right', 
  className = '', 
  autoHide = true,
  delay = 3000 
}: TouchIndicatorProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setVisible(false)
      }, delay)
      
      return () => clearTimeout(timer)
    }
  }, [autoHide, delay])

  if (!visible) return null

  const getIcon = () => {
    switch (type) {
      case 'swipe':
        return direction === 'left' ? <ArrowLeft size={20} /> : <ArrowRight size={20} />
      case 'tap':
        return <Hand size={20} />
      case 'scroll':
        return direction === 'up' ? <ArrowLeft size={20} style={{ transform: 'rotate(90deg)' }} /> : <ArrowRight size={20} style={{ transform: 'rotate(90deg)' }} />
    }
  }

  const getAnimation = () => {
    switch (type) {
      case 'swipe':
        return direction === 'left' ? 'swipe-left' : 'swipe-right'
      case 'tap':
        return 'tap-pulse'
      case 'scroll':
        return direction === 'up' ? 'scroll-up' : 'scroll-down'
    }
  }

  return (
    <div className={`touch-indicator ${type} ${getAnimation()} ${className}`}>
      {getIcon()}
      <span className="touch-text">
        {type === 'swipe' && `Scorri ${direction === 'left' ? 'a sinistra' : 'a destra'}`}
        {type === 'tap' && 'Tocca qui'}
        {type === 'scroll' && `Scorri ${direction === 'up' ? 'in alto' : 'in basso'}`}
      </span>

      <style jsx>{`
        .touch-indicator {
          display: none;
          position: absolute;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          align-items: center;
          gap: 0.5rem;
          pointer-events: none;
          z-index: 100;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 768px) and (hover: none) and (pointer: coarse) {
          .touch-indicator {
            display: flex;
          }
        }

        .swipe-left {
          animation: swipeLeftHint 2s ease-in-out infinite;
        }

        .swipe-right {
          animation: swipeRightHint 2s ease-in-out infinite;
        }

        .tap-pulse {
          animation: tapPulse 1.5s ease-in-out infinite;
        }

        .scroll-up {
          animation: scrollUpHint 2s ease-in-out infinite;
        }

        .scroll-down {
          animation: scrollDownHint 2s ease-in-out infinite;
        }

        @keyframes swipeLeftHint {
          0%, 100% { transform: translateX(0); opacity: 0.7; }
          50% { transform: translateX(-10px); opacity: 1; }
        }

        @keyframes swipeRightHint {
          0%, 100% { transform: translateX(0); opacity: 0.7; }
          50% { transform: translateX(10px); opacity: 1; }
        }

        @keyframes tapPulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 1; }
        }

        @keyframes scrollUpHint {
          0%, 100% { transform: translateY(0); opacity: 0.7; }
          50% { transform: translateY(-10px); opacity: 1; }
        }

        @keyframes scrollDownHint {
          0%, 100% { transform: translateY(0); opacity: 0.7; }
          50% { transform: translateY(10px); opacity: 1; }
        }

        .touch-text {
          white-space: nowrap;
        }
      `}</style>
    </div>
  )
}

// Ripple effect component for touch feedback
export function TouchRipple({ 
  children, 
  className = '',
  disabled = false 
}: { 
  children: React.ReactNode
  className?: string
  disabled?: boolean 
}) {
  const [ripples, setRipples] = useState<Array<{ id: number, x: number, y: number }>>([])

  const handleTouch = (e: React.TouchEvent | React.MouseEvent) => {
    if (disabled) return

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top

    const newRipple = {
      id: Date.now(),
      x,
      y
    }

    setRipples(prev => [...prev, newRipple])

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
    }, 600)
  }

  return (
    <div 
      className={`touch-ripple-container ${className}`}
      onTouchStart={handleTouch}
      onMouseDown={handleTouch}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="ripple-effect"
          style={{
            left: ripple.x,
            top: ripple.y,
          }}
        />
      ))}

      <style jsx>{`
        .touch-ripple-container {
          position: relative;
          overflow: hidden;
        }

        .ripple-effect {
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
          transform: translate(-50%, -50%) scale(0);
          animation: ripple 0.6s linear;
          pointer-events: none;
        }

        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}