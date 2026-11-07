/**
 * Mailora.ai — Production Table-based Email HTML Generator
 * Generates email-client compliant, responsive HTML emails.
 */

import { escapeHtml, sanitizeUrl } from '../../utils/security.js';

export function generateEmailHtml(variant, options = {}) {
  const {
    brandName = 'MAILORA BRAND',
    imageUrl = '',
    userCtaUrl = '#'
  } = options;

  const chosen = variant || {};
  const theme = chosen.theme || {};
  const bgOuter = theme.bg_outer || '#F7F6FC';
  const cardBg = theme.card_bg || '#FFFFFF';
  const fontHeading = theme.font_family || 'Plus Jakarta Sans, sans-serif';
  const fontBody = theme.body_font || 'Plus Jakarta Sans, Arial, sans-serif';
  const headlineColor = theme.headline_color || '#27243A';
  const eyebrowColor = theme.eyebrow_color || '#6655E8';
  const bodyColor = theme.body_color || '#555268';
  const ctaBg = theme.cta_bg || '#6655E8';
  const ctaColor = theme.cta_color || '#FFFFFF';
  const ctaRadius = theme.cta_radius || '12px';
  const headerTag = escapeHtml(brandName);

  const safeSubject = escapeHtml(chosen.subject || 'Thông báo chiến dịch mới');
  const safePreheader = escapeHtml(chosen.preheader || chosen.subheadline || '');
  const safeEyebrow = escapeHtml(chosen.eyebrow || 'THÔNG TIN CHIẾN DỊCH');
  const safeHeadline = escapeHtml(chosen.headline || chosen.subject || 'Chuẩn Mực Thiết Kế Mới');
  const safeSubheadline = escapeHtml(chosen.subheadline || '');
  const safeBody = escapeHtml(chosen.body || '');
  const safeCtaText = escapeHtml(chosen.cta_text || 'Khám phá ngay →');
  const safeCtaUrl = escapeHtml(sanitizeUrl(chosen.cta_url || userCtaUrl));
  const safeSecCtaText = escapeHtml(chosen.secondary_cta_text || '');
  const safeImageUrl = escapeHtml(imageUrl || '');

  const benefitsArray = Array.isArray(chosen.benefits) && chosen.benefits.length > 0
    ? chosen.benefits
    : [
        'Quy trình thực hiện chuyên nghiệp và tiêu chuẩn chất lượng cao',
        'Đội ngũ tận tâm giàu kinh nghiệm sẵn sàng đồng hành',
        'Cam kết dịch vụ uy tín và trải nghiệm hài lòng cao nhất'
      ];

  const benefitsRowsHtml = benefitsArray
    .map(item => 
      '<tr>' +
        '<td valign="top" width="24" style="padding: 5px 0; font-family: ' + fontBody + '; font-size: 14px; font-weight: 700; color: ' + eyebrowColor + ';">✓</td>' +
        '<td valign="top" style="padding: 5px 0; font-family: ' + fontBody + '; font-size: 14px; line-height: 1.55; color: ' + headlineColor + ';">' + escapeHtml(item) + '</td>' +
      '</tr>')
    .join('');

  const promoSectionHtml = chosen.promo_box && String(chosen.promo_box).trim()
    ? ('<tr>' +
        '<td style="padding: 0 36px 24px 36px;">' +
          '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ' + bgOuter + '; border: 1px dashed ' + ctaBg + '; border-radius: 10px;">' +
            '<tr>' +
              '<td align="center" style="padding: 14px 20px; font-family: ' + fontBody + '; font-size: 13.5px; font-weight: 700; color: ' + headlineColor + ';">' +
                '🎁 ' + escapeHtml(chosen.promo_box) +
              '</td>' +
            '</tr>' +
          '</table>' +
        '</td>' +
      '</tr>')
    : '';

  return '<!DOCTYPE html>\n' +
'<html lang="vi" xmlns="http://www.w3.org/1999/xhtml">\n' +
'<head>\n' +
'  <meta charset="UTF-8" />\n' +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' +
'  <meta http-equiv="X-UA-Compatible" content="IE=edge" />\n' +
'  <title>' + safeSubject + '</title>\n' +
'  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Instrument+Serif:ital@0;1&family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet" />\n' +
'  <style type="text/css">\n' +
'    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }\n' +
'    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }\n' +
'    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; display: block; }\n' +
'    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: ' + bgOuter + '; }\n' +
'    @media screen and (max-width: 600px) {\n' +
'      .email-container { width: 100% !important; }\n' +
'      .mobile-pad { padding-left: 20px !important; padding-right: 20px !important; }\n' +
'      .mobile-title { font-size: 23px !important; }\n' +
'    }\n' +
'  </style>\n' +
'</head>\n' +
'<body style="margin: 0; padding: 0; background-color: ' + bgOuter + ';">\n' +
'  <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all;">\n' +
'    ' + safePreheader + '&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;\n' +
'  </div>\n' +
'  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ' + bgOuter + ';">\n' +
'    <tr>\n' +
'      <td align="center" style="padding: 32px 12px;">\n' +
'        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: ' + cardBg + '; border-radius: 20px; overflow: hidden; border: ' + (theme.card_border || '1px solid #EAE7F1') + '; font-family: ' + fontBody + ';">\n' +
'          <tr>\n' +
'            <td align="center" style="padding: 22px 24px; border-bottom: 1px solid rgba(150,150,150,0.15);">\n' +
'              <span style="font-family: ' + fontBody + '; font-size: 11px; font-weight: 800; letter-spacing: 0.24em; text-transform: uppercase; color: ' + eyebrowColor + ';">\n' +
'                ' + headerTag + '\n' +
'              </span>\n' +
'            </td>\n' +
'          </tr>\n' +
'          <tr>\n' +
'            <td align="center" style="background-color: #111827;">\n' +
'              <img src="' + safeImageUrl + '" alt="' + headerTag + ' - ' + safeHeadline + '" width="600" style="width: 100%; max-width: 600px; height: auto; max-height: 340px; object-fit: cover; display: block;" onerror="this.onerror=null; this.src=\'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=880&q=80\';" />\n' +
'            </td>\n' +
'          </tr>\n' +
'          <tr>\n' +
'            <td class="mobile-pad" style="padding: 36px 40px 18px 40px; text-align: left;">\n' +
'              <div style="font-family: ' + fontBody + '; font-size: 11.5px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 12px; color: ' + eyebrowColor + ';">\n' +
'                ' + safeEyebrow + '\n' +
'              </div>\n' +
'              <h1 class="mobile-title" style="margin: 0 0 14px 0; font-family: ' + fontHeading + '; font-size: 28px; line-height: 1.25; font-weight: 700; color: ' + headlineColor + ';">\n' +
'                ' + safeHeadline + '\n' +
'              </h1>\n' +
'              <p style="margin: 0 0 18px 0; font-family: ' + fontBody + '; font-size: 16px; line-height: 1.5; font-weight: 500; color: ' + headlineColor + ';">\n' +
'                ' + safeSubheadline + '\n' +
'              </p>\n' +
'              <p style="margin: 0; font-family: ' + fontBody + '; font-size: 14.5px; line-height: 1.68; color: ' + bodyColor + ';">\n' +
'                ' + safeBody + '\n' +
'              </p>\n' +
'            </td>\n' +
'          </tr>\n' +
'          <tr>\n' +
'            <td class="mobile-pad" style="padding: 8px 40px 24px 40px;">\n' +
'              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(128,128,128,0.06); border-radius: 12px; padding: 16px;">\n' +
'                <tr>\n' +
'                  <td style="padding: 16px 20px;">\n' +
'                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">\n' +
'                      ' + benefitsRowsHtml + '\n' +
'                    </table>\n' +
'                  </td>\n' +
'                </tr>\n' +
'              </table>\n' +
'            </td>\n' +
'          </tr>\n' +
'          ' + promoSectionHtml + '\n' +
'          <tr>\n' +
'            <td class="mobile-pad" align="center" style="padding: 4px 40px 38px 40px;">\n' +
'              <table role="presentation" cellpadding="0" cellspacing="0" border="0">\n' +
'                <tr>\n' +
'                  <td align="center" bgcolor="' + ctaBg + '" style="border-radius: ' + ctaRadius + ';">\n' +
'                    <a href="' + safeCtaUrl + '" target="_blank" style="display: inline-block; padding: 15px 36px; font-family: ' + fontBody + '; font-size: 13.5px; font-weight: 700; color: ' + ctaColor + '; text-decoration: none; border-radius: ' + ctaRadius + ';">\n' +
'                      ' + safeCtaText + '\n' +
'                    </a>\n' +
'                  </td>\n' +
'                </tr>\n' +
'              </table>\n' +
'              ' + (safeSecCtaText ? ('<div style="margin-top: 14px;"><a href="' + safeCtaUrl + '" target="_blank" style="font-family: ' + fontBody + '; font-size: 12px; font-weight: 600; color: ' + eyebrowColor + '; text-decoration: underline;">' + safeSecCtaText + '</a></div>') : '') + '\n' +
'            </td>\n' +
'          </tr>\n' +
'          <tr>\n' +
'            <td align="center" style="padding: 20px 28px; border-top: 1px solid rgba(150,150,150,0.15); font-family: ' + fontBody + '; font-size: 11px; line-height: 1.6; color: ' + bodyColor + ';">\n' +
'              <div style="font-weight: 700; margin-bottom: 4px;">' + headerTag + '</div>\n' +
'              <div>Bạn nhận được email này vì đã đăng ký nhận bản tin từ thương hiệu.</div>\n' +
'              <div style="margin-top: 6px;">\n' +
'                <a href="#unsubscribe" style="color: ' + eyebrowColor + '; text-decoration: underline;">Hủy đăng ký (Unsubscribe)</a> · <a href="#preferences" style="color: ' + eyebrowColor + '; text-decoration: underline;">Tùy chỉnh nhận thư</a>\n' +
'              </div>\n' +
'            </td>\n' +
'          </tr>\n' +
'        </table>\n' +
'      </td>\n' +
'    </tr>\n' +
'  </table>\n' +
'</body>\n' +
'</html>';
}
