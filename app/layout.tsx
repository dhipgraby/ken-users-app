import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "@/lib/pdf-worker-init";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/components/providers";

const fontSans = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: "Ken-Framework",
  description: ""
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className={cn("min-h-screen font-sans antialiased", fontSans.variable)}
      >
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <Toaster
          position="top-right"
          richColors
          closeButton
          visibleToasts={9}
          toastOptions={{
            duration: 10000
          }}
        />
        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
