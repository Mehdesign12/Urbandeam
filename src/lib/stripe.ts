import Stripe from 'stripe'

// Lazy getter — ne crash pas au build si la variable est absente
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  return new Stripe(key, {
    apiVersion: '2026-02-25.clover',
    typescript: true,
  })
}

let _stripe: Stripe | null = null
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    if (!_stripe) _stripe = getStripe()
    return (_stripe as unknown as Record<string | symbol, unknown>)[prop]
  },
})
