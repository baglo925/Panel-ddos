"use client";

import { useEffect, useState, useCallback } from "react";

interface FileEditorProps {
  filePath: string;
  onClose: () => void;
}

export default function FileEditor({ filePath, onClose }: FileEditorProps) {
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadFile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/files?path=${encodeURIComponent(filePath)}&action=read`
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to load file");
        return;
      }

      setContent(data.content);
      setOriginalContent(data.content);
    } catch {
      setError("Failed to load file");
    } finally {
      setLoading(false);
    }
  }, [filePath]);

  useEffect(() => {
    loadFile();
  }, [loadFile]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/files", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: filePath, content }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to save file");
        return;
      }

      setOriginalContent(content);
      setSuccess("File saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to save file");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = content !== originalContent;
  const fileName = filePath.split("/").pop() || filePath;
  const fileExt = fileName.split(".").pop()?.toLowerCase();

  const getLanguage = () => {
    const langMap: Record<string, string> = {
      tsx: "TypeScript React",
      ts: "TypeScript",
      jsx: "JavaScript React",
      js: "JavaScript",
      json: "JSON",
      css: "CSS",
      html: "HTML",
      md: "Markdown",
      txt: "Text",
    };
    return langMap[fileExt || ""] || "Plain Text";
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-3 min-w-0">
          <svg
            className="w-5 h-5 text-blue-400 flex-shrink-0"
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
          <div className="min-w-0">
            <h3 className="font-medium text-white truncate flex items-center gap-2">
              {fileName}
              {hasChanges && (
                <span className="w-2 h-2 bg-yellow-500 rounded-full" title="Unsaved changes" />
              )}
            </h3>
            <p className="text-xs text-slate-400 truncate">{filePath}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded">
            {getLanguage()}
          </span>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                Saving...
              </>
            ) : (
              <>
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
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                Save
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
            title="Close"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="px-4 py-2 bg-green-500/10 border-b border-green-500/30 text-green-400 text-sm">
          {success}
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-400">
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
            Loading file...
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full p-4 bg-slate-950 text-slate-100 font-mono text-sm resize-none focus:outline-none"
            spellCheck={false}
            placeholder="File is empty. Start typing..."
          />
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-700 bg-slate-800/30 text-xs text-slate-500">
        <span>
          {content.split("\n").length} lines, {content.length} characters
        </span>
        <span>
          Press Ctrl+S or click Save to save changes
        </span>
      </div>
    </div>
  );
}
