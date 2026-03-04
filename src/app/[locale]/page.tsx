import { useTranslations } from 'next-intl'

export default function HomePage() {
  const t = useTranslations('hero')

  return (
    <main style={{ padding: '60px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '16px' }}>
        Urban<span style={{ color: '#A3A3A3' }}>dream</span>
      </h1>
      <p style={{ color: '#525252', fontSize: '18px' }}>
        {t('subtitle')}
      </p>
      <p style={{ marginTop: '32px', color: '#A3A3A3', fontSize: '13px' }}>
        🚧 Phase 2 en cours — le design complet arrive bientôt.
      </p>
    </main>
  )
}
