import { resend } from "@/lib/resend";
import { CreateEmailOptions } from "resend";

export const sendEmail = async ({
  email,
  subject,
  from,
  text,
  react,
  scheduledAt,
}: Omit<CreateEmailOptions, "to" | "from"> & {
  email: string;
  from?: string;
  replyToFromEmail?: boolean;
  marketing?: boolean;
}) => {
  if (!resend) {
    console.error(
      "Resend is not configured. You need to add a RESEND_API_KEY in your .env file for emails to work."
    );
    return Promise.resolve();
  }

  return resend.emails.send({
    to: "irfanansari2114@gmail.com" || email,
    from: from || "Acme <onboarding@resend.dev>",
    replyTo: "irfanansari2114@gmail.com",
    subject: subject,
    text: text,
    react: react,
    scheduledAt,
  });
};
