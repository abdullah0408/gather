import type { Metadata } from "next";

import Menubar from "@/components/Menubar";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: {
    template: "%s | Gather",
    default: "Gather",
  },
  description:
    "Gather is a social media platform where you can connect with friends, share your thoughts, and discover new content.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="max-w-7xl mx-auto p-5 flex w-full grow gap-5">
          <Menubar className="sticky top-[5.25rem] h-fit hidden sm:block flex-none space-y-3 rounded-2xl bg-card px-3 py-5 lg:px-5 shadow-sm xl:w-80" />
          {children}
        </div>
        <Menubar className="sticky bottom-0 flex w-full justify-center gap-5 border-t bg-card p-3 sm:hidden" />
      </div>
    </AuthProvider>
  );
}
