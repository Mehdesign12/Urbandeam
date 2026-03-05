import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import LegalLayout from '@/components/legal/LegalLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Use — Urbandeam',
  description: 'Rules governing access to Urbandeam, use of purchased digital products, and intellectual property.',
}

export default async function TermsOfUsePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!routing.locales.includes(locale as 'fr' | 'en')) notFound()

  return (
    <LegalLayout locale={locale} current="terms-of-use" title="Terms of Use" lastUpdated="March 1, 2025">
      <h2>1. Scope & Acceptance</h2>
      <p>
        These Terms of Use govern your access to and use of the <strong>Urbandeam</strong> website
        (urbandeam.com) and all digital products purchased through it. By browsing or using our site,
        you agree to these terms in full.
      </p>
      <p>
        These Terms of Use complement our <a href={`/en/terms`}>Terms & Conditions</a> and should be
        read together with them.
      </p>

      <h2>2. Access to the Site</h2>
      <p>
        Urbandeam is accessible to any user with an internet connection. We reserve the right to:
      </p>
      <ul>
        <li>Restrict access to certain pages or features at our discretion.</li>
        <li>Suspend or terminate access for users who violate these terms.</li>
        <li>Temporarily take down the site for maintenance or technical updates without prior notice.</li>
      </ul>
      <p>
        We make reasonable efforts to keep the site available 24/7 but do not guarantee uninterrupted access.
      </p>

      <h2>3. User Accounts</h2>
      <p>
        Purchases do not currently require creating an account. Your order is tied to your email address.
        If account functionality is introduced in the future, you will be responsible for:
      </p>
      <ul>
        <li>Keeping your login credentials confidential.</li>
        <li>All activities conducted under your account.</li>
        <li>Immediately notifying us of any unauthorized use at <a href="mailto:contact@urbandeam.com">contact@urbandeam.com</a>.</li>
      </ul>

      <h2>4. Permitted Use of Digital Products</h2>
      <p>
        All digital products (Excel templates, PDF files, Notion templates) purchased on Urbandeam are
        licensed under a <strong>Personal Use License</strong>. You may:
      </p>
      <ul>
        <li>Use the product for your own personal development, productivity, or internal business needs.</li>
        <li>Modify the product for your own personal use.</li>
        <li>Print or save the product for your own reference.</li>
      </ul>

      <h2>5. Prohibited Uses</h2>
      <p>
        The following uses are strictly <strong>prohibited</strong> and constitute a breach of these Terms:
      </p>
      <ul>
        <li>
          <strong>Redistribution:</strong> sharing, gifting, or forwarding the product file to any third
          party, whether free of charge or for payment.
        </li>
        <li>
          <strong>Resale:</strong> selling, relicensing, or offering the product as part of a bundle or
          service to others.
        </li>
        <li>
          <strong>Upload & sharing platforms:</strong> posting the file to any website, platform, cloud
          drive, or social media where others can download it.
        </li>
        <li>
          <strong>Competing products:</strong> using our products as a base to create and sell similar or
          derivative products.
        </li>
        <li>
          <strong>Removing attribution:</strong> stripping branding, copyright notices, or authorship
          information from any product.
        </li>
        <li>
          <strong>Unlawful use:</strong> using any product for fraudulent, defamatory, or illegal purposes.
        </li>
      </ul>
      <p>
        Violation of these restrictions will result in immediate revocation of your license, potential
        legal action for copyright infringement, and reporting to relevant authorities where applicable.
      </p>

      <h2>6. Download Links</h2>
      <p>
        Each purchase provides a secure, personal download link valid for <strong>5 downloads</strong>
        within <strong>30 days</strong> of purchase. You are responsible for downloading and saving
        your file promptly. Urbandeam is not responsible for lost files after the link expires.
      </p>
      <p>
        If you experience a technical issue with your download link, contact us at{' '}
        <a href="mailto:contact@urbandeam.com">contact@urbandeam.com</a> and we will assist you.
      </p>

      <h2>7. Intellectual Property</h2>
      <p>
        All digital products and website content — including designs, templates, text, graphics, logos,
        and code — are the intellectual property of <strong>Diez Agency LLC</strong> and protected
        under international copyright laws.
      </p>
      <p>
        Your purchase grants you a limited, personal, non-exclusive, non-transferable license.
        It does not transfer any ownership rights. Diez Agency LLC retains full ownership of all products.
      </p>

      <h2>8. Disclaimer of Results</h2>
      <p>
        Our products are tools designed to support your personal development and productivity.
        <strong> We do not guarantee any specific results, outcomes, or financial gains</strong> from
        using our templates or materials. Results depend entirely on how you apply them.
      </p>
      <p>
        Any testimonials or examples on our website represent individual experiences and are not guarantees
        of similar outcomes for every user.
      </p>

      <h2>9. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, Diez Agency LLC shall not be liable for any indirect,
        incidental, special, or consequential damages arising from your use of — or inability to use —
        the website or any digital product.
      </p>
      <p>
        Our maximum aggregate liability for any claim related to a specific product shall not exceed
        the amount you paid for that product.
      </p>

      <h2>10. Account Suspension & Termination</h2>
      <p>
        We reserve the right to suspend or permanently terminate access for any user who:
      </p>
      <ul>
        <li>Violates these Terms of Use or our Terms & Conditions.</li>
        <li>Engages in fraudulent, abusive, or illegal behavior.</li>
        <li>Attempts to circumvent security measures or download restrictions.</li>
        <li>Is found to be redistributing or reselling purchased products.</li>
      </ul>
      <p>
        In cases of confirmed violation, no refund will be issued and we may pursue legal remedies.
      </p>

      <h2>11. Updates to These Terms</h2>
      <p>
        Urbandeam reserves the right to update these Terms of Use at any time. Changes take effect
        immediately upon publication on this page. We encourage you to review this page periodically.
        Continued use of the site after changes constitutes acceptance of the updated Terms.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions about these Terms of Use?{' '}
        <a href="mailto:contact@urbandeam.com">contact@urbandeam.com</a>
      </p>
      <p>
        Diez Agency LLC · 539 W. Commerce St #3083 · Dallas, TX 75208 · United States
      </p>
    </LegalLayout>
  )
}
