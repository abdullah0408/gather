import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

    // Check if WEBHOOK_SECRET is available in the environment variables
    if (!WEBHOOK_SECRET) {
        return new Response("WEBHOOK_SECRET missing in env", { status: 500 });
    }

    const headerPayload = await headers();
    const svixId = headerPayload.get("svix-id");
    const svixTimestamp = headerPayload.get("svix-timestamp");
    const svixSignature = headerPayload.get("svix-signature");

    // Ensure all necessary headers are provided
    if (!svixId || !svixTimestamp || !svixSignature) {
        return new Response("Error: missing svix headers", { status: 400 });
    }

    // Validate Content-Type
    const contentType = req.headers.get("Content-Type");
    if (contentType !== "application/json") {
        return new Response("Invalid content type", { status: 400 });
    }

    const payload = await req.json();

    // Ensure payload is not null and is an object
    if (payload === null || typeof payload !== "object") {
        return new Response("Invalid payload received", { status: 400 });
    }

    const body = JSON.stringify(payload);
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    // Verify the webhook signature
    try {
        evt = wh.verify(body, {
            "svix-id": svixId,
            "svix-timestamp": svixTimestamp,
            "svix-signature": svixSignature
        }) as WebhookEvent;
    } catch (err) {
        return new Response("Error verifying Webhook: " + err.message, { status: 500 });
    }

    // If no event data is found, return an error
    if (!evt.data) {
        return new Response("No event data found", { status: 400 });
    }

    const clerkId = evt.data.id;
    const clerkEmail = evt.data.email_addresses[0]?.email_address;
    const clerkUsername = evt.data.username;
    const clerkFirstName = evt.data.first_name;
    const clerkLastName = evt.data.last_name;
    const displayName = `${clerkFirstName} ${clerkLastName}`;
    const clerkProfilePicture = evt.data.image_url;
    const eventType = evt.type;

    // Process the "user.created" event type
    if (eventType === "user.created") {
        if (!clerkEmail || !clerkId) {
            return new Response("Missing required data for user creation", { status: 400 });
        }

        try {
            // Create a new user in the database
            const newUser = await prisma.user.create({
                data: {
                    id: clerkId,
                    email: clerkEmail,
                    username: clerkUsername,
                    displayName: displayName,
                    avatarUrl: clerkProfilePicture
                }
            });
        } catch (err: any) {
            return new Response("Error creating user: " + err.message, { status: 500 });
        }
    }

    return new Response("Webhook processed successfully", { status: 200 });
}
