import type { Metadata } from "next";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";
import { AuthProvider } from "@/context/GlobalAuthContext";

export const metadata: Metadata = {
  title: "PSL Pulse — 8 Teams. One Infinity Legacy.",
  description: "Stake in Impact Pools | Tip Players | Own NFT Tickets | See Your Name on the Infinity Wall. PSL 2026 powered by WireFluid blockchain.",
  keywords: ["PSL", "blockchain", "WireFluid", "cricket", "NFT", "staking", "fan engagement"],
  authors: [{ name: "PSL Pulse" }],
  openGraph: {
    title: "PSL Pulse — The All-in-One Fan Impact Platform",
    description: "Transform how you engage with PSL cricket. Stake, tip, collect, and make an impact on WireFluid.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-screen flex flex-col bg-paws-dark text-white">
        <AuthProvider>
          <ToastProvider>
            <main className="flex-1">{children}</main>
            <footer className="border-t border-white/10 py-12 px-4 bg-paws-dark">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
                <div>
                  <h4 className="font-bold text-white mb-4">Company</h4>
                  <ul className="space-y-2 text-sm text-white/60">
                    <li><a href="#" className="hover:text-white transition">About</a></li>
                    <li><a href="#" className="hover:text-white transition">Blog</a></li>
                    <li><a href="#" className="hover:text-white transition">Careers</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-4">Legal</h4>
                  <ul className="space-y-2 text-sm text-white/60">
                    <li><a href="#" className="hover:text-white transition">Terms</a></li>
                    <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                    <li><a href="#" className="hover:text-white transition">Disclaimer</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-4">Social</h4>
                  <ul className="space-y-2 text-sm text-white/60">
                    <li><a href="#" className="hover:text-white transition">Twitter</a></li>
                    <li><a href="#" className="hover:text-white transition">Discord</a></li>
                    <li><a href="#" className="hover:text-white transition">Telegram</a></li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-white/10 pt-8 text-center text-sm text-white/60 space-y-1">
                <p>© 2026 PSL Pulse. All rights reserved.</p>
                <p>Built on <a href="https://wirefluid.com" className="text-rose hover:underline" target="_blank">WireFluid</a> blockchain.</p>
              </div>
            </div>
          </footer>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
