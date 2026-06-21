import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Habla",
  description: "Bring back the Spanish you already have.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/*
          Oswald loaded via link (not next/font) so the dev server and the
          headless E2E browser build/render with no build-time font fetch.
          Falls back gracefully to a sans stack when offline.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
