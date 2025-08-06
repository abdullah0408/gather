import { z } from "zod";

const requiredString = z
  .string()
  .trim()
  .min(1, { message: "This field is required" });

export const createPostSchema = z.object({
  content: requiredString,
});

export const updateUserProfileSchema = z.object({
  firstName: requiredString.optional(),
  lastName: requiredString.optional(),
  bio: z.string().max(1000, "Bio must be 1000 characters or less"),
});

export type updateUserProfileValues = z.infer<typeof updateUserProfileSchema>;
