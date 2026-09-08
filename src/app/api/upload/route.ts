import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: Request): Promise<NextResponse> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "Моля, изберете поне една снимка за качване." },
        { status: 400 }
      );
    }

    if (!token) {
      // Local development message when Blob is not yet linked
      return NextResponse.json({
        warning: "Vercel Blob токенът не е конфигуриран локално. Във Vercel качването ще работи автоматично след активиране на Vercel Blob.",
        success: true,
        demo: true,
      });
    }

    const uploaded = [];

    for (const file of files) {
      if (file.size === 0) continue;
      // Keep safe filename
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filename = `photos/${Date.now()}-${cleanName}`;

      const blob = await put(filename, file, {
        access: "public",
        addRandomSuffix: true,
      });
      uploaded.push(blob);
    }

    return NextResponse.json({ success: true, uploaded });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Грешка при качване на снимките.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
