"use client"

import React, { HTMLAttributes, useCallback, useMemo } from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

interface WarpBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  perspective?: number
  beamsPerSide?: number
  beamSize?: number
  beamDelayMax?: number
  beamDelayMin?: number
  beamDuration?: number
  gridColor?: string
}

const Beam = ({
  width,
  x,
  delay,
  duration,
}: {
  width: string | number
  x: string | number
  delay: number
  duration: number
}) => {
  // Faisceaux gris très clairs (légère variation de luminosité entre 75–90%)
  const lightness = Math.floor(Math.random() * 15) + 75  // 75–90% → gris clair
  const opacity   = (Math.random() * 0.25 + 0.30).toFixed(2)  // 0.30–0.55

  const ar = Math.floor(Math.random() * 6) + 4  // aspect-ratio 4–10 → faisceaux fins

  return (
    <motion.div
      style={
        {
          "--x": `${x}`,
          "--width": `${width}`,
          "--aspect-ratio": `${ar}`,
          "--background": `linear-gradient(hsl(0 0% ${lightness}% / ${opacity}), transparent)`,
        } as React.CSSProperties
      }
      className={`absolute top-0 left-[var(--x)] [aspect-ratio:1/var(--aspect-ratio)] [width:var(--width)] [background:var(--background)]`}
      initial={{ y: "100cqmax", x: "-50%" }}
      animate={{ y: "-100%", x: "-50%" }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  )
}

export const WarpBackground: React.FC<WarpBackgroundProps> = ({
  children,
  perspective = 120,
  className,
  beamsPerSide = 3,
  beamSize = 5,
  beamDelayMax = 12,   // délai max élevé → départ très étalé
  beamDelayMin = 3,    // délai min → pas de rush au démarrage
  beamDuration = 16,   // durée longue → effet lent et doux
  gridColor = "rgba(0,0,0,0.06)", // grille très discrète sur fond blanc
  ...props
}) => {
  const generateBeams = useCallback(() => {
    const beams = []
    const cellsPerSide = Math.floor(100 / beamSize)
    const step = cellsPerSide / beamsPerSide

    for (let i = 0; i < beamsPerSide; i++) {
      const x = Math.floor(i * step)
      const delay = Math.random() * (beamDelayMax - beamDelayMin) + beamDelayMin
      beams.push({ x, delay })
    }
    return beams
  }, [beamsPerSide, beamSize, beamDelayMax, beamDelayMin])

  const topBeams    = useMemo(() => generateBeams(), [generateBeams])
  const rightBeams  = useMemo(() => generateBeams(), [generateBeams])
  const bottomBeams = useMemo(() => generateBeams(), [generateBeams])
  const leftBeams   = useMemo(() => generateBeams(), [generateBeams])

  return (
    <div className={cn("relative", className)} {...props}>
      <div
        style={
          {
            "--perspective": `${perspective}px`,
            "--grid-color": gridColor,
            "--beam-size": `${beamSize}%`,
          } as React.CSSProperties
        }
        className="[container-type:size] pointer-events-none absolute top-0 left-0 size-full overflow-hidden [clipPath:inset(0)] [perspective:var(--perspective)] [transform-style:preserve-3d]"
      >
        {/* top */}
        <div className="[container-type:inline-size] absolute z-20 [height:100cqmax] [width:100cqi] [transform-origin:50%_0%] [transform:rotateX(-90deg)] [background-size:var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,_transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,_var(--grid-color)_0_1px,_transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] [transform-style:preserve-3d]">
          {topBeams.map((beam, i) => <Beam key={`top-${i}`} width={`${beamSize}%`} x={`${beam.x * beamSize}%`} delay={beam.delay} duration={beamDuration} />)}
        </div>
        {/* bottom */}
        <div className="[container-type:inline-size] absolute top-full [height:100cqmax] [width:100cqi] [transform-origin:50%_0%] [transform:rotateX(-90deg)] [background-size:var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,_transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,_var(--grid-color)_0_1px,_transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] [transform-style:preserve-3d]">
          {bottomBeams.map((beam, i) => <Beam key={`bottom-${i}`} width={`${beamSize}%`} x={`${beam.x * beamSize}%`} delay={beam.delay} duration={beamDuration} />)}
        </div>
        {/* left */}
        <div className="[container-type:inline-size] absolute top-0 left-0 [height:100cqmax] [width:100cqh] [transform-origin:0%_0%] [transform:rotate(90deg)_rotateX(-90deg)] [background-size:var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,_transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,_var(--grid-color)_0_1px,_transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] [transform-style:preserve-3d]">
          {leftBeams.map((beam, i) => <Beam key={`left-${i}`} width={`${beamSize}%`} x={`${beam.x * beamSize}%`} delay={beam.delay} duration={beamDuration} />)}
        </div>
        {/* right */}
        <div className="[container-type:inline-size] absolute top-0 right-0 [height:100cqmax] [width:100cqh] [transform-origin:100%_0%] [transform:rotate(-90deg)_rotateX(-90deg)] [background-size:var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,_transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,_var(--grid-color)_0_1px,_transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] [transform-style:preserve-3d]">
          {rightBeams.map((beam, i) => <Beam key={`right-${i}`} width={`${beamSize}%`} x={`${beam.x * beamSize}%`} delay={beam.delay} duration={beamDuration} />)}
        </div>
      </div>
      <div className="relative">{children}</div>
    </div>
  )
}
