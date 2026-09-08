import { NextResponse } from "next/server";
import { list } from "@vercel/blob";
import staticWeddingPhotos from "@/data/wedding-photos.json";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  // Natural sort for the base wedding album
  const sortedStatic = [...staticWeddingPhotos].sort((a, b) =>
    (a.pathname || "").localeCompare(b.pathname || "", undefined, {
      numeric: true,
      sensitivity: "base",
    })
  );

  if (!token) {
    return NextResponse.json({
      photos: sortedStatic,
      totalCount: sortedStatic.length,
    });
  }

  try {
    const { blobs } = await list();
    const guestPhotos = blobs
      .filter((b) => {
        const name = b.pathname.toLowerCase();
        return (
          name.endsWith(".jpg") ||
          name.endsWith(".jpeg") ||
          name.endsWith(".png") ||
          name.endsWith(".webp") ||
          name.endsWith(".gif") ||
          name.endsWith(".heic")
        );
      })
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .map((b) => ({
        url: b.url,
        pathname: b.pathname,
        size: b.size,
        uploadedAt: b.uploadedAt,
        downloadUrl: b.downloadUrl || b.url,
      }));

    // Guest uploads show first, followed by the main wedding photos
    const allPhotos = [...guestPhotos, ...sortedStatic];

    return NextResponse.json({
      photos: allPhotos,
      guestCount: guestPhotos.length,
      totalCount: allPhotos.length,
    });
  } catch (error) {
    console.error("Error listing blobs:", error);
    return NextResponse.json({
      photos: sortedStatic,
      totalCount: sortedStatic.length,
    });
  }
}
