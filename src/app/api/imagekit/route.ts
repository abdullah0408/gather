import { imagekit } from "@/lib/imageKit";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { MediaType } from "@/generated/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file found" }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();

    const response = await imagekit.upload({
      file: Buffer.from(fileBuffer),
      fileName: file.name,
      useUniqueFileName: true,
    });

    const media = await prisma.media.create({
      data: {
        url: response.url,
        fileId: response.fileId,
        type: file.type.startsWith("image") ? MediaType.IMAGE : MediaType.VIDEO,
      },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
