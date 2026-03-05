'use client'

import { useState, useEffect, useCallback } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

// Charger Stripe une seule fois
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
)

// ─── Types ──────────────────────────────────────────────────────────────────
type ProductInfo = {
  id: string
  title: string
  price: number
  image_url?: string | null
  slug: string
}

type CheckoutModalProps = {
  productId: string
  locale: string
  label: string
}

// ─── Sous-composant: formulaire de paiement Stripe ──────────────────────────
function PaymentForm({
  clientSecret,
  paymentIntentId,
  product,
  locale,
  email,
  onSuccess,
}: {
  clientSecret: string
  paymentIntentId: string
  product: ProductInfo
  locale: string
  email: string
  onSuccess: (token: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [paying, setPaying] = useState(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const fr = locale === 'fr'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setPaying(true)
    setErrMsg(null)

    // Confirmer le paiement avec Stripe
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        receipt_email: email,
        return_url: `${window.location.origin}/${locale}/success`,
      },
    })

    if (stripeError) {
      setErrMsg(stripeError.message ?? (fr ? 'Paiement refusé.' : 'Payment declined.'))
      setPaying(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      // Confirmer côté serveur + obtenir le download token
      try {
        const res = await fetch('/api/stripe/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId }),
        })
        const data = await res.json()
        if (data.downloadToken) {
          onSuccess(data.downloadToken)
        } else {
          setErrMsg(fr ? 'Commande enregistrée. Vérifiez votre email.' : 'Order recorded. Check your email.')
          setPaying(false)
        }
      } catch {
        setErrMsg(fr ? 'Paiement reçu. Vérifiez votre email.' : 'Payment received. Check your email.')
        setPaying(false)
      }
    } else {
      setPaying(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Récap produit */}
      <div className="ud-modal__recap">
        {product.image_url && (
          <img src={product.image_url} alt={product.title} className="ud-modal__recap-img" />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="ud-modal__recap-title">{product.title}</p>
          <p className="ud-modal__recap-price">
            {(product.price / 100).toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US', {
              style: 'currency', currency: 'EUR',
            })}
          </p>
        </div>
      </div>

      {/* Email affiché */}
      <div className="ud-modal__email-display">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
        <span>{email}</span>
      </div>

      {/* Stripe Payment Element */}
      <div style={{ margin: '20px 0' }}>
        <PaymentElement
          options={{
            layout: 'tabs',
            wallets: { applePay: 'auto', googlePay: 'auto' },
          }}
        />
      </div>

      {errMsg && (
        <p className="ud-modal__error">{errMsg}</p>
      )}

      <button type="submit" disabled={paying || !stripe} className="ud-modal__pay-btn">
        {paying ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'ud-spin 0.8s linear infinite' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            {fr ? 'Traitement…' : 'Processing…'}
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            {fr
              ? `Payer ${(product.price / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`
              : `Pay ${(product.price / 100).toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}`
            }
          </>
        )}
      </button>

      <p className="ud-modal__secure-note">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        {fr ? 'Paiement 100% sécurisé par Stripe' : 'Secured 100% by Stripe'}
      </p>
    </form>
  )
}

// ─── Sous-composant: succès + téléchargement immédiat ────────────────────────
function SuccessStep({
  downloadToken,
  product,
  locale,
  onClose,
}: {
  downloadToken: string
  product: ProductInfo
  locale: string
  onClose: () => void
}) {
  const fr = locale === 'fr'
  const downloadUrl = `/api/download?token=${downloadToken}`

  return (
    <div className="ud-modal__success">
      {/* Icône */}
      <div className="ud-modal__success-icon">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <h2 className="ud-modal__success-title">
        {fr ? 'Paiement confirmé !' : 'Payment confirmed!'}
      </h2>

      <p className="ud-modal__success-sub">
        {fr
          ? 'Votre fichier est prêt. Téléchargez-le maintenant ou retrouvez le lien dans votre email de confirmation.'
          : 'Your file is ready. Download it now or find the link in your confirmation email.'}
      </p>

      {/* Récap produit */}
      <div className="ud-modal__success-product">
        {product.image_url && (
          <img src={product.image_url} alt={product.title} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
        )}
        <div>
          <p style={{ fontWeight: 600, fontSize: 14, color: '#0A0A0A' }}>{product.title}</p>
          <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
            {fr ? '5 téléchargements · 30 jours' : '5 downloads · 30 days'}
          </p>
        </div>
      </div>

      {/* Bouton téléchargement */}
      <a href={downloadUrl} download className="ud-modal__download-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        {fr ? 'Télécharger mon fichier' : 'Download my file'}
      </a>

      <button onClick={onClose} className="ud-modal__close-text">
        {fr ? 'Fermer' : 'Close'}
      </button>
    </div>
  )
}

