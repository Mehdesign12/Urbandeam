import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import LegalLayout from '@/components/legal/LegalLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy — Urbandeam',
  description: 'Urbandeam refund policy for digital products. EU 14-day withdrawal rights and exceptions explained.',
}

export default async function RefundPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!routing.locales.includes(locale as 'fr' | 'en')) notFound()

  return (
    <LegalLayout locale={locale} current="refund" title="Refund Policy" lastUpdated="March 1, 2025">
      <div className="ud-legal__highlight">
        <p>
          <strong>Our commitment:</strong> We want you to be completely satisfied with your purchase.
          If something goes wrong with your file, we will make it right — quickly and without hassle.
        </p>
      </div>

      <h2>1. General Rule — Digital Products</h2>
      <p>
        All products sold on Urbandeam are <strong>digital downloads</strong>. Because digital content is
        delivered instantly and cannot be "returned," we generally do not offer refunds once the download
        has been initiated.
      </p>
      <p>
        By completing your purchase and downloading your file, you acknowledge and accept this policy.
      </p>

      <h2>2. When We Will Refund You</h2>
      <p>
        We will issue a <strong>full refund or replacement</strong> in the following situations:
      </p>
      <ul>
        <li>
          <strong>Corrupted or broken file:</strong> the file you downloaded cannot be opened or is
          unreadable with standard software.
        </li>
        <li>
          <strong>Wrong file delivered:</strong> you received a file that does not match the product
          you purchased.
        </li>
        <li>
          <strong>Significant misrepresentation:</strong> the product substantially and materially
          differs from its description or screenshots on the product page.
        </li>
        <li>
          <strong>Duplicate charge:</strong> you were charged twice for the same order.
        </li>
      </ul>
      <p>
        Refund requests must be submitted within <strong>48 hours</strong> of purchase to be eligible.
      </p>

      <h2>3. EU Customers — 14-Day Withdrawal Right</h2>
      <p>
        Under EU Directive 2011/83/EU, consumers in the European Union normally have a 14-day right of
        withdrawal (cooling-off period) for distance purchases.
      </p>
      <p>
        However, this right <strong>does not apply to digital content</strong> (such as downloadable files)
        once you have consented to immediate delivery and acknowledged that you lose your right of withdrawal
        upon download, in accordance with <strong>Article 16(m)</strong> of the Directive.
      </p>
      <p>
        At checkout, you will be asked to confirm: <em>"I agree to immediate access to my digital product
        and acknowledge that I waive my 14-day right of withdrawal once the download starts."</em>
      </p>
      <div className="ud-legal__highlight">
        <p>
          ✅ <strong>Exception:</strong> If you have NOT yet downloaded your file (the download link has
          not been used), you may request a refund within the 14-day period by contacting us at{' '}
          <a href="mailto:contact@urbandeam.com">contact@urbandeam.com</a>.
        </p>
      </div>

      <h2>4. Non-Refundable Situations</h2>
      <p>We do not issue refunds in the following cases:</p>
      <ul>
        <li>You changed your mind after downloading the product.</li>
        <li>You purchased the wrong product by mistake and have already downloaded it.</li>
        <li>
          The product does not meet your expectations due to a reason not related to a technical defect
          or misrepresentation.
        </li>
        <li>
          Compatibility issues caused by your own software or hardware configuration (e.g., using an
          outdated version of Excel that is not compatible with the template).
        </li>
        <li>You have violated our Terms and Conditions (e.g., unauthorized sharing or redistribution).</li>
      </ul>

      <h2>5. How to Request a Refund</h2>
      <p>To request a refund or report a problem with your file:</p>
      <ol>
        <li>Email us at <a href="mailto:contact@urbandeam.com">contact@urbandeam.com</a>.</li>
        <li>
          Include in your email:
          <ul>
            <li>Your order number (found in your confirmation email).</li>
            <li>The name of the product purchased.</li>
            <li>A clear description of the issue.</li>
            <li>If applicable, a screenshot or screen recording showing the problem.</li>
          </ul>
        </li>
        <li>We will respond within <strong>24–48 business hours</strong>.</li>
      </ol>

      <h2>6. Refund Processing Time</h2>
      <p>
        Approved refunds are processed through <strong>Stripe</strong> and will appear on your original
        payment method within <strong>5–7 business days</strong>, depending on your bank or card issuer.
        You will receive a confirmation email once the refund is initiated.
      </p>

      <h2>7. Replacements & Re-Downloads</h2>
      <p>
        In cases where a file is corrupted or broken, we will offer a replacement by sending you a new,
        working copy of the product. This is our preferred solution for technical issues, as it resolves
        your problem faster than waiting for a refund.
      </p>
      <p>
        If your download link has expired (30-day window passed or 5 downloads used), please contact us
        — we will extend your access at no extra charge.
      </p>

      <h2>8. Contact</h2>
      <p>
        For all refund requests and customer support:{' '}
        <a href="mailto:contact@urbandeam.com">contact@urbandeam.com</a>
      </p>
      <p>
        We aim to resolve all issues fairly and promptly. Your satisfaction is our priority.
      </p>
    </LegalLayout>
  )
}
