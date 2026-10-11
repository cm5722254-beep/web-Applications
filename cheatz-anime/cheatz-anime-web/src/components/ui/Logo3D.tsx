'use client'

import React from 'react'

interface Logo3DProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showRings?: boolean
  className?: string
  interactive?: boolean
}

export function Logo3D({
  size = 'md',
  showRings = false,
  className = '',
  interactive = true,
}: Logo3DProps) {
  const sizeMap = {
    sm: {
      wrapper: 'w-10 h-10',
      coin: 'w-9 h-9',
      border: 'border-2',
      rings: 'w-16 h-16',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]',
      thick: 'translate-z-[2px]',
    },
    md: {
      wrapper: 'w-20 h-20',
      coin: 'w-16 h-16',
      border: 'border-2',
      rings: 'w-28 h-28',
      glow: 'shadow-[0_0_25px_rgba(245,158,11,0.6)]',
      thick: 'translate-z-[3px]',
    },
    lg: {
      wrapper: 'w-36 h-36 sm:w-44 sm:h-44',
      coin: 'w-28 h-28 sm:w-36 sm:h-36',
      border: 'border-4',
      rings: 'w-48 h-48 sm:w-56 sm:h-56',
      glow: 'shadow-[0_0_35px_rgba(245,158,11,0.7)]',
      thick: 'translate-z-[4px]',
    },
    xl: {
      wrapper: 'w-48 h-48 sm:w-56 sm:h-56',
      coin: 'w-40 h-40 sm:w-48 sm:h-48',
      border: 'border-4',
      rings: 'w-64 h-64 sm:w-72 sm:h-72',
      glow: 'shadow-[0_0_45px_rgba(245,158,11,0.8)]',
      thick: 'translate-z-[5px]',
    },
  }

  const current = sizeMap[size]

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${current.wrapper} ${className}`}
      style={{ perspective: '1000px' }}
    >
      {/* Optional Cosmic Orbital Energy Rings (Hero Showcase) */}
      {showRings && (
        <>
          {/* Outer Cyan Ring - tilted 70deg */}
          <div
            className={`absolute pointer-events-none rounded-full border border-sky-400/40 orbit-ring-glow ${current.rings}`}
            style={{
              transform: 'rotateX(72deg) rotateY(15deg)',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.4), inset 0 0 15px rgba(56, 189, 248, 0.3)',
            }}
          >
            <span className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8]" />
          </div>

          {/* Inner Amber Ring - tilted -65deg opposite */}
          <div
            className={`absolute pointer-events-none rounded-full border border-amber-400/50 ${current.rings}`}
            style={{
              transform: 'rotateX(68deg) rotateY(-30deg)',
              animation: 'orbitSpinCounter 10s linear infinite',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.4), inset 0 0 15px rgba(245, 158, 11, 0.3)',
            }}
          >
            <span className="absolute -bottom-1 right-1/4 w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_#fbbf24]" />
          </div>

          {/* Ambient Glow Aura */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-sky-500/20 to-brand-purple/20 rounded-full blur-2xl pointer-events-none" />
        </>
      )}

      {/* 3D Revolving Stage */}
      <div
        className={`logo-3d-revolve relative rounded-full ${current.coin} ${interactive ? 'cursor-pointer hover:scale-110' : ''}`}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Front Coin Face */}
        <div
          className={`absolute inset-0 rounded-full overflow-hidden ${current.border} border-amber-400/90 ${current.glow} bg-black`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'translateZ(3px)',
          }}
        >
          <img
            src="/logo.png"
            alt="SC-ANIME 3D Logo Front"
            className="w-full h-full object-cover"
          />
          {/* Specular Glint Highlight */}
          <div
            className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/25 to-transparent"
            style={{
              animation: 'coinShine 6s ease-in-out infinite',
            }}
          />
        </div>

        {/* Back Coin Face (Flipped so it faces correctly on rotate) */}
        <div
          className={`absolute inset-0 rounded-full overflow-hidden ${current.border} border-sky-400/90 shadow-[0_0_25px_rgba(56,189,248,0.7)] bg-black`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg) translateZ(3px)',
          }}
        >
          <img
            src="/logo.png"
            alt="SC-ANIME 3D Logo Back"
            className="w-full h-full object-cover"
          />
          {/* Specular Glint Highlight Back */}
          <div
            className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-cyan-200/25 to-transparent"
            style={{
              animation: 'coinShine 6s ease-in-out infinite 3s',
            }}
          />
        </div>

        {/* 3D Rim Edge Simulation */}
        <div
          className="absolute inset-0 rounded-full border border-amber-300/40 pointer-events-none"
          style={{
            transform: 'translateZ(0px)',
          }}
        />
      </div>
    </div>
  )
}
