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
  otp: string;
  email: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

export const OneTimePassword = ({
  username,
  otp,
  email,
}: VercelInviteUserEmailProps) => {
  return (
    <Html>
      <Head />

      <Tailwind>
        <Body className="bg-background font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded-lg my-[40px] mx-auto p-[30px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src={`${baseUrl}/logo.png`}
                height="40"
                alt="Vercel"
                className="my-0"
              />
            </Section>
            <Hr />
            <Heading className="text-black text-3xl font-semibold my-[30px]">
              Your authentication code
            </Heading>
            <Text className="text-zinc-700 text-[14px] leading-[24px]">
              Hello {username},
            </Text>
            <Text className="text-zinc-700 text-[14px] leading-[24px]">
              We received a request to either log in to your account or reset
              your password. To proceed with request, please use the following
              One-Time Password (OTP):
            </Text>
            <Section>
              <Heading className="text-3xl font-semibold mt-1">{otp}</Heading>
            </Section>
            <Section>
              <Button
                className="bg-[#000000] cursor-pointer rounded text-white text-sm font-semibold no-underline text-center px-6 py-3 w-auto"
                href={`${baseUrl}/auth/signin/otp`}
              >
                Access Your Account
              </Button>
            </Section>
            <Text className="text-zinc-700 text-[14px] leading-[24px]">
              If you didn't request this, please ignore this email.
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

export default OneTimePassword;
