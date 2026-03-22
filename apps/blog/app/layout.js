import "../styles/globals.css";
import { Barlow_Condensed, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import Header from "../components/Header";
import Providers from "../components/Providers";
import { Footer } from "@adsgupta/ui";
import AIAssistant from "../components/ui/AIAssistant";
import { getAllPosts } from "../lib/posts";

const fontDisplay = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["300", "500", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

const fontBody = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
  display: "swap",
});

const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const fontVars = `${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`;

export const metadata = {
  title: {
    default: "AdsGupta — The Archives",
    template: "%s | AdsGupta",
  },
  description: "Industrial luxury essays on the future of ad-tech.",
  metadataBase: new URL("https://blog.adsgupta.com"),
  openGraph: {
    title: "AdsGupta — The Archives",
    description: "Deciphering the future of ad-tech.",
    url: "https://blog.adsgupta.com",
    siteName: "AdsGupta",
    type: "website",
  },
};

export default async function RootLayout({ children }) {
  const posts = await getAllPosts();
  const knowledgeBase = posts.map((post) => ({
    slug: post.slug,
    title: post.meta?.title,
    description: post.meta?.description,
    content: post.content,
  }));

  return (
    <html lang="en" className={fontVars}>
      <body className="app-body">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer subscribeEndpoint={process.env.NEXT_PUBLIC_SUBSCRIBE_URL || "/api/subscribe"} subscribeSource="footer" />
          <AIAssistant articles={knowledgeBase} />
        </Providers>
      </body>
    </html>
  );
}
