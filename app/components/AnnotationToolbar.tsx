import React, { useState } from "react";
import {
  Highlighter,
  Underline,
  MessageSquare,
  Pen,
  Download,
  PaintBucket,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Trash2,
  Settings,
  ChevronDown,
} from "lucide-react";

export type AnnotationTool =
  | "highlight"
  | "underline"
  | "comment"
  | "signature"
  | null;

interface AnnotationToolbarProps {
  selectedTool: AnnotationTool;
  onSelectTool: (tool: AnnotationTool) => void;
  onExportPdf: () => void;
  onColorChange?: (color: string) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onClearAnnotations?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

const AnnotationToolbar: React.FC<AnnotationToolbarProps> = ({
  selectedTool,
  onSelectTool,
  onExportPdf,
  onColorChange,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onClearAnnotations,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}) => {
  const [currentColor, setCurrentColor] = useState("#FFEB3B");
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const tools = [
    {
      id: "highlight" as AnnotationTool,
      icon: Highlighter,
      label: "Highlight",
      tooltip: "Highlight text or regions",
    },
    {
      id: "underline" as AnnotationTool,
      icon: Underline,
      label: "Underline",
      tooltip: "Underline text",
    },
    {
      id: "comment" as AnnotationTool,
      icon: MessageSquare,
      label: "Comment",
      tooltip: "Add comments to document",
    },
    {
      id: "signature" as AnnotationTool,
      icon: Pen,
      label: "Sign",
      tooltip: "Add your signature",
    },
  ];

  const colors = [
    { value: "#FFEB3B", label: "Yellow" },
    { value: "#4CAF50", label: "Green" },
    { value: "#2196F3", label: "Blue" },
    { value: "#F44336", label: "Red" },
    { value: "#9C27B0", label: "Purple" },
    { value: "#FF9800", label: "Orange" },
    { value: "#00BCD4", label: "Cyan" },
    { value: "#607D8B", label: "Gray" },
  ];

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    if (onColorChange) {
      onColorChange(color);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-3 mb-4 border border-gray-100">
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-1">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() =>
                    onSelectTool(selectedTool === tool.id ? null : tool.id)
                  }
                  className={`p-2 rounded-md flex flex-col items-center transition-colors ${
                    selectedTool === tool.id
                      ? "bg-blue-100 text-blue-600 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  title={tool.tooltip}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs mt-1 font-medium">{tool.label}</span>
                </button>
              );
            })}

            <div className="h-8 w-px bg-gray-200 mx-1"></div>

            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-2 rounded-md transition-colors ${
                canUndo
                  ? "text-gray-600 hover:bg-gray-100"
                  : "text-gray-300 cursor-not-allowed"
              }`}
              title="Undo"
            >
              <Undo className="w-5 h-5" />
            </button>

            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-2 rounded-md transition-colors ${
                canRedo
                  ? "text-gray-600 hover:bg-gray-100"
                  : "text-gray-300 cursor-not-allowed"
              }`}
              title="Redo"
            >
              <Redo className="w-5 h-5" />
            </button>

            <div className="h-8 w-px bg-gray-200 mx-1"></div>

            <div className="relative">
              <button
                onClick={() => setShowMoreOptions(!showMoreOptions)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 flex items-center"
                title="More options"
              >
                <Settings className="w-5 h-5" />
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>

              {showMoreOptions && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 p-2 z-50 w-48">
                  <button
                    onClick={() => {
                      onZoomIn && onZoomIn();
                      setShowMoreOptions(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <ZoomIn className="w-4 h-4 mr-2" />
                    Zoom In
                  </button>
                  <button
                    onClick={() => {
                      onZoomOut && onZoomOut();
                      setShowMoreOptions(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <ZoomOut className="w-4 h-4 mr-2" />
                    Zoom Out
                  </button>
                  <button
                    onClick={() => {
                      onResetZoom && onResetZoom();
                      setShowMoreOptions(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset Zoom
                  </button>

                  <div className="my-1 h-px bg-gray-200"></div>

                  <button
                    onClick={() => {
                      onClearAnnotations && onClearAnnotations();
                      setShowMoreOptions(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All Annotations
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            id="export-button"
            onClick={onExportPdf}
            className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span className="font-medium">Export PDF</span>
          </button>
        </div>

        {selectedTool &&
          (selectedTool === "highlight" || selectedTool === "underline") && (
            <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-1">
                <PaintBucket className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">
                  Color:
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    className={`w-6 h-6 rounded-full border transition-all ${
                      currentColor === color.value
                        ? "border-gray-800 ring-2 ring-offset-1 ring-blue-300 scale-110"
                        : "border-gray-300 hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleColorChange(color.value)}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default AnnotationToolbar;
