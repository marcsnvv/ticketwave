import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "TicketWave Dashboard",
  description: "Admin Monitors dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="w-full flex items-center justify-center">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased
           min-w-[960px] max-w-[960px]
          `}
      >
        {children}
      </body>
    </html>
  );
}
