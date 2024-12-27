"use server"

import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/**
 * Fetch user details from Clerk and Prisma
 * @returns The user details from the database, or null if not found
 */
export async function fetchUserDetails() {
  // Get user from Clerk
  const user = await currentUser();
  const userId = user?.id;

  // if (!userId) {
  //   console.warn("No user ID found from Clerk.");
  //   return null;
  // }

  // Fetch user data from Prisma DB
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  // if (!dbUser) {
  //   console.warn(`User with ID ${userId} not found in database.`);
  // }

  return dbUser;
}
