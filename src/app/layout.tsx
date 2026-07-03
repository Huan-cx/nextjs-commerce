import "./globals.css";
import {GlobalProviders} from "@/providers";
import {generateMetadataForPage} from "@utils/helper";
import {staticSeo} from "@utils/metadata";
import {SpeculationRules} from "@components/theme/SpeculationRules";
import {ErrorBoundary} from "@/components/error/ErrorBoundary";
import {Metadata} from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadataForPage("", staticSeo.default);
}

type Props = {
  children: React.ReactNode;
};

export default function RootLayout({children}: Props) {

  return (
      <html suppressHydrationWarning>
      <head>
      </head>
      <body className="min-h-screen font-outfit text-foreground bg-background antialiased pb-16 lg:pb-0">
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