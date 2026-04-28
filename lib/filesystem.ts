import fs from "fs";
import path from "path";

export interface FileItem {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  modified?: string;
}

const PROJECT_ROOT = process.cwd();

// Directories that should not be accessible
const BLOCKED_PATHS = [
  "node_modules",
  ".git",
  ".next",
  ".env",
  ".env.local",
  ".env.production",
];

function isPathBlocked(relativePath: string): boolean {
  const parts = relativePath.split(path.sep);
  return parts.some((part) => BLOCKED_PATHS.includes(part));
}

function isPathSafe(targetPath: string): boolean {
  const resolvedPath = path.resolve(PROJECT_ROOT, targetPath);
  return resolvedPath.startsWith(PROJECT_ROOT);
}

export function listDirectory(relativePath: string = ""): FileItem[] {
  const targetPath = path.join(PROJECT_ROOT, relativePath);

  if (!isPathSafe(relativePath) || isPathBlocked(relativePath)) {
    throw new Error("Access denied");
  }

  try {
    const items = fs.readdirSync(targetPath);
    return items
      .filter((item) => !BLOCKED_PATHS.includes(item))
      .map((item) => {
        const itemPath = path.join(targetPath, item);
        const stats = fs.statSync(itemPath);
        return {
          name: item,
          path: path.join(relativePath, item),
          type: stats.isDirectory() ? "directory" : "file",
          size: stats.isFile() ? stats.size : undefined,
          modified: stats.mtime.toISOString(),
        };
      })
      .sort((a, b) => {
        // Directories first, then files
        if (a.type !== b.type) {
          return a.type === "directory" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
  } catch {
    throw new Error("Failed to read directory");
  }
}

export function readFile(relativePath: string): string {
  if (!isPathSafe(relativePath) || isPathBlocked(relativePath)) {
    throw new Error("Access denied");
  }

  const targetPath = path.join(PROJECT_ROOT, relativePath);

  try {
    return fs.readFileSync(targetPath, "utf-8");
  } catch {
    throw new Error("Failed to read file");
  }
}

export function writeFile(relativePath: string, content: string): void {
  if (!isPathSafe(relativePath) || isPathBlocked(relativePath)) {
    throw new Error("Access denied");
  }

  const targetPath = path.join(PROJECT_ROOT, relativePath);

  try {
    // Create directory if it doesn't exist
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(targetPath, content, "utf-8");
  } catch {
    throw new Error("Failed to write file");
  }
}

export function createDirectory(relativePath: string): void {
  if (!isPathSafe(relativePath) || isPathBlocked(relativePath)) {
    throw new Error("Access denied");
  }

  const targetPath = path.join(PROJECT_ROOT, relativePath);

  try {
    fs.mkdirSync(targetPath, { recursive: true });
  } catch {
    throw new Error("Failed to create directory");
  }
}

export function deleteItem(relativePath: string): void {
  if (!isPathSafe(relativePath) || isPathBlocked(relativePath)) {
    throw new Error("Access denied");
  }

  const targetPath = path.join(PROJECT_ROOT, relativePath);

  try {
    const stats = fs.statSync(targetPath);
    if (stats.isDirectory()) {
      fs.rmSync(targetPath, { recursive: true });
    } else {
      fs.unlinkSync(targetPath);
    }
  } catch {
    throw new Error("Failed to delete item");
  }
}
