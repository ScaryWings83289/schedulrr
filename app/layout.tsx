import "@/app/globals.css";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Schedulrr",
  description: "Schedulrr is a scheduling app that helps you manage your schedule and tasks.",
};

const RootLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <ClerkProvider>
          {/* Header */}
          <Header />

          <main className="min-h-screen bg-linear-to-b from-blue-50 to-white">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-blue-100 py-12">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>Made with 💗 by Divyankar</p>
            </div>
          </footer>
        </ClerkProvider>
      </body>
    </html >
  );
};

export default RootLayout;