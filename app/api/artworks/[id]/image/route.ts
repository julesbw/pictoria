import { NextRequest, NextResponse } from "next/server";
import { resolveArtworkImage } from "@/lib/server/artwork-image-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const record = await resolveArtworkImage(params.id);

    if (!record) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    }

    if (request.nextUrl.searchParams.get("format") === "json") {
      return NextResponse.json(record);
    }

    return NextResponse.redirect(new URL(record.local_cached_url, request.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to resolve artwork image";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
