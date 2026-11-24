import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

export const metadata = {
  icons: {
    icon: '/logo/Favicon_archive.svg'
  },
  title: "ARCHIVE | Digital Architecture & Art Showcase",
  description: "A minimalist architectural showcase platform for architects, digital artists, and curators. Explore curated works, join challenges, and connect with the community.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} h-full antialiased`}
    >
      <body className={`${manrope.className} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
