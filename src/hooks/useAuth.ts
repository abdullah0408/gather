import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";

/**
 * Custom hook to consume AuthContext.
 * Throws if used outside <AuthProvider>.
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};

/**
 * Usage Example (Next.js App Router with Clerk):
 * ----------------------------------------------
 * 1. Wrap your root layout (`app/layout.tsx`) with <ClerkProvider> and <AuthProvider>:
 *
 *    import { ClerkProvider } from "@clerk/nextjs";
 *    import { AuthProvider } from "@/contexts/AuthContext";
 *
 *    export default function RootLayout({ children }) {
 *      return (
 *        <ClerkProvider>
 *          <AuthProvider>
 *            <html lang="en">
 *              <body>{children}</body>
 *            </html>
 *          </AuthProvider>
 *        </ClerkProvider>
 *      );
 *    }
 *
 * 2. Use the hook in any client component:
 *
 *    "use client";
 *    import { useAuth } from "@/hooks/useAuth";
 *
 *    const Dashboard = () => {
 *      const { userDetails, isLoading, isSignedIn, isLoaded } = useAuth();
 *
 *      if (!isLoaded) return <p>Loading Clerk session...</p>;
 *      if (isLoading) return <p>Loading user data...</p>;
 *      if (!isSignedIn) return <p>Please sign in to continue.</p>;
 *
 *      return <h1>Welcome, {userDetails?.name}</h1>;
 *    };
 *
 * Notes:
 * ------
 * - `userDetails`: Your Prisma user record.
 * - `isLoading`: Whether userDetails are still being fetched.
 * - `isSignedIn`: Whether Clerk shows the user as signed in.
 * - `isLoaded`: Whether Clerk has fully initialized.
 */