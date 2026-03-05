'use client'

import React, { CSSProperties } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface WarpBackgroundProps {
  children?: React.ReactNode
  /** Nombre de faisceaux par côté (haut + gauche) */
  beamsPerSide?: number
  /** Taille de chaque faisceau (% de la dimension) */
  beamSize?: number
  /** Durée de l'animation en secondes */
  beamDuration?: number
  /** Délai max aléatoire entre chaque faisceau (secondes) */
  beamDelayMax?: number
  /** Délai min */
  beamDelayMin?: number
  /** Perspective CSS (px) */
  perspective?: number
  /** Couleur des lignes de grille */
  gridColor?: string
  /** Couleur des faisceaux */
  beamColor?: string
  className?: string
  style?: CSSProperties
}

// ─── Génère un tableau d'entiers de 0 à n-1 ──────────────────────────────────
function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i)
}

// ─── Un seul faisceau (top ou left) ──────────────────────────────────────────
function Beam({
  direction,
  index,
  beamSize,
  duration,
  delayMax,
  delayMin,
  beamColor,
}: {
  direction: 'top' | 'left'
  index: number
  beamSize: number
  duration: number
  delayMax: number
  delayMin: number
  beamColor: string
}) {
  // Délai pseudo-aléatoire déterministe basé sur index + direction
  const seed = direction === 'top' ? index * 7.3 : index * 5.7 + 100
  const delay = delayMin + ((seed * 1.618) % (delayMax - delayMin))

  const pos = `${index * beamSize + beamSize / 2}%`

  const baseStyle: CSSProperties = {
    position: 'absolute',
    background: `linear-gradient(to bottom, ${beamColor}, transparent)`,
    animationName: direction === 'top' ? 'warp-beam-top' : 'warp-beam-left',
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    opacity: 0,
    pointerEvents: 'none',
    zIndex: 1,
  }

  if (direction === 'top') {
    return (
      <div
        style={{
          ...baseStyle,
          left: pos,
          top: 0,
          width: '2px',
          height: '30%',
          transform: 'translateX(-50%)',
          background: `linear-gradient(to bottom, transparent, ${beamColor}, transparent)`,
        }}
      />
    )
  }

  return (
    <div
      style={{
        ...baseStyle,
        top: pos,
        left: 0,
        width: '30%',
        height: '2px',
        transform: 'translateY(-50%)',
        background: `linear-gradient(to right, transparent, ${beamColor}, transparent)`,
      }}
    />
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
export function WarpBackground({
  children,
  beamsPerSide = 4,
  beamSize = 10,
  beamDuration = 4,
  beamDelayMax = 3,
  beamDelayMin = 0,
  perspective = 200,
  gridColor = 'rgba(255,255,255,0.06)',
  beamColor = 'rgba(255,255,255,0.5)',
  className = '',
  style,
}: WarpBackgroundProps) {
  const gridSize = `${beamSize}%`

  return (
    <>
      {/* Keyframes injectés une seule fois */}
      <style>{`
        @keyframes warp-beam-top {
          0%   { opacity: 0; transform: translateX(-50%) translateY(-100%); }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { opacity: 0; transform: translateX(-50%) translateY(500%); }
        }
        @keyframes warp-beam-left {
          0%   { opacity: 0; transform: translateY(-50%) translateX(-100%); }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(-50%) translateX(500%); }
        }
      `}</style>

      <div
        className={`ud-warp ${className}`}
        style={{
          position: 'relative',
          overflow: 'hidden',
          ...style,
        }}
      >
        {/* ── Grille perspective ── */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(${gridColor} 1px, transparent 1px),
              linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
            `,
            backgroundSize: `${gridSize} ${gridSize}`,
            // Perspective : le bas de la grille semble plus loin
            transform: `perspective(${perspective}px) rotateX(0deg)`,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        {/* ── Faisceaux verticaux (top) ── */}
        {range(beamsPerSide).map((i) => (
          <Beam
            key={`top-${i}`}
            direction="top"
            index={i}
            beamSize={100 / beamsPerSide}
            duration={beamDuration}
            delayMax={beamDelayMax}
            delayMin={beamDelayMin}
            beamColor={beamColor}
          />
        ))}

        {/* ── Faisceaux horizontaux (left) ── */}
        {range(beamsPerSide).map((i) => (
          <Beam
            key={`left-${i}`}
            direction="left"
            index={i}
            beamSize={100 / beamsPerSide}
            duration={beamDuration}
            delayMax={beamDelayMax}
            delayMin={beamDelayMin}
            beamColor={beamColor}
          />
        ))}

        {/* ── Contenu ── */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          {children}
        </div>
      </div>
    </>
  )
}
