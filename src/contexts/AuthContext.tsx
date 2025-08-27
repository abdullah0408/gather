"use client";

import React, { createContext, useEffect, useState, useCallback } from "react";
import { User as PrismaUser } from "@/generated/prisma/client.js";
import { useUser } from "@clerk/nextjs";

interface AuthContextType {
  userDetails: PrismaUser | null;
  isLoading: boolean;
  isSignedIn: boolean | undefined;
  isLoaded: boolean | undefined;
  refetch: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

/**
 * AuthProvider fetches the Prisma User row corresponding to the currently
 * signed-in Clerk user (looked up by clerkId). During the fetch, it
 * maintains an `isLoading` flag so children can know whether it’s still
 * waiting on Prisma.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userDetails, setUserDetails] = useState<PrismaUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // useUser() from @clerk/nextjs gives us:
  //   - isSignedIn: whether Clerk thinks someone is signed in
  //   - user: the raw Clerk User object (which has .id, .emailAddresses, etc.)
  //   - isLoaded: whether Clerk has finished loading user data on the client
  const { isSignedIn, user, isLoaded } = useUser();

  const fetchDetails = useCallback(
    async (retryCount = 0): Promise<void> => {
      try {
        if (isLoaded && isSignedIn && user) {
          const res = await fetch("/api/user/user-details");

          if (!res.ok) {
            // If user is not found (404) and we haven't exhausted retries, retry every 1 second
            if (res.status === 404 && retryCount < 10) {
              console.log(
                `User not found in database, retrying in 1 second (attempt ${
                  retryCount + 1
                }/10)`
              );
              await new Promise((resolve) => setTimeout(resolve, 1000));
              return fetchDetails(retryCount + 1);
            }
            throw new Error(`Failed to fetch user details: ${res.status}`);
          }

          const prismaUser = await res.json();
          setUserDetails(prismaUser);
          console.log("User details fetched successfully");
        } else {
          setUserDetails(null);
        }
      } catch (err) {
        console.error("Error in AuthProvider.fetchDetails:", err);
        setUserDetails(null);
      }
    },
    [isSignedIn, user, isLoaded]
  );

  // Exposed refetch function that components can call
  const refetch = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await fetchDetails();
    } finally {
      setIsLoading(false);
    }
  }, [fetchDetails]);

  useEffect(() => {
    let isMounted = true;
    let retryTimeout: NodeJS.Timeout;

    const fetchDetailsWithRetry = async (retryCount = 0) => {
      try {
        if (isLoaded && isSignedIn && user) {
          const res = await fetch("/api/user/user-details");

          if (!res.ok) {
            // If user is not found (404) and we haven't exhausted retries, retry every 1 second
            if (res.status === 404 && retryCount < 10) {
              console.log(
                `User not found in database, retrying in 1 second (attempt ${
                  retryCount + 1
                }/10)`
              );
              retryTimeout = setTimeout(() => {
                if (isMounted) {
                  fetchDetailsWithRetry(retryCount + 1);
                }
              }, 1000);
              return;
            }
            throw new Error(`Failed to fetch user details: ${res.status}`);
          }

          const prismaUser = await res.json();
          if (isMounted) {
            setUserDetails(prismaUser);
            console.log("User details fetched successfully");
          }
        } else {
          if (isMounted) setUserDetails(null);
        }
      } catch (err) {
        console.error("Error in AuthProvider.fetchDetails:", err);
        if (isMounted) setUserDetails(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDetailsWithRetry();

    // When the component unmounts, set isMounted to false
    // so we don't try to update state after it's gone.
    return () => {
      isMounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [isSignedIn, user, isLoaded]);

  return (
    <AuthContext.Provider
      value={{ userDetails, isLoading, isSignedIn, isLoaded, refetch }}
    >
      {children}
    </AuthContext.Provider>
  );
};
