import OneTimePassEmail from "@/emails/one-time-password";
import PasswordReset from "@/emails/password-reset";
import { render } from "@react-email/components";

export default async function Home() {
  const html = await render(<PasswordReset username="Irfan" email="" />, {
    pretty: true,
  });

  return (
    <>
      <iframe
        className="w-full bg-white h-[calc(100vh_-_140px)] lg:h-[calc(100vh_-_70px)]"
        srcDoc={html}
      >
        {html}
      </iframe>
    </>
  );
}
