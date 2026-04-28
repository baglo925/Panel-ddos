"use client";

import { useEffect, useState, useCallback } from "react";

interface FileItem {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  modified?: string;
}

interface FileExplorerProps {
  currentPath: string;
  onPathChange: (path: string) => void;
  onFileSelect: (path: string) => void;
}

export default function FileExplorer({
  currentPath,
  onPathChange,
  onFileSelect,
}: FileExplorerProps) {
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNewDialog, setShowNewDialog] = useState<"file" | "directory" | null>(null);
  const [newItemName, setNewItemName] = useState("");

  const loadDirectory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(currentPath)}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to load directory");
        return;
      }

      setItems(data.items);
    } catch {
      setError("Failed to load directory");
    } finally {
      setLoading(false);
    }
  }, [currentPath]);

  useEffect(() => {
    loadDirectory();
  }, [loadDirectory]);

  const handleItemClick = (item: FileItem) => {
    if (item.type === "directory") {
      onPathChange(item.path);
    } else {
      onFileSelect(item.path);
    }
  };

  const handleGoUp = () => {
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    onPathChange(parts.join("/"));
  };

  const handleCreate = async () => {
    if (!newItemName.trim()) return;

    const path = currentPath ? `${currentPath}/${newItemName}` : newItemName;

    try {
      const response = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path,
          type: showNewDialog,
          content: showNewDialog === "file" ? "" : undefined,
        }),
      });

      if (response.ok) {
        setShowNewDialog(null);
        setNewItemName("");
        loadDirectory();
      }
    } catch {
      setError("Failed to create item");
    }
  };

  const handleDelete = async (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadDirectory();
      }
    } catch {
      setError("Failed to delete item");
    }
  };

  const formatSize = (bytes?: number) => {
    if (bytes === undefined) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (item: FileItem) => {
    if (item.type === "directory") {
      return (
        <svg
          className="w-5 h-5 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
        </svg>
      );
    }

    const ext = item.name.split(".").pop()?.toLowerCase();
    const codeExts = ["tsx", "ts", "js", "jsx", "json", "css", "html"];
    const isCode = codeExts.includes(ext || "");

    if (isCode) {
      return (
        <svg
          className="w-5 h-5 text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      );
    }

    return (
      <svg
        className="w-5 h-5 text-slate-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-700 flex items-center gap-2">
        <button
          onClick={handleGoUp}
          disabled={!currentPath}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Go up"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16l-4-4m0 0l4-4m-4 4h18"
            />
          </svg>
        </button>
        <button
          onClick={loadDirectory}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          title="Refresh"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
        <div className="flex-1" />
        <button
          onClick={() => setShowNewDialog("file")}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New File
        </button>
        <button
          onClick={() => setShowNewDialog("directory")}
          className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Folder
        </button>
      </div>

      {/* New Item Dialog */}
      {showNewDialog && (
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={`Enter ${showNewDialog} name`}
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") {
                  setShowNewDialog(null);
                  setNewItemName("");
                }
              }}
            />
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowNewDialog(null);
                setNewItemName("");
              }}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* File List */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-slate-400">
            <svg className="animate-spin h-6 w-6 mr-2" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </div>
        ) : error ? (
          <div className="text-red-400 text-center py-8">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-slate-400 text-center py-8">
            This directory is empty
          </div>
        ) : (
          <div className="space-y-1">
            {items.map((item) => (
              <div
                key={item.path}
                onClick={() => handleItemClick(item)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-lg cursor-pointer group transition-colors"
              >
                {getFileIcon(item)}
                <span className="flex-1 truncate">{item.name}</span>
                <span className="text-sm text-slate-500">
                  {formatSize(item.size)}
                </span>
                <button
                  onClick={(e) => handleDelete(item.path, e)}
                  className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-600/20 hover:text-red-400 rounded transition-all"
                  title="Delete"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
