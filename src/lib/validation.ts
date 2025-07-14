import { z } from "zod";

const requiredString = z
  .string()
  .trim()
  .min(1, { message: "This field is required" });

export const createPostSchema = z.object({
  content: requiredString,
});
