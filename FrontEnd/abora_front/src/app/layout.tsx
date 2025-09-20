"use client";

import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import Aurora from "@/app/Components/ReactBits/Aurora";
import CustomCursor from "@/app/Components/GSAP/CustomCursor";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/*<CustomCursor />*/}
        {children}
        {/*{<Aurora*/}
      <footer></footer>
      </body>
    </html>
  );
}
