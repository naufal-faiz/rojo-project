import { Outfit } from 'next/font/google';
import "./globals.css";
import { ThemeProvider } from "@/components/common";
import { SidebarProvider } from "@/lib/context/SidebarContext";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rojo Safety - Dashboard Admin",
  description:
    "Rojo Safety Penyedia Jasa Kesehatan, Keselamatan Kerja di Bekasi",
  icons: {
    icon: "/images/favicon.ico",
  },
};

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.className} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
