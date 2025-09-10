import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/assets/styles/globals.css";
import { BookingProvider } from "@/components/BookingProvider";
import { AuthProvider } from "@/components/AuthProvider";
import Chat from "@/components/Chat";
import Navbar from "@/components/Navbar";
// import Error from "@/components/Errors";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Contoso Air",
  description: "Contoso Air",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <BookingProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Chat />
            {/* <Error /> */}
          </BookingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
