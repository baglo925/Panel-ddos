import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  listDirectory,
  readFile,
  writeFile,
  createDirectory,
  deleteItem,
} from "@/lib/filesystem";

async function checkAdminAuth() {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return null;
  }
  return user;
}

// GET - List directory or read file
export async function GET(request: NextRequest) {
  const user = await checkAdminAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") || "";
  const action = searchParams.get("action") || "list";

  try {
    if (action === "read") {
      const content = readFile(path);
      return NextResponse.json({ content });
    } else {
      const items = listDirectory(path);
      return NextResponse.json({ items, currentPath: path });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Operation failed" },
      { status: 400 }
    );
  }
}

// POST - Create file or directory
export async function POST(request: NextRequest) {
  const user = await checkAdminAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { path, content, type } = await request.json();

    if (type === "directory") {
      createDirectory(path);
    } else {
      writeFile(path, content || "");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Operation failed" },
      { status: 400 }
    );
  }
}

// PUT - Update file content
export async function PUT(request: NextRequest) {
  const user = await checkAdminAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { path, content } = await request.json();
    writeFile(path, content);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Operation failed" },
      { status: 400 }
    );
  }
}

// DELETE - Delete file or directory
export async function DELETE(request: NextRequest) {
  const user = await checkAdminAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 });
    }

    deleteItem(path);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Operation failed" },
      { status: 400 }
    );
  }
}
