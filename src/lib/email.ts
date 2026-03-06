import { Resend } from 'resend'

// Ne pas instancier au module level — la clé n'est pas disponible au build time.
const FROM    = process.env.RESEND_FROM_EMAIL   ?? 'noreply@urbandeam.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.urbandeam.com'

// ─── Types ────────────────────────────────────────────────────────────────────

/** Un produit dans la commande */
export type OrderItemEmail = {
  productTitle:    string
  productImageUrl: string | null
  price:           number   // centimes
  downloadToken:   string
  downloadLimit:   number
  downloadExpiresAt: string // ISO
}

/** Paramètres pour l'email de confirmation multi-produits */
export type OrderConfirmationParams = {
  to:            string
  customerName?: string
  items:         OrderItemEmail[]
  amountTotal:   number   // centimes — total de la commande
  currency:      string
  locale:        'fr' | 'en'
  orderId:       string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtPrice(cents: number, currency: string, locale: string): string {
  return (cents / 100).toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  })
}

function fmtDate(isoString: string, locale: string): string {
  return new Date(isoString).toLocaleDateString(
    locale === 'fr' ? 'fr-FR' : 'en-US',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
}

// ─── Template HTML multi-produits ─────────────────────────────────────────────
function buildOrderEmailHtml(p: OrderConfirmationParams): string {
  const fr       = p.locale === 'fr'
  const total    = fmtPrice(p.amountTotal, p.currency, p.locale)
  const logoUrl  = 'https://flyhmbookyqckgjotihg.supabase.co/storage/v1/object/public/Logo/urban-deam-logo-long-pngc.png'
  const orderId  = `#${p.orderId.slice(0, 8).toUpperCase()}`

  // Générer les blocs produit
  const productBlocks = p.items.map((item) => {
    const downloadUrl = `${APP_URL}/api/download?token=${item.downloadToken}`
    const itemPrice   = fmtPrice(item.price, p.currency, p.locale)
    const expiryDate  = fmtDate(item.downloadExpiresAt, p.locale)

    return `
      <!-- Produit -->
      <table width="100%" cellpadding="0" cellspacing="0"
             style="background:#F9FAFB;border-radius:12px;border:1px solid #E5E7EB;
                    margin-bottom:12px;overflow:hidden;">
        <tr>
          ${item.productImageUrl ? `
          <td width="76" style="padding:14px 0 14px 14px;vertical-align:middle;">
            <img src="${item.productImageUrl}" alt="${item.productTitle}"
                 width="60" height="60"
                 style="display:block;width:60px;height:60px;
                        border-radius:8px;object-fit:cover;" />
          </td>` : ''}
          <td style="padding:14px 16px;vertical-align:middle;">
            <p style="margin:0 0 3px;font-size:14px;font-weight:600;color:#0A0A0A;">
              ${item.productTitle}
            </p>
            <p style="margin:0;font-size:13px;color:#6B7280;">
              ${fr ? 'Produit digital' : 'Digital product'} · ${itemPrice}
            </p>
          </td>
          <td style="padding:14px 16px;vertical-align:middle;text-align:right;white-space:nowrap;">
            <span style="font-size:15px;font-weight:700;color:#0A0A0A;">${itemPrice}</span>
          </td>
        </tr>
        <!-- Bouton download pour ce produit -->
        <tr>
          <td colspan="3" style="padding:0 14px 14px;">
            <a href="${downloadUrl}"
               style="display:block;width:100%;box-sizing:border-box;
                      padding:12px 20px;background:#0A0A0A;color:#ffffff;
                      font-size:14px;font-weight:600;text-decoration:none;
                      border-radius:10px;text-align:center;">
              ↓ &nbsp;${fr ? 'Télécharger' : 'Download'} — ${item.productTitle}
            </a>
            <p style="margin:8px 0 0;font-size:11px;color:#9CA3AF;text-align:center;">
              ${fr
                ? `${item.downloadLimit} téléchargements · expire le ${expiryDate}`
                : `${item.downloadLimit} downloads · expires ${expiryDate}`}
            </p>
          </td>
        </tr>
      </table>`
  }).join('\n')

  // Total (affiché seulement si >1 produit)
  const totalRow = p.items.length > 1 ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:12px 16px;border-top:2px solid #0A0A0A;">
          <strong style="font-size:15px;color:#0A0A0A;">${fr ? 'Total payé' : 'Total paid'}</strong>
        </td>
        <td align="right" style="padding:12px 16px;border-top:2px solid #0A0A0A;">
          <strong style="font-size:17px;color:#0A0A0A;">${total}</strong>
        </td>
      </tr>
    </table>` : '<div style="margin-bottom:24px;"></div>'

  return `<!DOCTYPE html>
<html lang="${p.locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fr ? 'Votre commande Urbandeam.com' : 'Your Urbandeam.com order'}</title>
</head>
<body style="margin:0;padding:0;background:#F4F4F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

          <!-- LOGO -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <img src="${logoUrl}" alt="Urbandeam.com" height="36"
                style="display:block;height:36px;width:auto;" />
            </td>
          </tr>

          <!-- CARTE PRINCIPALE -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;overflow:hidden;
                       box-shadow:0 1px 3px rgba(0,0,0,0.06),0 8px 24px rgba(0,0,0,0.06);">

              <!-- Bandeau succès -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background:#0A0A0A;padding:28px 32px;">
                    <div style="width:52px;height:52px;background:#DCFCE7;border-radius:50%;
                                display:inline-flex;align-items:center;justify-content:center;
                                margin-bottom:14px;">
                      <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/check.svg"
                           width="24" height="24" alt="✓"
                           style="filter:invert(48%) sepia(80%) saturate(400%) hue-rotate(100deg) brightness(90%);" />
                    </div>
                    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;line-height:1.3;">
                      ${fr ? 'Merci pour votre commande !' : 'Thank you for your order!'}
                    </h1>
                    <p style="margin:8px 0 0;color:#A1A1AA;font-size:14px;line-height:1.5;">
                      ${fr
                        ? `Votre paiement a été reçu. ${p.items.length > 1 ? `Vos ${p.items.length} fichiers sont prêts.` : 'Votre fichier est prêt.'}`
                        : `Your payment was received. ${p.items.length > 1 ? `Your ${p.items.length} files are ready.` : 'Your file is ready.'}`}
                    </p>
                  </td>
                </tr>

                <!-- Corps -->
                <tr>
                  <td style="padding:28px 32px 24px;">

                    <!-- Liste des produits avec boutons download -->
                    ${productBlocks}

                    <!-- Total -->
                    ${totalRow}

                    <!-- Info accès -->
                    <table width="100%" cellpadding="0" cellspacing="0"
                           style="background:#FFF7ED;border-radius:10px;
                                  border:1px solid #FED7AA;margin-bottom:24px;">
                      <tr>
                        <td style="padding:13px 16px;">
                          <p style="margin:0;font-size:13px;color:#92400E;line-height:1.6;">
                            <strong>${fr ? '⚠️ Information importante' : '⚠️ Important'}</strong><br/>
                            ${fr
                              ? 'Chaque lien est valable <strong>5 téléchargements pendant 30 jours</strong>. Conservez vos fichiers après téléchargement.'
                              : 'Each link is valid for <strong>5 downloads for 30 days</strong>. Please save your files after downloading.'}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <hr style="border:none;border-top:1px solid #F0F0F0;margin:0 0 20px;" />

                    <!-- Récap commande -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                      <tr>
                        <td style="font-size:13px;color:#9CA3AF;padding:4px 0;">
                          ${fr ? 'N° de commande' : 'Order ID'}
                        </td>
                        <td align="right" style="font-size:13px;color:#374151;font-weight:500;
                                                  font-family:monospace;padding:4px 0;">
                          ${orderId}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;color:#9CA3AF;padding:4px 0;">
                          ${fr ? 'Montant payé' : 'Amount paid'}
                        </td>
                        <td align="right" style="font-size:13px;color:#374151;font-weight:600;padding:4px 0;">
                          ${total}
                        </td>
                      </tr>
                    </table>

                    <!-- Support -->
                    <p style="margin:0;font-size:13px;color:#6B7280;line-height:1.6;">
                      ${fr
                        ? 'Une question ? Contactez-nous sur <a href="mailto:contact@urbandeam.com" style="color:#0A0A0A;">contact@urbandeam.com</a>'
                        : 'Any question? Contact us at <a href="mailto:contact@urbandeam.com" style="color:#0A0A0A;">contact@urbandeam.com</a>'}
                    </p>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="padding:24px 0 8px;">
              <p style="margin:0 0 6px;font-size:12px;color:#9CA3AF;">
                © ${new Date().getFullYear()} Urbandeam.com ·
                <a href="${APP_URL}" style="color:#9CA3AF;text-decoration:none;">urbandeam.com</a>
              </p>
              <p style="margin:0;font-size:11px;color:#C4C4C4;">
                ${fr
                  ? 'Vous recevez cet email car vous avez effectué un achat sur Urbandeam.com.'
                  : 'You received this email because you made a purchase on Urbandeam.com.'}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
}

// ─── Texte plain ───────────────────────────────────────────────────────────────
function buildOrderEmailText(p: OrderConfirmationParams): string {
  const fr    = p.locale === 'fr'
  const total = fmtPrice(p.amountTotal, p.currency, p.locale)

  const lines = p.items.map((item, i) => {
    const downloadUrl = `${APP_URL}/api/download?token=${item.downloadToken}`
    const expiryDate  = fmtDate(item.downloadExpiresAt, p.locale)
    return fr
      ? `Produit ${i + 1} : ${item.productTitle}\nLien : ${downloadUrl}\nExpire : ${expiryDate} (${item.downloadLimit} téléchargements)`
      : `Product ${i + 1}: ${item.productTitle}\nLink: ${downloadUrl}\nExpires: ${expiryDate} (${item.downloadLimit} downloads)`
  })

  return fr
    ? `Merci pour votre commande — Urbandeam.com\n\n${lines.join('\n\n')}\n\nTotal : ${total}\nCommande : #${p.orderId.slice(0, 8).toUpperCase()}\n\nQuestions ? contact@urbandeam.com\nurbandeam.com`
    : `Thank you for your order — Urbandeam.com\n\n${lines.join('\n\n')}\n\nTotal: ${total}\nOrder: #${p.orderId.slice(0, 8).toUpperCase()}\n\nQuestions? contact@urbandeam.com\nurbandeam.com`
}

// ─── Fonction principale : email récapitulatif multi-produits ─────────────────
export async function sendOrderConfirmationEmail(
  params: OrderConfirmationParams
): Promise<{ success: boolean; error?: string }> {
  const fr     = params.locale === 'fr'
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.error('[Resend] RESEND_API_KEY manquante')
    return { success: false, error: 'RESEND_API_KEY not configured' }
  }

  const resend = new Resend(apiKey)
  const firstTitle = params.items[0]?.productTitle ?? 'Urbandeam.com'

  const subject = params.items.length > 1
    ? (fr
        ? `Vos ${params.items.length} fichiers sont prêts — Urbandeam.com`
        : `Your ${params.items.length} files are ready — Urbandeam.com`)
    : (fr
        ? `Votre fichier est prêt — ${firstTitle}`
        : `Your file is ready — ${firstTitle}`)

  // Log pour diagnostiquer les problèmes d'env en production
  console.log('[Resend] from:', FROM, '| to:', params.to, '| apiKeySet:', !!apiKey, '| apiKeyPrefix:', apiKey.slice(0, 6))

  try {
    const { data, error } = await resend.emails.send({
      from:    `Urbandeam.com <${FROM}>`,
      to:      params.to,
      subject,
      html:    buildOrderEmailHtml(params),
      text:    buildOrderEmailText(params),
      tags: [
        { name: 'category', value: 'order_confirmation' },
        { name: 'locale',   value: params.locale },
        { name: 'items',    value: String(params.items.length) },
      ],
    })

    if (error) {
      console.error('[Resend] Erreur envoi email:', error)
      return { success: false, error: error.message }
    }

    console.log(`[Resend] ✅ Email envoyé à ${params.to} — id: ${data?.id} — ${params.items.length} produit(s)`)
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue'
    console.error('[Resend] Exception:', msg)
    return { success: false, error: msg }
  }
}

// ─── LEGACY : email mono-produit (conservé pour rétrocompatibilité) ────────────
/** @deprecated Utiliser sendOrderConfirmationEmail */
export type ConfirmationEmailParams = {
  to: string
  customerName?: string
  productTitle: string
  productImageUrl?: string | null
  amountTotal: number
  currency: string
  downloadToken: string
  downloadLimit: number
  downloadExpiresAt: string
  locale: 'fr' | 'en'
  orderId: string
}

/** @deprecated Utiliser sendOrderConfirmationEmail */
export async function sendConfirmationEmail(
  params: ConfirmationEmailParams
): Promise<{ success: boolean; error?: string }> {
  // Déléguer vers le nouveau système multi-produits
  return sendOrderConfirmationEmail({
    to:          params.to,
    customerName: params.customerName,
    items: [{
      productTitle:     params.productTitle,
      productImageUrl:  params.productImageUrl ?? null,
      price:            params.amountTotal,
      downloadToken:    params.downloadToken,
      downloadLimit:    params.downloadLimit,
      downloadExpiresAt: params.downloadExpiresAt,
    }],
    amountTotal: params.amountTotal,
    currency:    params.currency,
    locale:      params.locale,
    orderId:     params.orderId,
  })
}
