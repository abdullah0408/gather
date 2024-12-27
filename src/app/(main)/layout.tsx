"use client"

import Navbar from "./_components/Navbar";
import { ThemeProvider } from "next-themes"
import { useEffect, useState } from "react";
import Menubar from "./_components/Menubar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // This will ensure the component is only rendered on the client
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a loading state or nothing while the component is mounting
    return null;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="mx-auto max-w-7xl p-5 flex w-full grow gap-5">
          <Menubar className="sticky top-[5.25rem] h-fit hidden sm:block flex-none space-y-3 rounded-2xl bg-card px-3 py-5 lg:px-5 shadow-sm xl:w-80" />
          {children}</div>
      </div>
      <Menubar className="sticky bottom-0 flex w-full justify-center gap-5 border-t bg-card p-3 sm:hidden" />
    </ThemeProvider>
  );
}
