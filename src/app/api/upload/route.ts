import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const maxDuration = 30; // seconds

export async function POST(request: Request): Promise<NextResponse> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  try {
    const formData = await request.formData();
    const rawFiles = formData.getAll("file").concat(formData.getAll("files")) as File[];
    const files = rawFiles.filter((f) => f && f.size > 0);

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Моля, изберете поне една снимка за качване." },
        { status: 400 }
      );
    }

    const uploaded = [];

    if (!token) {
      // Blob storage not connected yet - convert to data URLs so client can immediately display them
      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64 = buffer.toString("base64");
        const mime = file.type || "image/jpeg";
        const dataUrl = `data:${mime};base64,${base64}`;

        uploaded.push({
          url: dataUrl,
          pathname: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          downloadUrl: dataUrl,
        });
      }

      return NextResponse.json({
        success: true,
        demo: true,
        warning:
          "Vercel Blob хранилището все още не е активирано във Vercel. За да се виждат снимките от всички гости, активирайте 'Blob' в Storage таба на Vercel.",
        uploaded,
      });
    }

    // When token is set, upload permanently to Vercel Blob CDN
    for (const file of files) {
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
        uploadedAt: new Date().toISOString(),
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
