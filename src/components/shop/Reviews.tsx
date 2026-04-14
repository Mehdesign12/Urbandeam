type Review = {
  title: string
  text: string
  author: string
}

export default function Reviews({ items, heading }: { items: Review[]; heading: string }) {
  return (
    <section className="ud-reviews">
      <h2 className="ud-reviews__title">
        {heading}
        <span aria-hidden="true" style={{ marginLeft: 8 }}>😊</span>
      </h2>

      <div className="ud-reviews__grid">
        {items.map((r, i) => (
          <article key={i} className="ud-reviews__card">
            <span className="ud-reviews__quote" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.17 17c-.51 0-.98-.2-1.34-.56a1.85 1.85 0 0 1-.55-1.34V9.8c0-.51.2-.98.55-1.34.36-.36.83-.56 1.34-.56h3.69v2.87H8.1v.94h2.76V17H7.17Zm6.97 0c-.51 0-.98-.2-1.33-.56a1.85 1.85 0 0 1-.55-1.34V9.8c0-.51.19-.98.55-1.34.35-.36.82-.56 1.33-.56h3.7v2.87h-2.77v.94h2.77V17h-3.7Z"/>
              </svg>
            </span>

            <div className="ud-reviews__stars" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, k) => (
                <svg key={k} width="14" height="14" viewBox="0 0 24 24" fill="#FFB800">
                  <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
              ))}
            </div>

            <h3 className="ud-reviews__card-title">{r.title}</h3>
            <p className="ud-reviews__card-text">{r.text}</p>

            <div className="ud-reviews__author">
              <span className="ud-reviews__avatar" aria-hidden="true">
                {r.author.trim().charAt(0).toUpperCase()}
              </span>
              <span className="ud-reviews__author-name">{r.author}</span>
            </div>
          </article>
        ))}
      </div>

      <style>{`
        .ud-reviews {
          padding-top: 48px;
          border-top: 1px solid #F0F0F0;
        }
        @media (min-width: 768px) { .ud-reviews { padding-top: 60px; } }

        .ud-reviews__title {
          font-size: 20px;
          font-weight: 700;
          color: #0A0A0A;
          letter-spacing: -0.02em;
          margin-bottom: 24px;
          text-align: center;
          font-family: var(--font-heading);
        }
        @media (min-width: 768px) {
          .ud-reviews__title { font-size: 22px; margin-bottom: 32px; }
        }

        .ud-reviews__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 768px) {
          .ud-reviews__grid { grid-template-columns: repeat(3, 1fr); gap: 20px; }
        }

        .ud-reviews__card {
          position: relative;
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 14px;
          padding: 20px 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ud-reviews__quote {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #0A0A0A;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ud-reviews__stars {
          display: flex;
          gap: 2px;
          margin-bottom: 4px;
        }

        .ud-reviews__card-title {
          font-size: 14px;
          font-weight: 700;
          color: #0A0A0A;
          line-height: 1.4;
          text-align: center;
        }

        .ud-reviews__card-text {
          font-size: 13px;
          color: #374151;
          line-height: 1.6;
          flex-grow: 1;
        }

        .ud-reviews__author {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          padding-top: 12px;
          border-top: 1px solid #F0F0F0;
        }

        .ud-reviews__avatar {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #E5E7EB;
          color: #0A0A0A;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
        }

        .ud-reviews__author-name {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
        }
      `}</style>
    </section>
  )
}
