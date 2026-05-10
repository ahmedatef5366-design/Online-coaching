import "server-only";
import { sendEmail, type SendEmailResult } from "./client";
import { applicationReceivedTemplate } from "./templates/application-received";
import { applicationAcceptedTemplate } from "./templates/application-accepted";
import { siteUrl } from "@/lib/seo/site";

export async function sendApplicationReceivedEmail(args: {
  to: string;
  fullName: string;
  locale: "en" | "ar";
}): Promise<SendEmailResult> {
  const tpl = applicationReceivedTemplate({
    fullName: args.fullName,
    locale: args.locale,
  });
  return sendEmail({
    to: args.to,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
  });
}

export async function sendApplicationAcceptedEmail(args: {
  to: string;
  fullName: string;
  locale: "en" | "ar";
}): Promise<SendEmailResult> {
  const tpl = applicationAcceptedTemplate({
    fullName: args.fullName,
    locale: args.locale,
    loginUrl: `${siteUrl()}/login`,
  });
  return sendEmail({
    to: args.to,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
  });
}

export { sendEmail } from "./client";
export type { SendEmailInput, SendEmailResult } from "./client";
