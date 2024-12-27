"use server"

import prisma from "@/lib/prisma";
import { createPostSchema } from "@/lib/validations";
import { currentUser } from "@clerk/nextjs/server";

export async function submitPost(input: string) {
    const user = await currentUser();
    if(!user) throw Error("Unauthorized")
    const userId = user?.id;


    const {content} = createPostSchema.parse({content: input})

    await prisma.post.create({
        data: {
            content,
            userId
        }
    })
}