import {Outfit} from "next/font/google";
import "./globals.css";
import {GlobalProviders} from "@/providers";
import {generateMetadataForPage} from "@utils/helper";
import {staticSeo} from "@utils/metadata";
import {SpeculationRules} from "@components/theme/SpeculationRules";
import {ErrorBoundary} from "@/components/error/ErrorBoundary";
import clsx from "clsx";
import {Metadata} from "next";

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  variable: "--font-outfit",
  display: "optional",
  preload: true,
});

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadataForPage("", staticSeo.default);
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body className={clsx(
          "min-h-screen font-outfit text-foreground bg-background antialiased pb-16 lg:pb-0",
        outfit.variable
      )}>
        <main>
          <ErrorBoundary>
            <GlobalProviders>
              {children}
            </GlobalProviders>
            <SpeculationRules />
          </ErrorBoundary>
        </main>
        <span className="dsv-2025.04.19-7e29" />
      </body>
    </html>
  );
}