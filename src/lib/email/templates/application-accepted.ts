import { emailLayout, escapeHtml } from "../format";

export type ApplicationAcceptedInput = {
  fullName: string;
  locale: "en" | "ar";
  loginUrl: string;
};

export function applicationAcceptedTemplate({
  fullName,
  locale,
  loginUrl,
}: ApplicationAcceptedInput): { subject: string; html: string; text: string } {
  const safeName = escapeHtml(fullName.split(" ")[0] || fullName);
  const safeLogin = escapeHtml(loginUrl);

  if (locale === "ar") {
    const subject = "أهلاً بيك! تم قبول طلبك";
    const text = `أهلاً ${safeName}،

تم قبول طلب الاشتراك في الكوتشينج. الكوتش هيتواصل معاك على الواتساب لتحديد ميعاد المكالمة الأولى وإرسال بيانات الدفع.

تقدر تسجل دخولك من اللينك ده: ${loginUrl}

— Coaching Platform`;
    const html = emailLayout({
      locale: "ar",
      title: subject,
      bodyHtml: `
        <tr>
          <td style="padding-bottom:8px;font-size:24px;font-weight:700;color:#fafafa;">
            أهلاً بيك! 🎉
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:16px;font-size:16px;color:#e5e5e5;line-height:1.7;">
            أهلاً ${safeName}،
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:16px;font-size:15px;color:#d4d4d4;line-height:1.7;">
            تم قبول طلب الاشتراك في الكوتشينج. الكوتش هيتواصل معاك على الواتساب
            لتحديد ميعاد المكالمة الأولى وإرسال بيانات الدفع، وهيتم تجهيز خطة
            التدريب والتغذية مخصوصة ليك.
          </td>
        </tr>
        <tr>
          <td style="padding:16px 0;">
            <a href="${safeLogin}"
               style="display:inline-block;padding:12px 24px;background:#a3e635;color:#0f0f0f;font-weight:700;text-decoration:none;border-radius:8px;">
              ادخل على الحساب
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:16px;font-size:13px;color:#a3a3a3;line-height:1.7;">
            لو الزرار مش شغّال، انسخ اللينك ده في المتصفح:<br>
            <span style="color:#d4d4d4;word-break:break-all;">${safeLogin}</span>
          </td>
        </tr>
        <tr>
          <td style="padding-top:8px;font-size:14px;color:#a3a3a3;line-height:1.7;">
            — فريق Coaching Platform
          </td>
        </tr>
      `,
    });
    return { subject, html, text };
  }

  const subject = "You're in — welcome to coaching";
  const text = `Hi ${safeName},

Your application has been accepted. Your coach will reach out on WhatsApp shortly to schedule your first call and share payment details. A custom training and nutrition plan will be prepared for you.

Log in here: ${loginUrl}

— Coaching Platform`;
  const html = emailLayout({
    locale: "en",
    title: subject,
    bodyHtml: `
      <tr>
        <td style="padding-bottom:8px;font-size:24px;font-weight:700;color:#fafafa;">
          You're in 🎉
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:16px;font-size:16px;color:#e5e5e5;line-height:1.7;">
          Hi ${safeName},
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:16px;font-size:15px;color:#d4d4d4;line-height:1.7;">
          Your application has been accepted. Your coach will reach out on
          WhatsApp shortly to schedule your first call and share payment
          details. A custom training and nutrition plan will be built for you.
        </td>
      </tr>
      <tr>
        <td style="padding:16px 0;">
          <a href="${safeLogin}"
             style="display:inline-block;padding:12px 24px;background:#a3e635;color:#0f0f0f;font-weight:700;text-decoration:none;border-radius:8px;">
            Log in to your account
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:16px;font-size:13px;color:#a3a3a3;line-height:1.7;">
          If the button doesn't work, paste this link into your browser:<br>
          <span style="color:#d4d4d4;word-break:break-all;">${safeLogin}</span>
        </td>
      </tr>
      <tr>
        <td style="padding-top:8px;font-size:14px;color:#a3a3a3;line-height:1.7;">
          — The Coaching Platform team
        </td>
      </tr>
    `,
  });
  return { subject, html, text };
}
