// Tiny HTML helpers used by every transactional template. Plain inline
// styles only — most email clients (Outlook, Gmail) ignore <style> blocks.

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function emailLayout({
  locale,
  title,
  bodyHtml,
}: {
  locale: "en" | "ar";
  title: string;
  bodyHtml: string;
}): string {
  const dir = locale === "ar" ? "rtl" : "ltr";
  const lang = locale === "ar" ? "ar" : "en";
  return `<!doctype html>
<html lang="${lang}" dir="${dir}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#0f0f0f;font-family:'Helvetica Neue',Arial,sans-serif;color:#f5f5f5;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#171717;border:1px solid #262626;border-radius:12px;padding:32px;">
            <tr>
              <td style="padding-bottom:16px;font-size:14px;letter-spacing:0.2em;text-transform:uppercase;color:#a3a3a3;">
                Coaching Platform
              </td>
            </tr>
            ${bodyHtml}
          </table>
          <p style="font-size:12px;color:#737373;margin-top:24px;text-align:center;max-width:560px;line-height:1.6;">
            ${
              locale === "ar"
                ? "إنت بتستلم الإيميل ده لأنك قدّمت أو اشتركت في خدمة كوتشينج معانا."
                : "You received this email because you applied or signed up with our coaching service."
            }
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
