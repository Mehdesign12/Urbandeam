import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import LegalLayout from '@/components/legal/LegalLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Urbandeam',
  description: 'Learn how Urbandeam collects, uses, and protects your personal data. GDPR & CCPA compliant.',
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!routing.locales.includes(locale as 'fr' | 'en')) notFound()

  return (
    <LegalLayout locale={locale} current="privacy" title="Privacy Policy" lastUpdated="March 1, 2025">
      <h2>1. Who We Are</h2>
      <p>
        This Privacy Policy describes how <strong>Diez Agency LLC</strong> ("Urbandeam," "we," "us," or "our")
        collects, uses, and protects your personal data when you visit{' '}
        <a href="https://urbandeam.com">urbandeam.com</a> or make a purchase.
      </p>
      <p>
        Diez Agency LLC · 539 W. Commerce St #3083 · Dallas, TX 75208 · United States<br />
        Contact: <a href="mailto:contact@urbandeam.com">contact@urbandeam.com</a>
      </p>

      <h2>2. Data We Collect</h2>
      <h3>2.1 Data you provide directly</h3>
      <ul>
        <li><strong>Email address</strong> — required to deliver your purchase and send order confirmations.</li>
        <li><strong>Name</strong> — collected optionally at checkout.</li>
        <li><strong>Payment data</strong> — processed entirely by Stripe. We never store card numbers, CVV, or
        full payment details on our servers.</li>
      </ul>

      <h3>2.2 Data collected automatically</h3>
      <ul>
        <li><strong>IP address and browser information</strong> — collected for security and fraud prevention.</li>
        <li><strong>Usage data</strong> — pages visited, time spent, referral source (via analytics tools).</li>
        <li><strong>Cookies</strong> — see Section 7 for details.</li>
      </ul>

      <h3>2.3 Data we do NOT collect</h3>
      <ul>
        <li>We do not collect sensitive personal data (health, religion, political views, etc.).</li>
        <li>We do not collect data from children under 16. If you are under 16, do not use this site.</li>
      </ul>

      <h2>3. How We Use Your Data</h2>
      <ul>
        <li><strong>Order fulfillment:</strong> delivering your download link and order confirmation email.</li>
        <li><strong>Customer support:</strong> responding to your questions and resolving issues.</li>
        <li><strong>Legal compliance:</strong> meeting our legal and tax obligations.</li>
        <li><strong>Fraud prevention:</strong> detecting and preventing fraudulent transactions.</li>
        <li><strong>Marketing (with consent):</strong> sending newsletters if you have opted in.
          You can unsubscribe at any time.</li>
        <li><strong>Analytics:</strong> understanding how our site is used to improve our products and
          user experience.</li>
      </ul>

      <h2>4. Legal Basis for Processing (GDPR)</h2>
      <p>For customers in the European Union, we process your data on the following legal bases:</p>
      <ul>
        <li><strong>Contract performance</strong> (Art. 6(1)(b) GDPR) — to fulfill your order.</li>
        <li><strong>Legal obligation</strong> (Art. 6(1)(c) GDPR) — for tax and legal compliance.</li>
        <li><strong>Legitimate interests</strong> (Art. 6(1)(f) GDPR) — for fraud prevention and
          site security.</li>
        <li><strong>Consent</strong> (Art. 6(1)(a) GDPR) — for marketing emails and non-essential cookies.</li>
      </ul>

      <h2>5. Payment Processing — Stripe</h2>
      <p>
        All payments are processed by <strong>Stripe, Inc.</strong> (354 Oyster Point Blvd, South San Francisco,
        CA 94080, USA). Stripe collects and processes your payment information directly under their own{' '}
        <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
      </p>
      <p>
        We receive only a transaction confirmation and the last 4 digits of the card for reference.
        <strong> We never store your full card number or CVV.</strong>
      </p>

      <h2>6. Data Sharing & Third Parties</h2>
      <p>We do not sell your personal data. We share data only with:</p>
      <ul>
        <li><strong>Stripe</strong> — payment processing.</li>
        <li><strong>Resend</strong> — transactional email delivery (order confirmations).</li>
        <li><strong>Supabase</strong> — secure database storage (EU region when possible).</li>
        <li><strong>Vercel</strong> — website hosting and edge computing.</li>
      </ul>
      <p>
        All third-party processors are bound by data processing agreements and are required to maintain
        appropriate security standards.
      </p>

      <h2>7. Cookies & Tracking</h2>
      <p>We use the following types of cookies:</p>
      <ul>
        <li>
          <strong>Essential cookies:</strong> Required for the site to function (session management,
          cart, security). Cannot be disabled.
        </li>
        <li>
          <strong>Analytics cookies (Umami):</strong> Privacy-friendly, cookieless analytics to understand
          site usage. No personal data is shared with third parties.
        </li>
        <li>
          <strong>Marketing pixels (Meta Pixel):</strong> Used to measure ad performance and retargeting.
          Only activated with your consent. You can opt out via your browser settings or our cookie banner.
        </li>
      </ul>
      <p>
        You can manage or withdraw cookie consent at any time through your browser settings.
      </p>

      <h2>8. Data Retention</h2>
      <ul>
        <li><strong>Order data:</strong> retained for 7 years to comply with tax and accounting obligations.</li>
        <li><strong>Email address (newsletter):</strong> retained until you unsubscribe.</li>
        <li><strong>Analytics data:</strong> aggregated and anonymized, retained for up to 24 months.</li>
        <li><strong>Download tokens:</strong> automatically deleted after 30 days of expiry.</li>
      </ul>

      <h2>9. International Data Transfers</h2>
      <p>
        As a US-based company serving international customers, your data may be transferred to and processed
        in the United States. For EU customers, such transfers are conducted under appropriate safeguards,
        including Standard Contractual Clauses (SCCs) where applicable, as required by GDPR Chapter V.
      </p>

      <h2>10. Your Rights</h2>
      <h3>EU / GDPR Rights</h3>
      <ul>
        <li><strong>Access:</strong> request a copy of the personal data we hold about you.</li>
        <li><strong>Rectification:</strong> request correction of inaccurate data.</li>
        <li><strong>Erasure ("right to be forgotten"):</strong> request deletion of your data, subject to
          legal retention requirements.</li>
        <li><strong>Portability:</strong> receive your data in a structured, machine-readable format.</li>
        <li><strong>Restriction:</strong> request that we limit the processing of your data.</li>
        <li><strong>Objection:</strong> object to processing based on legitimate interests or for
          direct marketing.</li>
        <li><strong>Withdraw consent:</strong> at any time, for consent-based processing (e.g., newsletter).</li>
      </ul>
      <h3>California / CCPA Rights</h3>
      <ul>
        <li>Right to know what personal information is collected, used, shared, or sold.</li>
        <li>Right to delete personal information.</li>
        <li>Right to opt out of the sale of personal information (we do not sell data).</li>
        <li>Right to non-discrimination for exercising your privacy rights.</li>
      </ul>
      <p>
        To exercise any of these rights, contact us at{' '}
        <a href="mailto:contact@urbandeam.com">contact@urbandeam.com</a>. We will respond within 30 days.
      </p>

      <h2>11. Data Security</h2>
      <p>
        We implement appropriate technical and organizational measures to protect your data, including
        HTTPS encryption, secure database access controls, and limited staff access. However, no system
        is 100% secure. If you suspect a security issue, please contact us immediately.
      </p>

      <h2>12. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The updated version will be posted on this
        page with a revised date. For significant changes, we will notify you by email.
      </p>

      <h2>13. Contact & Complaints</h2>
      <p>
        For any privacy-related questions: <a href="mailto:contact@urbandeam.com">contact@urbandeam.com</a>
      </p>
      <p>
        EU residents who are not satisfied with our response may lodge a complaint with their local
        data protection authority (e.g., CNIL in France, ICO in the UK).
      </p>
    </LegalLayout>
  )
}
