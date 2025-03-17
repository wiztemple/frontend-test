import React, { useState, useEffect, useRef } from "react";
import { X, Type, Clock, Check, Trash2, Edit2 } from "lucide-react";

interface CommentDialogProps {
  isOpen: boolean;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onSave?: (content: string) => void;
  onDelete?: () => void;
  onEdit?: () => void;
  comment?: string;
  author?: string;
  timestamp?: string;
}

export const CommentDialog: React.FC<CommentDialogProps> = ({
  isOpen,
  position,
  onClose,
  onSave,
  onDelete,
  onEdit,
  comment,
  author = "You",
  timestamp = new Date().toLocaleString(),
}) => {
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(!comment);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Positioning state that accounts for screen boundaries
  const [adjustedPosition, setAdjustedPosition] = useState({ x: 0, y: 0 });

  // Calculate position only once when dialog opens or position changes
  useEffect(() => {
    if (isOpen && position && dialogRef.current) {
      const calcPosition = () => {
        const dialogWidth = 280; // Fixed width for calculation
        const dialogHeight = 240; // Approximate height

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Start with proposed position
        let x = position.x;
        let y = position.y;

        // Check right edge
        if (x + dialogWidth > viewportWidth - 20) {
          x = viewportWidth - dialogWidth - 20;
        }

        // Check bottom edge
        if (y + dialogHeight > viewportHeight - 20) {
          y = viewportHeight - dialogHeight - 20;
        }

        // Ensure we're not off the left or top edge
        x = Math.max(20, x);
        y = Math.max(20, y);

        setAdjustedPosition({ x, y });
      };

      // Calculate position
      calcPosition();

      // Recalculate if window resizes
      window.addEventListener("resize", calcPosition);
      return () => window.removeEventListener("resize", calcPosition);
    }
  }, [isOpen, position]);

  useEffect(() => {
    if (isOpen) {
      if (comment) {
        setContent(comment);
        setIsEditing(false);
      } else {
        setContent("");
        setIsEditing(true);

        // Focus the input field with a slight delay
        const timer = setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);

        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, comment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && onSave) {
      onSave(content);
      setIsEditing(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
    if (onEdit) onEdit();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      className="bg-white rounded-lg shadow-xl w-64 md:w-80 border border-gray-200 fixed"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
        zIndex: 1000,
        maxWidth: "calc(100vw - 40px)", // Prevent overflow
        maxHeight: "calc(100vh - 40px)", // Prevent overflow
      }}
    >
      <div
        className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg cursor-move"
        onMouseDown={(e) => {
          // Simple drag functionality
          if (!dialogRef.current) return;

          const startX = e.clientX;
          const startY = e.clientY;
          const startLeft = adjustedPosition.x;
          const startTop = adjustedPosition.y;

          const onMouseMove = (moveEvent: MouseEvent) => {
            const newX = startLeft + moveEvent.clientX - startX;
            const newY = startTop + moveEvent.clientY - startY;

            // Apply boundary checks
            const dialogWidth = dialogRef.current?.offsetWidth || 280;
            const dialogHeight = dialogRef.current?.offsetHeight || 240;

            const maxX = window.innerWidth - dialogWidth - 20;
            const maxY = window.innerHeight - dialogHeight - 20;

            setAdjustedPosition({
              x: Math.max(20, Math.min(newX, maxX)),
              y: Math.max(20, Math.min(newY, maxY)),
            });
          };

          const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
          };

          document.addEventListener("mousemove", onMouseMove);
          document.addEventListener("mouseup", onMouseUp);
        }}
      >
        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
          <Type size={16} className="mr-2" />
          {comment ? "Comment" : "Add Comment"}
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      {!isEditing && comment ? (
        <div className="p-4 overflow-auto max-h-64">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                {author.charAt(0).toUpperCase()}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">
                {author}
              </span>
            </div>
            <div className="flex items-center text-gray-400 text-xs">
              <Clock size={12} className="mr-1" />
              <span>{timestamp}</span>
            </div>
          </div>

          <div className="text-sm text-gray-600 mb-3 whitespace-pre-wrap break-words">
            {content}
          </div>

          <div className="flex justify-end space-x-2 border-t border-gray-100 pt-3">
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1.5 rounded text-red-500 hover:bg-red-50 transition-colors flex items-center text-xs"
              >
                <Trash2 size={14} className="mr-1" />
                Delete
              </button>
            )}
            <button
              onClick={handleEdit}
              className="p-1.5 rounded text-blue-600 hover:bg-blue-50 transition-colors flex items-center text-xs"
            >
              <Edit2 size={14} className="mr-1" />
              Edit
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-4">
          <textarea
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm text-gray-600 resize-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-shadow"
            placeholder="Type your comment here..."
            rows={4}
          />
          <div className="mt-3 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                if (comment) {
                  setContent(comment);
                  setIsEditing(false);
                } else {
                  onClose();
                }
              }}
              className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!content.trim()}
            >
              <Check size={14} className="mr-1" />
              {comment ? "Update" : "Save"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CommentDialog;
