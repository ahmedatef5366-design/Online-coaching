import { emailLayout, escapeHtml } from "../format";

export type ApplicationReceivedInput = {
  fullName: string;
  locale: "en" | "ar";
};

export function applicationReceivedTemplate({
  fullName,
  locale,
}: ApplicationReceivedInput): { subject: string; html: string; text: string } {
  const safeName = escapeHtml(fullName.split(" ")[0] || fullName);

  if (locale === "ar") {
    const subject = "استلمنا طلبك — هنرد عليك قريب";
    const text = `أهلاً ${safeName}،

استلمنا فورم التقديم. الكوتش هيراجع البيانات وهيتواصل معاك خلال 1-2 يوم عمل لتأكيد الباقة وبداية التدريب.

لو محتاج تضيف أي حاجة على طلبك، رد على الإيميل ده.

— Coaching Platform`;
    const html = emailLayout({
      locale: "ar",
      title: subject,
      bodyHtml: `
        <tr>
          <td style="padding-bottom:8px;font-size:24px;font-weight:700;color:#fafafa;">
            استلمنا طلبك ✨
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:16px;font-size:16px;color:#e5e5e5;line-height:1.7;">
            أهلاً ${safeName}،
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:16px;font-size:15px;color:#d4d4d4;line-height:1.7;">
            استلمنا فورم التقديم. الكوتش هيراجع بياناتك وهيتواصل معاك خلال
            <strong style="color:#a3e635;">1–2 يوم عمل</strong>
            لتأكيد الباقة وبداية التدريب.
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:16px;font-size:15px;color:#d4d4d4;line-height:1.7;">
            في الوقت ده، لو فيه أي حاجة عاوز تضيفها (إصابات حديثة، تفضيلات معينة، إلخ)،
            رد على الإيميل ده وهيوصل للكوتش مباشرة.
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

  const subject = "We received your application — talk soon";
  const text = `Hi ${safeName},

We received your application. Your coach will review the details and reach out within 1–2 business days to confirm your package and kick off training.

If you have anything to add, just reply to this email — it goes straight to the coach.

— Coaching Platform`;
  const html = emailLayout({
    locale: "en",
    title: subject,
    bodyHtml: `
      <tr>
        <td style="padding-bottom:8px;font-size:24px;font-weight:700;color:#fafafa;">
          Application received ✨
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:16px;font-size:16px;color:#e5e5e5;line-height:1.7;">
          Hi ${safeName},
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:16px;font-size:15px;color:#d4d4d4;line-height:1.7;">
          Thanks for applying. Your coach will review your details and reach
          out within
          <strong style="color:#a3e635;">1–2 business days</strong>
          to confirm your package and kick off training.
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:16px;font-size:15px;color:#d4d4d4;line-height:1.7;">
          If you have anything to add — recent injuries, preferences, schedule
          constraints — just reply to this email and it will go straight to the
          coach.
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