// ─── Composant principal ─────────────────────────────────────────────────────
export default function BuyButton({ productId, locale, label }: CheckoutModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<'email' | 'payment' | 'success'>('email')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [loading, setLoading] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [product, setProduct] = useState<ProductInfo | null>(null)
  const [downloadToken, setDownloadToken] = useState<string | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)

  const fr = locale === 'fr'

  // Fermer avec Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    if (isOpen) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen])

  // Bloquer le scroll quand ouvert — compenser la scrollbar pour éviter le décalage
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [isOpen])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    // Réinitialiser après fermeture
    setTimeout(() => {
      setStep('email')
      setEmail('')
      setEmailError('')
      setClientSecret(null)
      setPaymentIntentId(null)
      setDownloadToken(null)
      setGeneralError(null)
    }, 300)
  }, [])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setEmailError(fr ? 'Entrez un email valide.' : 'Enter a valid email.')
      return
    }
    setEmailError('')
    setLoading(true)
    setGeneralError(null)

    try {
      const res = await fetch('/api/stripe/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, locale, email }),
      })
      const data = await res.json()

      if (!res.ok || !data.clientSecret) {
        setGeneralError(data.error ?? (fr ? 'Erreur lors de la création du paiement.' : 'Error creating payment.'))
        setLoading(false)
        return
      }

      setClientSecret(data.clientSecret)
      setPaymentIntentId(data.paymentIntentId)
      setProduct(data.product)
      setStep('payment')
    } catch {
      setGeneralError(fr ? 'Erreur réseau. Veuillez réessayer.' : 'Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Bouton principal */}
      <button onClick={() => setIsOpen(true)} className="ud-buy-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
        {label}
      </button>

      {/* Overlay + Modal */}
      {isOpen && (
        <div className="ud-modal__overlay" onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}>
          <div className="ud-modal__box" role="dialog" aria-modal="true">

            {/* Header */}
            {step !== 'success' && (
              <div className="ud-modal__header">
                <div>
                  <p className="ud-modal__step-label">
                    {step === 'email'
                      ? (fr ? 'Étape 1 / 2' : 'Step 1 / 2')
                      : (fr ? 'Étape 2 / 2' : 'Step 2 / 2')}
                  </p>
                  <h2 className="ud-modal__title">
                    {step === 'email'
                      ? (fr ? 'Votre adresse email' : 'Your email address')
                      : (fr ? 'Paiement sécurisé' : 'Secure payment')}
                  </h2>
                </div>
                <button onClick={handleClose} className="ud-modal__close-btn" aria-label="Fermer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            )}

            {/* Étape 1 : email */}
            {step === 'email' && (
              <div className="ud-modal__body">
                <p className="ud-modal__subtitle">
                  {fr
                    ? 'Entrez votre email pour recevoir votre fichier après paiement.'
                    : 'Enter your email to receive your file after payment.'}
                </p>
                <form onSubmit={handleEmailSubmit}>
                  <label className="ud-modal__label">
                    {fr ? 'Adresse email' : 'Email address'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={fr ? 'votre@email.com' : 'your@email.com'}
                    className="ud-modal__input"
                    autoFocus
                    autoComplete="email"
                  />
                  {emailError && <p className="ud-modal__error">{emailError}</p>}
                  {generalError && <p className="ud-modal__error">{generalError}</p>}

                  <button type="submit" disabled={loading} className="ud-modal__next-btn">
                    {loading ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'ud-spin 0.8s linear infinite' }}>
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                        {fr ? 'Chargement…' : 'Loading…'}
                      </>
                    ) : (
                      <>
                        {fr ? 'Continuer vers le paiement' : 'Continue to payment'}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"/>
                          <polyline points="12 5 19 12 12 19"/>
                        </svg>
                      </>
                    )}
                  </button>
                </form>

                <div className="ud-modal__trust">
                  <div className="ud-modal__trust-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>{fr ? 'Accès immédiat' : 'Immediate access'}</span>
                  </div>
                  <div className="ud-modal__trust-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>{fr ? '5 téléchargements' : '5 downloads'}</span>
                  </div>
                  <div className="ud-modal__trust-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>{fr ? 'Paiement sécurisé' : 'Secure payment'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 2 : paiement Stripe */}
            {step === 'payment' && clientSecret && product && paymentIntentId && (
              <div className="ud-modal__body">
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#0A0A0A',
                        colorBackground: '#FFFFFF',
                        colorText: '#0A0A0A',
                        colorDanger: '#EF4444',
                        fontFamily: 'inherit',
                        borderRadius: '8px',
                        spacingUnit: '4px',
                      },
                    },
                    locale: locale === 'fr' ? 'fr' : 'en',
                  }}
                >
                  <PaymentForm
                    clientSecret={clientSecret}
                    paymentIntentId={paymentIntentId}
                    product={product}
                    locale={locale}
                    email={email}
                    onSuccess={(token) => {
                      setDownloadToken(token)
                      setStep('success')
                    }}
                  />
                </Elements>

                <button
                  onClick={() => setStep('email')}
                  className="ud-modal__back-btn"
                >
                  ← {fr ? 'Modifier l\'email' : 'Change email'}
                </button>
              </div>
            )}

            {/* Étape 3 : succès */}
            {step === 'success' && product && downloadToken && (
              <SuccessStep
                downloadToken={downloadToken}
                product={product}
                locale={locale}
                onClose={handleClose}
              />
            )}
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        /* ── Bouton principal ── */
        .ud-buy-btn {
          width: 100%;
          padding: 15px 24px;
          background: #0A0A0A;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.15s;
        }
        .ud-buy-btn:hover { opacity: 0.85; }

        /* ── Overlay ── */
        .ud-modal__overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          /* z-index très élevé pour passer au-dessus des flèches galerie (z-index:2) et sticky bar (z-index:300) */
          z-index: 99999;
          padding: 20px;
          animation: ud-fade-in 0.2s ease;
          /* Isolation du stacking context */
          isolation: isolate;
        }

        /* ── Modal box ── */
        .ud-modal__box {
          background: #FFFFFF;
          border-radius: 20px;
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow:
            0 0 0 1px rgba(0,0,0,0.06),
            0 8px 24px rgba(0,0,0,0.08),
            0 32px 80px rgba(0,0,0,0.22);
          animation: ud-slide-up 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
          /* Scroll smooth */
          scrollbar-width: thin;
          scrollbar-color: #E5E7EB transparent;
          /* Position centrée — compenser le padding-right du body */
          position: relative;
          margin: auto;
        }

        /* ── Header ── */
        .ud-modal__header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 24px 24px 0;
        }
        .ud-modal__step-label {
          font-size: 11px;
          font-weight: 600;
          color: #9CA3AF;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
        }
        .ud-modal__title {
          font-size: 20px;
          font-weight: 700;
          color: #0A0A0A;
          line-height: 1.2;
        }
        .ud-modal__close-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: #9CA3AF;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: background 0.15s;
          flex-shrink: 0;
          margin-left: 12px;
        }
        .ud-modal__close-btn:hover { background: #F3F4F6; color: #0A0A0A; }

        /* ── Body ── */
        .ud-modal__body { padding: 20px 24px 24px; }
        .ud-modal__subtitle {
          font-size: 14px;
          color: #6B7280;
          line-height: 1.5;
          margin-bottom: 20px;
        }
        .ud-modal__label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }
        .ud-modal__input {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid #E5E7EB;
          border-radius: 8px;
          font-size: 15px;
          font-family: inherit;
          color: #0A0A0A;
          outline: none;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .ud-modal__input:focus { border-color: #0A0A0A; }
        .ud-modal__error {
          font-size: 13px;
          color: #EF4444;
          margin-top: 8px;
          line-height: 1.4;
        }

        /* ── Boutons ── */
        .ud-modal__next-btn {
          width: 100%;
          margin-top: 16px;
          padding: 14px 24px;
          background: #0A0A0A;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.15s;
        }
        .ud-modal__next-btn:hover:not(:disabled) { opacity: 0.85; }
        .ud-modal__next-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .ud-modal__pay-btn {
          width: 100%;
          padding: 14px 24px;
          background: #0A0A0A;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.15s;
        }
        .ud-modal__pay-btn:hover:not(:disabled) { opacity: 0.85; }
        .ud-modal__pay-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .ud-modal__back-btn {
          width: 100%;
          margin-top: 12px;
          padding: 10px;
          background: none;
          border: none;
          font-size: 13px;
          color: #6B7280;
          cursor: pointer;
          font-family: inherit;
          transition: color 0.15s;
        }
        .ud-modal__back-btn:hover { color: #0A0A0A; }

        /* ── Trust badges ── */
        .ud-modal__trust {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 20px;
          flex-wrap: wrap;
        }
        .ud-modal__trust-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: #6B7280;
        }

        /* ── Récap produit (dans formulaire paiement) ── */
        .ud-modal__recap {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: #F9FAFB;
          border-radius: 10px;
          border: 1px solid #E5E7EB;
          margin-bottom: 16px;
        }
        .ud-modal__recap-img {
          width: 52px;
          height: 52px;
          border-radius: 8px;
          object-fit: cover;
          flex-shrink: 0;
        }
        .ud-modal__recap-title {
          font-size: 14px;
          font-weight: 600;
          color: #0A0A0A;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ud-modal__recap-price {
          font-size: 13px;
          color: #6B7280;
          margin-top: 2px;
        }

        /* ── Email display (étape paiement) ── */
        .ud-modal__email-display {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          border-radius: 8px;
          margin-bottom: 4px;
          font-size: 13px;
          color: #374151;
        }

        /* ── Note sécurisé ── */
        .ud-modal__secure-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-size: 12px;
          color: #9CA3AF;
          margin-top: 12px;
        }

        /* ── Succès ── */
        .ud-modal__success {
          padding: 32px 24px;
          text-align: center;
        }
        .ud-modal__success-icon {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: #DCFCE7;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }
        .ud-modal__success-title {
          font-size: 22px;
          font-weight: 700;
          color: #0A0A0A;
          margin-bottom: 10px;
        }
        .ud-modal__success-sub {
          font-size: 14px;
          color: #6B7280;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .ud-modal__success-product {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: #F9FAFB;
          border-radius: 10px;
          border: 1px solid #E5E7EB;
          margin-bottom: 24px;
          text-align: left;
        }
        .ud-modal__download-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 15px 24px;
          background: #0A0A0A;
          color: white;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.15s;
          margin-bottom: 12px;
          box-sizing: border-box;
        }
        .ud-modal__download-btn:hover { opacity: 0.85; }
        .ud-modal__close-text {
          background: none;
          border: none;
          font-size: 13px;
          color: #9CA3AF;
          cursor: pointer;
          font-family: inherit;
          padding: 8px;
          transition: color 0.15s;
        }
        .ud-modal__close-text:hover { color: #374151; }

        /* ── Animations ── */
        @keyframes ud-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes ud-slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @keyframes ud-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        @media (max-width: 540px) {
          .ud-modal__overlay { padding: 0; align-items: flex-end; }
          .ud-modal__box {
            border-radius: 20px 20px 0 0;
            max-width: 100%;
            max-height: 96vh;
            animation: ud-slide-up-mobile 0.28s cubic-bezier(0.34, 1.2, 0.64, 1);
          }
          .ud-modal__trust { gap: 10px; }
        }
        @keyframes ud-slide-up-mobile {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  )
}
