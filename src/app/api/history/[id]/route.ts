import { NextRequest } from "next/server";
import { searchRepository } from "@/lib/db/search.repository";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const search = await searchRepository.findById(id);
    if (!search) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(search);
  } catch {
    return Response.json({ error: "Failed to fetch search" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await searchRepository.delete(id);
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Failed to delete" }, { status: 500 });
  }
}
