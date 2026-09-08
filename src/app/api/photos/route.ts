import { NextResponse } from "next/server";
import { list } from "@vercel/blob";

// Initial demo photos used when no Vercel Blob token is configured (e.g. local dev)
const DEMO_PHOTOS = [
  {
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop",
    pathname: "wedding_moment_1.jpg",
    size: 2450000,
    uploadedAt: new Date(Date.now() - 3600000).toISOString(),
    downloadUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop",
  },
  {
    url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1600&auto=format&fit=crop",
    pathname: "celebration_toast.jpg",
    size: 1980000,
    uploadedAt: new Date(Date.now() - 7200000).toISOString(),
    downloadUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1600&auto=format&fit=crop",
  },
  {
    url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1600&auto=format&fit=crop",
    pathname: "happy_couple.jpg",
    size: 2150000,
    uploadedAt: new Date(Date.now() - 10800000).toISOString(),
    downloadUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1600&auto=format&fit=crop",
  },
  {
    url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1600&auto=format&fit=crop",
    pathname: "wedding_details.jpg",
    size: 1820000,
    uploadedAt: new Date(Date.now() - 14400000).toISOString(),
    downloadUrl: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1600&auto=format&fit=crop",
  },
  {
    url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1600&auto=format&fit=crop",
    pathname: "dance_floor_joy.jpg",
    size: 2310000,
    uploadedAt: new Date(Date.now() - 18000000).toISOString(),
    downloadUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1600&auto=format&fit=crop",
  },
  {
    url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1600&auto=format&fit=crop",
    pathname: "evening_lights.jpg",
    size: 1740000,
    uploadedAt: new Date(Date.now() - 21600000).toISOString(),
    downloadUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1600&auto=format&fit=crop",
  },
];

export const dynamic = "force-dynamic";

export async function GET() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    // If no token (local development), return demo photos
    return NextResponse.json({
      isDemo: true,
      photos: DEMO_PHOTOS,
    });
  }

  try {
    const { blobs } = await list();
    // Sort newest first
    const sorted = blobs
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
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    return NextResponse.json({
      isDemo: false,
      photos: sorted,
    });
  } catch (error) {
    console.error("Error fetching blobs:", error);
    return NextResponse.json(
      { isDemo: true, photos: DEMO_PHOTOS, error: "Failed to list blobs" },
      { status: 500 }
    );
  }
}
