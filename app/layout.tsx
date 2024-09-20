import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";

const inter = Inter({ subsets: ["latin"] });

import Provider from "@/components/provider";
import { ReactQueryProvider } from "@/components/react-query-provider";
import { siteConfig } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    default: `Welcome to ${siteConfig.name}`,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryProvider>
      <html lang="en">
        <body className={`${inter.className} text-sm`}>
          <NextTopLoader />
          <Provider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </Provider>
        </body>
      </html>
    </ReactQueryProvider>
  );
}
