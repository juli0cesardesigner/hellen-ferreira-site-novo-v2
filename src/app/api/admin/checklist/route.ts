import { NextRequest, NextResponse } from "next/server";
import { 
  getChecklistItems, 
  createChecklistItem, 
  updateChecklistItem, 
  deleteChecklistItem 
} from "@/lib/actions/admin-actions";

export async function GET() {
  const res = await getChecklistItems();
  if (!res.success) {
    return NextResponse.json({ error: res.error }, { status: 500 });
  }
  return NextResponse.json({ items: res.data });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await createChecklistItem(body);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 500 });
    }
    return NextResponse.json({ item: res.data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing item id" }, { status: 400 });
    }
    const res = await updateChecklistItem(id, updates);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 500 });
    }
    return NextResponse.json({ item: res.data });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing item id" }, { status: 400 });
    }
    const res = await deleteChecklistItem(id);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
