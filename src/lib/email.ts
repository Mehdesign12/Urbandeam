import { Resend } from 'resend'

// Ne pas instancier au module level — la clé n'est pas disponible au build time.
// Resend est créé lazily dans sendConfirmationEmail().
const FROM    = process.env.RESEND_FROM_EMAIL     ?? 'noreply@urbandeam.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL   ?? 'https://urbandeam.vercel.app'

// ─── Types ────────────────────────────────────────────────────────────────────
export type ConfirmationEmailParams = {
  to: string
  customerName?: string
  productTitle: string
  productImageUrl?: string | null
  amountTotal: number      // en centimes
  currency: string
  downloadToken: string
  downloadLimit: number
  downloadExpiresAt: string // ISO string
  locale: 'fr' | 'en'
  orderId: string
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

// ─── Template HTML ─────────────────────────────────────────────────────────────
function buildEmailHtml(p: ConfirmationEmailParams): string {
  const fr          = p.locale === 'fr'
  const downloadUrl = `${APP_URL}/api/download?token=${p.downloadToken}`
  const price       = fmtPrice(p.amountTotal, p.currency, p.locale)
  const expiryDate  = fmtDate(p.downloadExpiresAt, p.locale)
  const logoUrl     = 'https://flyhmbookyqckgjotihg.supabase.co/storage/v1/object/public/Logo/urban-deam-logo-long-pngc.png'

  return `<!DOCTYPE html>
<html lang="${p.locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fr ? 'Votre commande Urban Deam' : 'Your Urban Deam order'}</title>
</head>
<body style="margin:0;padding:0;background:#F4F4F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- LOGO -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <img src="${logoUrl}" alt="Urban Deam" height="36"
                style="display:block;height:36px;width:auto;" />
            </td>
          </tr>

          <!-- CARD PRINCIPALE -->
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
                      <!-- checkmark SVG as image fallback -->
                      <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/check.svg"
                           width="24" height="24" alt="✓"
                           style="filter:invert(48%) sepia(80%) saturate(400%) hue-rotate(100deg) brightness(90%);" />
                    </div>
                    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;line-height:1.3;">
                      ${fr ? 'Merci pour votre commande !' : 'Thank you for your order!'}
                    </h1>
                    <p style="margin:8px 0 0;color:#A1A1AA;font-size:14px;line-height:1.5;">
                      ${fr
                        ? 'Votre paiement a bien été reçu. Votre fichier est prêt à télécharger.'
                        : 'Your payment was received. Your file is ready to download.'}
                    </p>
                  </td>
                </tr>

                <!-- Corps -->
                <tr>
                  <td style="padding:28px 32px;">

                    <!-- Récap produit -->
                    <table width="100%" cellpadding="0" cellspacing="0"
                           style="background:#F9FAFB;border-radius:12px;border:1px solid #E5E7EB;
                                  margin-bottom:24px;overflow:hidden;">
                      <tr>
                        ${p.productImageUrl ? `
                        <td width="72" style="padding:14px 0 14px 14px;vertical-align:middle;">
                          <img src="${p.productImageUrl}" alt="${p.productTitle}"
                               width="60" height="60"
                               style="display:block;width:60px;height:60px;
                                      border-radius:8px;object-fit:cover;" />
                        </td>` : ''}
                        <td style="padding:14px 16px;vertical-align:middle;">
                          <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#0A0A0A;">
                            ${p.productTitle}
                          </p>
                          <p style="margin:0;font-size:13px;color:#6B7280;">
                            ${fr ? 'Produit digital' : 'Digital product'} · ${price}
                          </p>
                        </td>
                        <td style="padding:14px 16px;vertical-align:middle;text-align:right;white-space:nowrap;">
                          <span style="font-size:16px;font-weight:700;color:#0A0A0A;">${price}</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Bouton téléchargement -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                      <tr>
                        <td align="center">
                          <a href="${downloadUrl}"
                             style="display:inline-block;padding:15px 36px;
                                    background:#0A0A0A;color:#ffffff;
                                    font-size:15px;font-weight:600;
                                    text-decoration:none;border-radius:12px;
                                    letter-spacing:0.01em;">
                            ↓ &nbsp;${fr ? 'Télécharger mon fichier' : 'Download my file'}
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Info accès -->
                    <table width="100%" cellpadding="0" cellspacing="0"
                           style="background:#FFF7ED;border-radius:10px;
                                  border:1px solid #FED7AA;margin-bottom:24px;">
                      <tr>
                        <td style="padding:13px 16px;">
                          <p style="margin:0;font-size:13px;color:#92400E;line-height:1.6;">
                            <strong>${fr ? '⚠️ Informations importantes' : '⚠️ Important information'}</strong><br/>
                            ${fr
                              ? `Ce lien est valable <strong>${p.downloadLimit} téléchargements</strong> jusqu'au <strong>${expiryDate}</strong>. Conservez votre fichier après téléchargement.`
                              : `This link is valid for <strong>${p.downloadLimit} downloads</strong> until <strong>${expiryDate}</strong>. Please save your file after downloading.`
                            }
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Lien de secours -->
                    <p style="margin:0 0 24px;font-size:12px;color:#9CA3AF;
                               word-break:break-all;line-height:1.6;">
                      ${fr ? 'Lien direct :' : 'Direct link:'}<br/>
                      <a href="${downloadUrl}" style="color:#6B7280;">${downloadUrl}</a>
                    </p>

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
                          #${p.orderId.slice(0, 8).toUpperCase()}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;color:#9CA3AF;padding:4px 0;">
                          ${fr ? 'Montant payé' : 'Amount paid'}
                        </td>
                        <td align="right" style="font-size:13px;color:#374151;font-weight:600;padding:4px 0;">
                          ${price}
                        </td>
                      </tr>
                    </table>

                    <!-- Support -->
                    <p style="margin:0;font-size:13px;color:#6B7280;line-height:1.6;">
                      ${fr
                        ? 'Une question ? Répondez simplement à cet email ou contactez-nous sur <a href="mailto:support@urbandeam.com" style="color:#0A0A0A;">support@urbandeam.com</a>'
                        : 'Any question? Simply reply to this email or contact us at <a href="mailto:support@urbandeam.com" style="color:#0A0A0A;">support@urbandeam.com</a>'
                      }
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
                © ${new Date().getFullYear()} Urban Deam · 
                <a href="${APP_URL}" style="color:#9CA3AF;text-decoration:none;">urbandeam.com</a>
              </p>
              <p style="margin:0;font-size:11px;color:#C4C4C4;">
                ${fr
                  ? 'Vous recevez cet email car vous avez effectué un achat sur Urban Deam.'
                  : 'You received this email because you made a purchase on Urban Deam.'
                }
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

// ─── Texte plain (fallback) ───────────────────────────────────────────────────
function buildEmailText(p: ConfirmationEmailParams): string {
  const fr          = p.locale === 'fr'
  const downloadUrl = `${APP_URL}/api/download?token=${p.downloadToken}`
  const price       = fmtPrice(p.amountTotal, p.currency, p.locale)
  const expiryDate  = fmtDate(p.downloadExpiresAt, p.locale)

  return fr
    ? `Merci pour votre commande — Urban Deam

Produit : ${p.productTitle}
Montant : ${price}
Commande : #${p.orderId.slice(0, 8).toUpperCase()}

Téléchargez votre fichier ici :
${downloadUrl}

Ce lien est valable ${p.downloadLimit} téléchargements jusqu'au ${expiryDate}.

Questions ? Contactez-nous : support@urbandeam.com
urbandeam.com`
    : `Thank you for your order — Urban Deam

Product : ${p.productTitle}
Amount  : ${price}
Order   : #${p.orderId.slice(0, 8).toUpperCase()}

Download your file here:
${downloadUrl}

This link is valid for ${p.downloadLimit} downloads until ${expiryDate}.

Questions? Contact us: support@urbandeam.com
urbandeam.com`
}

// ─── Fonction principale d'envoi ──────────────────────────────────────────────
export async function sendConfirmationEmail(
  params: ConfirmationEmailParams
): Promise<{ success: boolean; error?: string }> {
  const fr = params.locale === 'fr'

  // Instanciation lazy : la clé est disponible à l'exécution (pas au build)
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[Resend] RESEND_API_KEY manquante — email non envoyé')
    return { success: false, error: 'RESEND_API_KEY not configured' }
  }
  const resend = new Resend(apiKey)

  try {
    const { data, error } = await resend.emails.send({
      from: `Urban Deam <${FROM}>`,
      to:   params.to,
      subject: fr
        ? `Votre fichier est prêt — ${params.productTitle}`
        : `Your file is ready — ${params.productTitle}`,
      html: buildEmailHtml(params),
      text: buildEmailText(params),
      tags: [
        { name: 'category', value: 'order_confirmation' },
        { name: 'locale',   value: params.locale },
      ],
    })

    if (error) {
      console.error('[Resend] Erreur envoi email:', error)
      return { success: false, error: error.message }
    }

    console.log(`[Resend] ✅ Email envoyé à ${params.to} — id: ${data?.id}`)
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue'
    console.error('[Resend] Exception:', msg)
    return { success: false, error: msg }
  }
}
