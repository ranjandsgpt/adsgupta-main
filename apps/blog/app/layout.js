import "../styles/globals.css";
import { Space_Grotesk } from "next/font/google";
import Header from "../components/Header";
import { Footer } from "@adsgupta/ui";
import AIAssistant from "../components/ui/AIAssistant";
import { getAllPosts } from "../lib/posts";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

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
    <html lang="en" className={spaceGrotesk.variable}>
      <body className="app-body">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <AIAssistant articles={knowledgeBase} />
      </body>
    </html>
  );
}
