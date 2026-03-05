'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
)

type ProductInfo = {
  id: string
  title: string
  price: number
  image_url?: string | null
  slug: string
}

type Props = {
  productId: string
  locale: string
  label: string
}

// ─── CSS global injecté une seule fois ────────────────────────────────────────
const MODAL_CSS = `
  .udm-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(10,10,10,0.65);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2147483647;
    padding: 24px;
    box-sizing: border-box;
    animation: udm-bg-in 0.22s ease;
  }
  .udm-box {
    background: #fff;
    border-radius: 20px;
    width: 100%;
    max-width: 460px;
    max-height: calc(100vh - 48px);
    overflow-y: auto;
    overflow-x: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 16px 40px rgba(0,0,0,0.16), 0 40px 80px rgba(0,0,0,0.18);
    animation: udm-box-in 0.3s cubic-bezier(0.34,1.5,0.64,1);
    scrollbar-width: none;
    flex-shrink: 0;
  }
  .udm-box::-webkit-scrollbar { display: none; }

  .udm-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 22px 22px 0;
    gap: 12px;
  }
  .udm-step-label {
    font-size: 11px;
    font-weight: 700;
    color: #9CA3AF;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 4px;
  }
  .udm-title {
    font-size: 20px;
    font-weight: 700;
    color: #0A0A0A;
    line-height: 1.2;
    margin: 0;
  }
  .udm-close {
    flex-shrink: 0;
    width: 32px; height: 32px;
    background: #F3F4F6;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #6B7280;
    transition: background 0.15s, color 0.15s;
  }
  .udm-close:hover { background: #E5E7EB; color: #0A0A0A; }

  .udm-body { padding: 18px 22px 22px; }

  .udm-subtitle {
    font-size: 14px;
    color: #6B7280;
    line-height: 1.55;
    margin: 0 0 18px;
  }
  .udm-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 7px;
  }
  .udm-input {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid #E5E7EB;
    border-radius: 10px;
    font-size: 15px;
    font-family: inherit;
    color: #0A0A0A;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;
    background: #fff;
  }
  .udm-input:focus {
    border-color: #0A0A0A;
    box-shadow: 0 0 0 3px rgba(10,10,10,0.06);
  }
  .udm-error {
    font-size: 13px;
    color: #EF4444;
    margin-top: 7px;
    line-height: 1.4;
  }

  .udm-btn-primary {
    width: 100%;
    margin-top: 14px;
    padding: 14px 20px;
    background: #0A0A0A;
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: opacity 0.15s, transform 0.1s;
  }
  .udm-btn-primary:hover:not(:disabled) { opacity: 0.88; }
  .udm-btn-primary:active:not(:disabled) { transform: scale(0.99); }
  .udm-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

  .udm-trust {
    display: flex;
    justify-content: center;
    gap: 18px;
    margin-top: 18px;
    flex-wrap: wrap;
    padding-top: 16px;
    border-top: 1px solid #F3F4F6;
  }
  .udm-trust-item {
    display: flex; align-items: center; gap: 5px;
    font-size: 12px; color: #6B7280;
  }

  .udm-recap {
    display: flex; align-items: center; gap: 12px;
    padding: 13px 14px;
    background: #F9FAFB;
    border-radius: 12px;
    border: 1px solid #E5E7EB;
    margin-bottom: 14px;
  }
  .udm-recap-img {
    width: 50px; height: 50px;
    border-radius: 8px; object-fit: cover; flex-shrink: 0;
  }
  .udm-recap-title {
    font-size: 14px; font-weight: 600; color: #0A0A0A;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    margin: 0 0 2px;
  }
  .udm-recap-price { font-size: 13px; color: #6B7280; margin: 0; }

  .udm-email-chip {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 13px;
    background: #F0FDF4; border: 1px solid #BBF7D0;
    border-radius: 8px; margin-bottom: 14px;
    font-size: 13px; color: #374151;
  }

  .udm-secure-note {
    display: flex; align-items: center; justify-content: center; gap: 5px;
    font-size: 12px; color: #9CA3AF; margin-top: 10px;
  }

  .udm-back-btn {
    width: 100%; margin-top: 10px; padding: 9px;
    background: none; border: none;
    font-size: 13px; color: #9CA3AF;
    cursor: pointer; font-family: inherit;
    transition: color 0.15s;
  }
  .udm-back-btn:hover { color: #374151; }

  .udm-success { padding: 28px 22px; text-align: center; }
  .udm-success-icon {
    width: 68px; height: 68px; border-radius: 50%;
    background: #DCFCE7;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 18px;
  }
  .udm-success-title { font-size: 21px; font-weight: 700; color: #0A0A0A; margin: 0 0 8px; }
  .udm-success-sub { font-size: 14px; color: #6B7280; line-height: 1.6; margin: 0 0 22px; }
  .udm-success-product {
    display: flex; align-items: center; gap: 12px;
    padding: 13px 14px; background: #F9FAFB;
    border-radius: 12px; border: 1px solid #E5E7EB;
    margin-bottom: 22px; text-align: left;
  }
  .udm-download-btn {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
    padding: 15px 20px; background: #0A0A0A; color: #fff;
    border-radius: 12px; font-size: 15px; font-weight: 600;
    text-decoration: none; transition: opacity 0.15s;
    margin-bottom: 10px; box-sizing: border-box;
  }
  .udm-download-btn:hover { opacity: 0.88; }
  .udm-dismiss-btn {
    background: none; border: none;
    font-size: 13px; color: #9CA3AF; cursor: pointer;
    font-family: inherit; padding: 8px; transition: color 0.15s;
  }
  .udm-dismiss-btn:hover { color: #374151; }

  .udm-divider { height: 1px; background: #F3F4F6; margin: 0 0 14px; }

  @keyframes udm-bg-in   { from { opacity: 0; } to { opacity: 1; } }
  @keyframes udm-box-in  { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
  @keyframes udm-spin    { to { transform: rotate(360deg); } }

  @media (max-width: 520px) {
    .udm-overlay { padding: 0; align-items: flex-end; }
    .udm-box {
      max-width: 100%;
      border-radius: 20px 20px 0 0;
      max-height: 96vh;
      animation: udm-sheet-in 0.3s cubic-bezier(0.34,1.3,0.64,1);
    }
  }
  @keyframes udm-sheet-in { from { transform: translateY(100%); opacity: 0.6; } to { transform: translateY(0); opacity: 1; } }
`

