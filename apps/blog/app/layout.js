export const metadata = {
  title: "BlogAI by AdsGupta",
  description: "Industrial Luxury Tech Blog",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ background: "#0f1115", color: "#e6faff", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
