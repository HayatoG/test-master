import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ToastProvider } from "@/components/ui/Toast";
import { getSession } from "@/lib/auth/server";
import { BugsProvider } from "@/lib/bugs/BugsProvider";
import { bugsEnabled } from "@/lib/bugs/server";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "QA Playground", template: "%s · QA Playground" },
  description: "Site de treino para automação de testes E2E com Playwright.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [session, bugsOn] = await Promise.all([getSession(), bugsEnabled()]);

  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <BugsProvider initialEnabled={bugsOn}>
          <ToastProvider>
            <Header session={session} bugsOn={bugsOn} />
            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:flex-row">
              <Sidebar />
              <main id="conteudo" className="min-w-0 flex-1">
                {children}
              </main>
            </div>
            <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
              QA Playground — ambiente de treino. Os dados são fictícios e voltam ao estado inicial com o reset.
            </footer>
          </ToastProvider>
        </BugsProvider>
      </body>
    </html>
  );
}