// ─── Spinner inline ────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ animation: 'udm-spin 0.75s linear infinite', flexShrink: 0 }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  )
}

// ─── Formulaire de paiement ────────────────────────────────────────────────────
function PaymentForm({
  paymentIntentId, product, locale, email, onSuccess,
}: {
  paymentIntentId: string
  product: ProductInfo
  locale: string
  email: string
  onSuccess: (token: string) => void
}) {
  const stripe   = useStripe()
  const elements = useElements()
  const [paying, setPaying] = useState(false)
  const [err,    setErr]    = useState<string | null>(null)
  const fr = locale === 'fr'

  const fmt = (cents: number) =>
    (cents / 100).toLocaleString(fr ? 'fr-FR' : 'en-US', { style: 'currency', currency: 'EUR' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setPaying(true)
    setErr(null)

    const { error: stripeErr, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: { receipt_email: email },
    })

    if (stripeErr) {
      setErr(stripeErr.message ?? (fr ? 'Paiement refusé.' : 'Payment declined.'))
      setPaying(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      try {
        const res  = await fetch('/api/stripe/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId }),
        })
        const data = await res.json()
        if (data.downloadToken) { onSuccess(data.downloadToken); return }
        setErr(fr ? 'Commande enregistrée — vérifiez votre email.' : 'Order saved — check your email.')
      } catch {
        setErr(fr ? 'Paiement reçu — vérifiez votre email.' : 'Payment received — check your email.')
      }
    }
    setPaying(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Récap produit */}
      <div className="udm-recap">
        {product.image_url && (
          <img src={product.image_url} alt={product.title} className="udm-recap-img" />
        )}
        <div style={{ minWidth: 0 }}>
          <p className="udm-recap-title">{product.title}</p>
          <p className="udm-recap-price">{fmt(product.price)}</p>
        </div>
      </div>

      {/* Email */}
      <div className="udm-email-chip">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
        <span>{email}</span>
      </div>

      <div className="udm-divider" />

      {/* Stripe Payment Element */}
      <PaymentElement options={{ layout: 'tabs', wallets: { applePay: 'auto', googlePay: 'auto' } }} />

      {err && <p className="udm-error" style={{ marginTop: 12 }}>{err}</p>}

      <button type="submit" disabled={paying || !stripe} className="udm-btn-primary" style={{ marginTop: 18 }}>
        {paying ? <><Spinner />{fr ? 'Traitement…' : 'Processing…'}</> : (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            {fr ? `Payer ${fmt(product.price)}` : `Pay ${fmt(product.price)}`}
          </>
        )}
      </button>

      <p className="udm-secure-note">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        {fr ? 'Paiement 100 % sécurisé par Stripe' : '100% secured by Stripe'}
      </p>
    </form>
  )
}

