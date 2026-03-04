'use client'

import { useState } from 'react'
import Image from 'next/image'

type Props = {
  images: string[]
  title: string
}

export default function ProductGallery({ images, title }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div style={{
        width: '100%', paddingBottom: '80%', position: 'relative',
        background: '#EFEFEF', borderRadius: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px' }}>
          📦
        </div>
      </div>
    )
  }

  const prev = () => setActiveIndex(i => (i - 1 + images.length) % images.length)
  const next = () => setActiveIndex(i => (i + 1) % images.length)

  return (
    <div className="ud-gallery">
      {/* Image principale */}
      <div className="ud-gallery__main">
        <Image
          src={images[activeIndex]}
          alt={`${title} — image ${activeIndex + 1}`}
          fill
          sizes="(max-width: 900px) 100vw, 50vw"
          style={{ objectFit: 'cover' }}
          priority
        />

        {/* Flèches */}
        {images.length > 1 && (
          <>
            <button className="ud-gallery__arrow ud-gallery__arrow--left" onClick={prev} aria-label="Image précédente">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <button className="ud-gallery__arrow ud-gallery__arrow--right" onClick={next} aria-label="Image suivante">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="ud-gallery__thumbs">
          {images.map((img, i) => (
            <button
              key={i}
              className={`ud-gallery__thumb${i === activeIndex ? ' ud-gallery__thumb--active' : ''}`}
              onClick={() => setActiveIndex(i)}
              aria-label={`Image ${i + 1}`}
            >
              <Image
                src={img}
                alt={`Miniature ${i + 1}`}
                fill
                sizes="80px"
                style={{ objectFit: 'cover' }}
              />
            </button>
          ))}
        </div>
      )}

      <style>{`
        .ud-gallery {}
        .ud-gallery__main {
          position: relative;
          width: 100%;
          padding-bottom: 75%;
          background: #EFEFEF;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        .ud-gallery__arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 36px; height: 36px; border-radius: 50%;
          background: white; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12); z-index: 2;
          color: #0A0A0A; transition: background 0.12s;
        }
        .ud-gallery__arrow:hover { background: #F5F5F5; }
        .ud-gallery__arrow--left { left: 12px; }
        .ud-gallery__arrow--right { right: 12px; }
        .ud-gallery__thumbs {
          display: flex; gap: 8px; flex-wrap: wrap;
        }
        .ud-gallery__thumb {
          position: relative;
          width: 64px; height: 64px;
          border-radius: 8px; overflow: hidden;
          background: #EFEFEF; border: 2px solid transparent;
          cursor: pointer; padding: 0;
          transition: border-color 0.15s;
          flex-shrink: 0;
        }
        .ud-gallery__thumb:hover { border-color: #9CA3AF; }
        .ud-gallery__thumb--active { border-color: #0A0A0A; }
      `}</style>
    </div>
  )
}
