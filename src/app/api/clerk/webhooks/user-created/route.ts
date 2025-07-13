import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { UserJSON as DefaultUserJSON } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

interface UserJSON extends DefaultUserJSON {
  birthday: string | null;
  gender: string | null;
}

export async function POST(req: Request) {
  const CLERK_WEBHOOK_SECRET_KEY = process.env.CLERK_WEBHOOK_SECRET_KEY;

  if (!CLERK_WEBHOOK_SECRET_KEY) {
    throw new Error(
      "Error: Please add CLERK_WEBHOOK_SECRET_KEY from Clerk Dashboard to .env or .env.local"
    );
  }

  // Create new Svix instance with secret
  const wh = new Webhook(CLERK_WEBHOOK_SECRET_KEY);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  // Extract user data
  const { id: clerkId } = evt.data;
  const eventType = evt.type;
  const user = evt.data as UserJSON;
  const email = user.email_addresses[0]?.email_address || "No email provided";
  const username = user.username || email;
  const firstName = user.first_name || "";
  const lastName = user.last_name || "";
  const avatarUrl = user.image_url || "No image URL provided";

  if (eventType === "user.created") {
    try {
      if (!email || !clerkId || !username) {
        return new Response("Missing required data for user creation", {
          status: 400,
        });
      }

      await prisma.user.create({
        data: {
          clerkId,
          email,
          username,
          firstName,
          lastName,
          avatarUrl,
        },
      });
    } catch (error) {
      return new Response(`Error creating user: ${error}`, { status: 500 });
    }
  }
  return new Response("Webhook received", { status: 200 });
}
