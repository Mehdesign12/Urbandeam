import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import LegalLayout from '@/components/legal/LegalLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Legal Notice — Urbandeam',
  description: 'Legal information about Urbandeam, publisher, hosting provider, and intellectual property.',
}

export default async function LegalNoticePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!routing.locales.includes(locale as 'fr' | 'en')) notFound()

  return (
    <LegalLayout locale={locale} current="legal-notice" title="Legal Notice" lastUpdated="March 1, 2025">
      <h2>1. Website Publisher</h2>
      <p>
        The website <a href="https://urbandeam.com">urbandeam.com</a> is published and operated by:
      </p>
      <div className="ud-legal__highlight">
        <p>
          <strong>Diez Agency LLC</strong><br />
          539 W. Commerce St #3083<br />
          Dallas, TX 75208<br />
          United States<br />
          Email: <a href="mailto:contact@urbandeam.com">contact@urbandeam.com</a><br />
          Website: <a href="https://urbandeam.com">urbandeam.com</a>
        </p>
      </div>
      <p>
        Diez Agency LLC is a limited liability company incorporated under the laws of the State of Texas,
        United States.
      </p>

      <h2>2. Publication Director</h2>
      <p>
        The publication director is the legal representative of Diez Agency LLC.
        For any editorial inquiries, contact: <a href="mailto:contact@urbandeam.com">contact@urbandeam.com</a>
      </p>

      <h2>3. Website Hosting</h2>
      <p>This website is hosted by:</p>
      <div className="ud-legal__highlight">
        <p>
          <strong>Vercel Inc.</strong><br />
          440 N Barranca Ave #4133<br />
          Covina, CA 91723<br />
          United States<br />
          Website: <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a>
        </p>
      </div>
      <p>
        Vercel operates a global edge network for website hosting and serverless computing.
      </p>

      <h2>4. Database & Storage</h2>
      <p>User data and product files are stored using:</p>
      <div className="ud-legal__highlight">
        <p>
          <strong>Supabase, Inc.</strong><br />
          970 Toa Payoh North, #07-04<br />
          Singapore 318992<br />
          Website: <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a>
        </p>
      </div>

      <h2>5. Payment Processing</h2>
      <p>All payments on this website are processed by:</p>
      <div className="ud-legal__highlight">
        <p>
          <strong>Stripe, Inc.</strong><br />
          354 Oyster Point Blvd<br />
          South San Francisco, CA 94080<br />
          United States<br />
          Website: <a href="https://stripe.com" target="_blank" rel="noopener noreferrer">stripe.com</a>
        </p>
      </div>
      <p>
        Stripe is a certified PCI DSS Level 1 payment service provider. No payment card data is stored
        on Urbandeam's servers.
      </p>

      <h2>6. Email Communications</h2>
      <p>Transactional emails (order confirmations, download links) are sent via:</p>
      <div className="ud-legal__highlight">
        <p>
          <strong>Resend (WorkOS, Inc.)</strong><br />
          San Francisco, CA, United States<br />
          Website: <a href="https://resend.com" target="_blank" rel="noopener noreferrer">resend.com</a>
        </p>
      </div>

      <h2>7. Intellectual Property</h2>
      <p>
        All content on this website — including but not limited to text, images, logos, digital templates,
        product designs, and the overall website structure — is the <strong>exclusive intellectual property
        of Diez Agency LLC</strong> and is protected under applicable copyright, trademark, and intellectual
        property laws.
      </p>
      <p>
        The <strong>Urbandeam</strong> name and logo are proprietary assets of Diez Agency LLC.
        Unauthorized reproduction, distribution, or use of any content from this website without prior
        written permission is strictly prohibited.
      </p>
      <p>
        Purchased digital products are licensed for personal use only. See our{' '}
        <a href={`/en/terms`}>Terms & Conditions</a> for full license terms.
      </p>

      <h2>8. Applicable Law</h2>
      <p>
        This website is governed by the laws of the <strong>State of Texas, United States</strong>.
        Any dispute relating to the use of this website shall be subject to the exclusive jurisdiction
        of the courts of Dallas County, Texas.
      </p>
      <p>
        EU customers retain all mandatory rights under applicable European consumer protection laws,
        including but not limited to the EU Consumer Rights Directive and GDPR.
      </p>

      <h2>9. Contact</h2>
      <p>
        For any legal inquiries or notices:{' '}
        <a href="mailto:contact@urbandeam.com">contact@urbandeam.com</a>
      </p>
    </LegalLayout>
  )
}
