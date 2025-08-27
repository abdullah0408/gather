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
 *      const { userDetails, isLoading, isSignedIn, isLoaded, refetch } = useAuth();
 *
 *      if (!isLoaded) return <p>Loading Clerk session...</p>;
 *      if (isLoading) return <p>Loading user data...</p>;
 *      if (!isSignedIn) return <p>Please sign in to continue.</p>;
 *
 *      return <h1>Welcome, {userDetails?.name}</h1>;
 *    };
 *
 * 3. Refreshing user data when needed:
 *
 *    const UserProfile = () => {
 *      const { userDetails, refetch, isLoading } = useAuth();
 *      const [isSaving, setIsSaving] = useState(false);
 *
 *      const handleUpdateProfile = async (formData) => {
 *        setIsSaving(true);
 *        try {
 *          // Update user via your API
 *          await fetch('/api/user/update', {
 *            method: 'PUT',
 *            body: JSON.stringify(formData)
 *          });
 *
 *          // Refresh user details to get updated data
 *          await refetch();
 *        } catch (error) {
 *          console.error('Update failed:', error);
 *        } finally {
 *          setIsSaving(false);
 *        }
 *      };
 *
 *      return (
 *        <div>
 *          <p>Name: {userDetails?.name}</p>
 *          <button
 *            onClick={() => handleUpdateProfile(newData)}
 *            disabled={isSaving || isLoading}
 *          >
 *            {isSaving ? 'Saving...' : 'Update Profile'}
 *          </button>
 *        </div>
 *      );
 *    };
 *
 * Returns:
 * --------
 * - `userDetails`: Your Prisma user record corresponding to the Clerk user.
 * - `isLoading`: Whether userDetails are currently being fetched from the database.
 * - `isSignedIn`: Whether Clerk shows the user as authenticated.
 * - `isLoaded`: Whether Clerk has finished initializing on the client.
 * - `refetch`: Function to manually refresh user details from the database.
 *
 * Common Refetch Use Cases:
 * ------------------------
 * - After updating user profile information
 * - After role or permission changes
 * - After subscription status updates
 * - When you need to ensure fresh data from the database
 * - After administrative actions that modify the user record
 * - Following successful payment or billing updates
 */
