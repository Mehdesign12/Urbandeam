import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import LegalLayout from '@/components/legal/LegalLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions — Urbandeam',
  description: 'Terms and conditions governing the use of Urbandeam and the purchase of digital products.',
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!routing.locales.includes(locale as 'fr' | 'en')) notFound()

  return (
    <LegalLayout locale={locale} current="terms" title="Terms & Conditions" lastUpdated="March 1, 2025">
      <h2>1. Introduction</h2>
      <p>
        Welcome to <strong>Urbandeam</strong> ("we," "us," or "our"), a digital product store operated by
        <strong> Diez Agency LLC</strong>, a limited liability company registered in the State of Texas, United States
        (539 W. Commerce St #3083, Dallas, TX 75208).
      </p>
      <p>
        By accessing our website at <a href="https://urbandeam.com">urbandeam.com</a> or purchasing any product,
        you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.
      </p>

      <h2>2. Products & Nature of Sales</h2>
      <p>
        All products sold on Urbandeam are <strong>100% digital</strong> (Excel templates, PDF guides, Notion
        templates, and other digital files). No physical goods are shipped.
      </p>
      <p>
        Upon completing your purchase, you will receive an email with a secure download link valid for
        <strong> 5 downloads within 30 days</strong>. Please save your file immediately after downloading.
      </p>
      <div className="ud-legal__highlight">
        <p>
          ⚠️ <strong>Important:</strong> Because our products are digital and delivered immediately upon purchase,
          they are generally <strong>non-refundable</strong> once the download has been initiated. Please refer to
          our Refund Policy for exceptions and EU consumer rights.
        </p>
      </div>

      <h2>3. Orders & Payment</h2>
      <p>
        All transactions are processed securely through <strong>Stripe, Inc.</strong> We accept major credit cards,
        debit cards, Apple Pay, Google Pay, and other Stripe-supported payment methods.
      </p>
      <p>
        Prices are displayed in your selected currency (EUR, USD, GBP, MAD, and others). Currency conversion is
        handled by Stripe at the prevailing exchange rate at the time of purchase. We are not responsible for
        exchange rate fluctuations or any fees charged by your bank or card issuer.
      </p>
      <p>
        An order is considered confirmed once Stripe processes the payment and you receive a confirmation email.
        We reserve the right to cancel orders in cases of suspected fraud or technical error, with a full refund
        issued if payment has been collected.
      </p>

      <h2>4. Pricing</h2>
      <p>
        All prices are displayed inclusive of applicable taxes where required. We reserve the right to change
        our prices at any time without prior notice. The price applicable to your order is the one displayed
        at the time of checkout.
      </p>
      <p>
        Promotional prices and discount codes are time-limited and subject to their own terms. They cannot be
        combined unless explicitly stated.
      </p>

      <h2>5. Refund & Withdrawal Policy</h2>
      <p>
        Please review our dedicated <a href={`/en/refund`}>Refund Policy</a> for full details.
        In summary:
      </p>
      <ul>
        <li>No refunds once a digital product has been downloaded.</li>
        <li>
          <strong>EU customers:</strong> Under European consumer law, you have a 14-day right of withdrawal.
          However, by proceeding with your purchase and initiating the download, you explicitly waive this right,
          in accordance with Article 16(m) of EU Directive 2011/83/EU.
        </li>
        <li>Refunds may be granted if a file is corrupted or significantly differs from its description.</li>
      </ul>

      <h2>6. Intellectual Property & License</h2>
      <p>
        All digital products sold on Urbandeam — including templates, designs, and accompanying documentation —
        are the exclusive intellectual property of <strong>Diez Agency LLC</strong> and are protected by
        applicable copyright laws.
      </p>
      <p>
        Upon purchase, you receive a <strong>personal, non-exclusive, non-transferable license</strong> to use
        the product for your personal or internal business use only. You may not:
      </p>
      <ul>
        <li>Resell, redistribute, sublicense, or share the product with third parties.</li>
        <li>Upload the product to any platform for others to download (free or paid).</li>
        <li>Claim authorship or remove any branding or copyright notices.</li>
        <li>Use the product to create competing products for sale.</li>
      </ul>
      <p>
        Violation of these terms may result in immediate termination of your license and legal action.
      </p>

      <h2>7. User Responsibilities</h2>
      <p>
        You agree to use Urbandeam and our products lawfully and in good faith. You are responsible for
        maintaining the confidentiality of your account and for all activities under your account.
        You must not use our site to engage in fraudulent, abusive, or illegal activities.
      </p>

      <h2>8. Disclaimers & Limitation of Liability</h2>
      <p>
        Our products are sold "as is." While we take great care in the quality of our templates and digital
        products, we make no guarantees regarding specific results or outcomes from their use.
        <strong> Urbandeam is not responsible for any financial, business, or personal decisions you make
        based on the use of our products.</strong>
      </p>
      <p>
        To the maximum extent permitted by applicable law, Diez Agency LLC's total liability to you for any
        claim arising out of or relating to these Terms or our products shall not exceed the amount you paid
        for the specific product giving rise to the claim.
      </p>
      <p>
        We are not liable for any indirect, incidental, consequential, or punitive damages, including loss of
        data, loss of profits, or business interruption.
      </p>

      <h2>9. Third-Party Services</h2>
      <p>
        Our website uses third-party services including Stripe (payments), Supabase (data storage), Vercel
        (hosting), and Resend (email delivery). Your use of these services is also governed by their respective
        terms and privacy policies.
      </p>

      <h2>10. Modifications to These Terms</h2>
      <p>
        We reserve the right to update or modify these Terms and Conditions at any time. Changes will be
        effective upon posting to this page with an updated date. Continued use of the site after changes
        constitutes your acceptance of the revised terms. For significant changes, we will notify registered
        users by email.
      </p>

      <h2>11. Governing Law & Dispute Resolution</h2>
      <p>
        These Terms are governed by and construed in accordance with the <strong>laws of the State of Texas,
        United States</strong>, without regard to its conflict-of-law provisions.
      </p>
      <p>
        Any dispute arising out of or relating to these Terms shall first be addressed through good-faith
        negotiation. If unresolved within 30 days, disputes shall be submitted to binding arbitration in
        Dallas, Texas, under the rules of the American Arbitration Association.
      </p>
      <p>
        <strong>EU customers</strong> retain their mandatory statutory rights under EU consumer law and may
        also access the EU Online Dispute Resolution platform at{' '}
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
          ec.europa.eu/consumers/odr
        </a>.
      </p>

      <h2>12. Contact</h2>
      <p>
        For any questions regarding these Terms, please contact us at:{' '}
        <a href="mailto:contact@urbandeam.com">contact@urbandeam.com</a>
      </p>
      <p>
        Diez Agency LLC · 539 W. Commerce St #3083 · Dallas, TX 75208 · United States
      </p>
    </LegalLayout>
  )
}
