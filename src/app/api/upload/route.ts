import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const maxDuration = 30; // seconds

export async function POST(request: Request): Promise<NextResponse> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  try {
    const formData = await request.formData();
    // Support both single file and multiple files in form data
    const rawFiles = formData.getAll("file").concat(formData.getAll("files")) as File[];
    const files = rawFiles.filter((f) => f && f.size > 0);

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Моля, изберете поне една снимка за качване." },
        { status: 400 }
      );
    }

    if (!token) {
      // Message when Blob storage is not connected yet
      return NextResponse.json({
        warning:
          "Vercel Blob хранилището все още не е активирано във Vercel. След като натиснете 'Create Blob' във Vercel Storage, снимките ще се пазят завинаги.",
        success: true,
        demo: true,
      });
    }

    const uploaded = [];

    for (const file of files) {
      // Clean safe filename
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filename = `wedding/${Date.now()}-${cleanName}`;

      const blob = await put(filename, file, {
        access: "public",
        addRandomSuffix: true,
      });
      uploaded.push({
        url: blob.url,
        pathname: blob.pathname,
        size: file.size,
        downloadUrl: blob.downloadUrl || blob.url,
      });
    }

    return NextResponse.json({ success: true, uploaded });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Грешка при качване на снимките.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
