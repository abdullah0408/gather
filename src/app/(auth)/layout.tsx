import LogoSpinning from "@/components/LogoSpinning";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Gather",
    default: "Gather",
  },
  description:
    "Sign in or sign up to Gather, a social media platform to connect and share.",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2 bg-background p-6 md:p-10">
      <LogoSpinning size={60} />
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
