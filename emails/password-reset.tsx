import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Section,
  Text,
  Tailwind,
  Link,
} from "@react-email/components";
import * as React from "react";

interface VercelInviteUserEmailProps {
  username: string;
  email: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  ? `https://${process.env.NEXT_PUBLIC_APP_URL}`
  : "";

export const PasswordReset = ({
  username,
  email,
}: VercelInviteUserEmailProps) => {
  return (
    <Html>
      <Head />

      <Tailwind>
        <Body className="bg-background font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded-lg my-[40px] mx-auto p-[30px] max-w-[465px]">
            <Section className="pb-[22px]">
              <Img
                src={"/logo.png"}
                height="40"
                alt="Vercel"
                className="my-0"
              />
            </Section>
            <Hr />
            <Heading className="text-black text-3xl font-semibold my-[30px]">
              Your password has been updated
            </Heading>
            <Text className="text-zinc-700 text-[14px] leading-[24px]">
              Hello {username},
            </Text>
            <Text className="text-zinc-700 text-[14px] leading-[24px]">
              We wanted to inform you that your account password has been
              successfully updated. If you made this change, no further action
              is required. Your account is now secure with the new password you
              created.
            </Text>
            <Section>
              <Button
                className="bg-black cursor-pointer rounded text-white text-sm font-semibold no-underline text-center px-6 py-3 w-auto"
                href={`${baseUrl}/auth/signin`}
              >
                Access Your Account
              </Button>
            </Section>
            <Text className="text-zinc-700 text-[14px] leading-[24px]">
              If you did not request this change, please change your password
              immediately.
              <br />
              We recommend choosing strong, unique passwords and updating them
              regularly to keep your account secure.
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-zinc-500 text-[12px] leading-[24px]">
              This email was intended for
              <span className="text-black">{email}</span>. If you didn’t request
              this, you can ignore this email. If you’re concerned about your
              account’s security, please{" "}
              <Link href="/" className="text-black no-underline">
                click here
              </Link>{" "}
              to secure your account.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default PasswordReset;