// ─── Écran succès ──────────────────────────────────────────────────────────────
function SuccessScreen({
  downloadToken, product, locale, onClose,
}: {
  downloadToken: string
  product: ProductInfo
  locale: string
  onClose: () => void
}) {
  const fr  = locale === 'fr'
  const url = `/api/download?token=${downloadToken}`
  return (
    <div className="udm-success">
      <div className="udm-success-icon">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h2 className="udm-success-title">{fr ? 'Paiement confirmé !' : 'Payment confirmed!'}</h2>
      <p className="udm-success-sub">
        {fr
          ? 'Votre fichier est prêt. Téléchargez-le maintenant ou retrouvez le lien dans votre email de confirmation.'
          : 'Your file is ready. Download it now or find the link in your confirmation email.'}
      </p>
      <div className="udm-success-product">
        {product.image_url && (
          <img src={product.image_url} alt={product.title}
            style={{ width: 46, height: 46, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
        )}
        <div>
          <p style={{ fontWeight: 600, fontSize: 14, color: '#0A0A0A', margin: '0 0 2px' }}>{product.title}</p>
          <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>
            {fr ? '5 téléchargements · 30 jours' : '5 downloads · 30 days'}
          </p>
        </div>
      </div>
      <a href={url} className="udm-download-btn">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        {fr ? 'Télécharger mon fichier' : 'Download my file'}
      </a>
      <button className="udm-dismiss-btn" onClick={onClose}>
        {fr ? 'Fermer' : 'Close'}
      </button>
    </div>
  )
}

// ─── Composant principal ───────────────────────────────────────────────────────
export default function BuyButton({ productId, locale, label }: Props) {
  const [isOpen,          setIsOpen]          = useState(false)
  const [step,            setStep]            = useState<'email' | 'payment' | 'success'>('email')
  const [email,           setEmail]           = useState('')
  const [emailErr,        setEmailErr]        = useState('')
  const [loading,         setLoading]         = useState(false)
  const [clientSecret,    setClientSecret]    = useState<string | null>(null)
  const [piId,            setPiId]            = useState<string | null>(null)
  const [product,         setProduct]         = useState<ProductInfo | null>(null)
  const [downloadToken,   setDownloadToken]   = useState<string | null>(null)
  const [generalErr,      setGeneralErr]      = useState<string | null>(null)
  const [mounted,         setMounted]         = useState(false)
  const styleInjected = useRef(false)

  const fr = locale === 'fr'

  // Client-only mount (portal nécessite document)
  useEffect(() => {
    setMounted(true)
    // Injecter le CSS global une seule fois
    if (!styleInjected.current && typeof document !== 'undefined') {
      const existing = document.getElementById('udm-styles')
      if (!existing) {
        const tag = document.createElement('style')
        tag.id = 'udm-styles'
        tag.textContent = MODAL_CSS
        document.head.appendChild(tag)
      }
      styleInjected.current = true
    }
  }, [])

  // Escape pour fermer
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen]) // eslint-disable-line

  // Bloquer le scroll + compenser scrollbar
  useEffect(() => {
    if (isOpen) {
      const w = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow    = 'hidden'
      document.body.style.paddingRight = `${w}px`
    } else {
      document.body.style.overflow    = ''
      document.body.style.paddingRight = ''
    }
    return () => {
      document.body.style.overflow    = ''
      document.body.style.paddingRight = ''
    }
  }, [isOpen])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setTimeout(() => {
      setStep('email'); setEmail(''); setEmailErr('')
      setClientSecret(null); setPiId(null)
      setDownloadToken(null); setGeneralErr(null)
    }, 320)
  }, [])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setEmailErr(fr ? 'Entrez un email valide.' : 'Enter a valid email.')
      return
    }
    setEmailErr(''); setLoading(true); setGeneralErr(null)
    try {
      const res  = await fetch('/api/stripe/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, locale, email }),
      })
      const data = await res.json()
      if (!res.ok || !data.clientSecret) {
        setGeneralErr(data.error ?? (fr ? 'Erreur de création du paiement.' : 'Error creating payment.'))
        return
      }
      setClientSecret(data.clientSecret)
      setPiId(data.paymentIntentId)
      setProduct(data.product)
      setStep('payment')
    } catch {
      setGeneralErr(fr ? 'Erreur réseau. Réessayez.' : 'Network error. Please retry.')
    } finally {
      setLoading(false)
    }
  }

  // ── Contenu de la modal ──
  const modalContent = (
    <div
      className="udm-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div className="udm-box" role="dialog" aria-modal="true" aria-label={fr ? 'Fenêtre de paiement' : 'Payment window'}>

        {/* Header (masqué en succès) */}
        {step !== 'success' && (
          <div className="udm-header">
            <div>
              <p className="udm-step-label">
                {step === 'email' ? (fr ? 'Étape 1 / 2' : 'Step 1 / 2') : (fr ? 'Étape 2 / 2' : 'Step 2 / 2')}
              </p>
              <h2 className="udm-title">
                {step === 'email' ? (fr ? 'Votre adresse email' : 'Your email address') : (fr ? 'Paiement sécurisé' : 'Secure payment')}
              </h2>
            </div>
            <button className="udm-close" onClick={handleClose} aria-label="Fermer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )}

        {/* Étape 1 — Email */}
        {step === 'email' && (
          <div className="udm-body">
            <p className="udm-subtitle">
              {fr
                ? 'Entrez votre email pour recevoir votre fichier après paiement.'
                : 'Enter your email to receive your file after payment.'}
            </p>
            <form onSubmit={handleEmailSubmit}>
              <label className="udm-label">{fr ? 'Adresse email' : 'Email address'}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={fr ? 'votre@email.com' : 'your@email.com'}
                className="udm-input"
                autoFocus
                autoComplete="email"
              />
              {emailErr   && <p className="udm-error">{emailErr}</p>}
              {generalErr && <p className="udm-error">{generalErr}</p>}
              <button type="submit" disabled={loading} className="udm-btn-primary">
                {loading
                  ? <><Spinner />{fr ? 'Chargement…' : 'Loading…'}</>
                  : <>{fr ? 'Continuer vers le paiement' : 'Continue to payment'}
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </>
                }
              </button>
            </form>
            <div className="udm-trust">
              {[
                fr ? 'Accès immédiat' : 'Immediate access',
                fr ? '5 téléchargements' : '5 downloads',
                fr ? 'Paiement sécurisé' : 'Secure payment',
              ].map((t) => (
                <span key={t} className="udm-trust-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Étape 2 — Paiement */}
        {step === 'payment' && clientSecret && product && piId && (
          <div className="udm-body">
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#0A0A0A',
                    colorBackground: '#ffffff',
                    colorText: '#0A0A0A',
                    colorDanger: '#EF4444',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    borderRadius: '10px',
                    spacingUnit: '4px',
                  },
                },
                locale: locale === 'fr' ? 'fr' : 'en',
              }}
            >
              <PaymentForm
                paymentIntentId={piId}
                product={product}
                locale={locale}
                email={email}
                onSuccess={(token) => { setDownloadToken(token); setStep('success') }}
              />
            </Elements>
            <button className="udm-back-btn" onClick={() => setStep('email')}>
              ← {fr ? "Modifier l'email" : 'Change email'}
            </button>
          </div>
        )}

        {/* Étape 3 — Succès */}
        {step === 'success' && product && downloadToken && (
          <SuccessScreen
            downloadToken={downloadToken}
            product={product}
            locale={locale}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Bouton déclencheur */}
      <button onClick={() => setIsOpen(true)} className="ud-buy-btn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
        {label}
      </button>

      {/* Portal — rendu directement sur document.body, HORS de tout stacking context */}
      {mounted && isOpen && createPortal(modalContent, document.body)}

      {/* Style du bouton uniquement (le reste est injecté dans <head>) */}
      <style>{`
        .ud-buy-btn {
          width: 100%;
          padding: 15px 20px;
          background: #0A0A0A;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.15s, transform 0.1s;
        }
        .ud-buy-btn:hover  { opacity: 0.87; }
        .ud-buy-btn:active { transform: scale(0.99); }
      `}</style>
    </>
  )
}
