
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
  title: "TicketWave Monitors",
  description: "whop.com/ticketwave",
  keywords: ['Ticket monitors', 'Restock monitors', 'Tickets Resell', 'Ticketwave', 'Ticketwave monitors', 'Ticket Wave', 'Wave of Tickets'],
  authors: [{ name: 'TicketWave' }, { name: 'Busto' }, { name: 'Wenyxz' }],
  images: [{
    url: 'https://i.imgur.com/CJSGbzB.png',
    width: 800,
    height: 800,
    alt: 'TicketWave Monitors'
  }],
  twitter: {
    card: 'summary_large_image',
    title: 'TicketWave Monitors',
    description: 'Beat the market, maximize profits',
    creator: '@ticketswave',
    images: ['https://i.imgur.com/CJSGbzB.png'], // Must be an absolute URL
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background`}>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}