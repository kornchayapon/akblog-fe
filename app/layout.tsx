'use client';

import { IBM_Plex_Sans_Thai, Manrope, Newsreader } from 'next/font/google';
import './globals.css';

const ibm = IBM_Plex_Sans_Thai({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  variable: '--font-ibm',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
});

interface LayoutProps {
  children: React.ReactNode;
}

const RootLayout = ({ children }: Readonly<LayoutProps>) => {
  return (
    <html lang='en'>
      <body
        className={`${manrope.variable} ${newsreader.variable} ${ibm.variable} ${manrope.className} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
