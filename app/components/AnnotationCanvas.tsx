import React, { useRef, useState, useEffect, MouseEvent } from "react";
import { AnnotationTool } from "./AnnotationToolbar";
import { Annotation, Point } from "../types/annotation";
import CommentDialog from "./CommentDialog";

interface AnnotationCanvasProps {
  selectedTool: AnnotationTool;
  pageNumber: number;
  pageWidth: number;
  pageHeight: number;
  scale: number;
  onAddAnnotation: (annotation: Annotation) => void;
  onUpdateAnnotation?: (id: string, annotation: Annotation) => void;
  onDeleteAnnotation?: (id: string) => void;
  annotations: Annotation[];
  currentColor: string;
}

const AnnotationCanvas: React.FC<AnnotationCanvasProps> = ({
  selectedTool,
  pageNumber,
  pageWidth,
  pageHeight,
  scale,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  annotations,
  currentColor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentEndPoint, setCurrentEndPoint] = useState<Point | null>(null);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [commentPosition, setCommentPosition] = useState<Point | null>(null);
  const [dialogPosition, setDialogPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Annotation | null>(
    null
  );
  const [hoveredAnnotation, setHoveredAnnotation] = useState<string | null>(
    null
  );

  const pageAnnotations = annotations.filter(
    (ann) => ann.pageNumber === pageNumber
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = pageWidth * scale;
    canvas.height = pageHeight * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawAnnotations(ctx);

    if (isDrawing && startPoint && currentEndPoint) {
      drawPreview(ctx, startPoint, currentEndPoint);
    }

    if (selectedTool === "signature" && currentPoints.length > 0) {
      drawSignaturePreview(ctx);
    }
  }, [
    pageNumber,
    pageWidth,
    pageHeight,
    scale,
    annotations,
    isDrawing,
    startPoint,
    currentEndPoint,
    currentPoints,
    hoveredAnnotation,
    selectedTool,
  ]);

  const drawAnnotations = (ctx: CanvasRenderingContext2D) => {
    pageAnnotations.forEach((annotation) => {
      const isHovered = hoveredAnnotation === annotation.id;

      switch (annotation.type) {
        case "highlight":
          ctx.fillStyle = annotation.color || "rgba(255, 255, 0, 0.3)";
          ctx.fillRect(
            annotation.bounds.x1 * scale,
            annotation.bounds.y1 * scale,
            annotation.bounds.width * scale,
            annotation.bounds.height * scale
          );

          if (isHovered) {
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(
              annotation.bounds.x1 * scale,
              annotation.bounds.y1 * scale,
              annotation.bounds.width * scale,
              annotation.bounds.height * scale
            );
          }
          break;

        case "underline":
          ctx.strokeStyle = annotation.color || "blue";
          ctx.lineWidth = isHovered ? 3 : 2;
          ctx.beginPath();
          ctx.moveTo(
            annotation.bounds.x1 * scale,
            annotation.bounds.y1 * scale
          );
          ctx.lineTo(
            annotation.bounds.x2 * scale,
            annotation.bounds.y1 * scale
          );
          ctx.stroke();
          break;

        case "comment":
          const commentRadius = isHovered ? 12 : 10;

          if (isHovered) {
            ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
          }

          ctx.fillStyle = annotation.color || "#4CAF50";
          ctx.beginPath();
          ctx.arc(
            annotation.position.x * scale,
            annotation.position.y * scale,
            commentRadius,
            0,
            2 * Math.PI
          );
          ctx.fill();

          if (isHovered) {
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          ctx.fillStyle = "white";
          ctx.font = `${isHovered ? "bold " : ""}${commentRadius}px Arial`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            "i",
            annotation.position.x * scale,
            annotation.position.y * scale
          );
          break;

        case "signature":
          if (annotation.points.length < 2) break;

          ctx.strokeStyle = annotation.color || "black";
          ctx.lineWidth = isHovered ? 2.5 : 2;
          ctx.lineJoin = "round";
          ctx.lineCap = "round";

          ctx.beginPath();
          ctx.moveTo(
            annotation.points[0].x * scale,
            annotation.points[0].y * scale
          );

          for (let i = 1; i < annotation.points.length; i++) {
            ctx.lineTo(
              annotation.points[i].x * scale,
              annotation.points[i].y * scale
            );
          }

          ctx.stroke();

          if (isHovered) {
            let minX = Math.min(...annotation.points.map((p) => p.x));
            let minY = Math.min(...annotation.points.map((p) => p.y));
            let maxX = Math.max(...annotation.points.map((p) => p.x));
            let maxY = Math.max(...annotation.points.map((p) => p.y));

            const padding = 10 / scale;
            minX -= padding;
            minY -= padding;
            maxX += padding;
            maxY += padding;

            ctx.strokeStyle = "#0066cc";
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 3]);
            ctx.strokeRect(
              minX * scale,
              minY * scale,
              (maxX - minX) * scale,
              (maxY - minY) * scale
            );
            ctx.setLineDash([]);
          }
          break;
      }
    });
  };

  const drawPreview = (
    ctx: CanvasRenderingContext2D,
    start: Point,
    end: Point
  ) => {
    if (!selectedTool) return;

    switch (selectedTool) {
      case "highlight":
        ctx.fillStyle = `${currentColor}80`;
        ctx.fillRect(
          start.x * scale,
          start.y * scale,
          (end.x - start.x) * scale,
          (end.y - start.y) * scale
        );
        break;

      case "underline":
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(start.x * scale, start.y * scale);
        ctx.lineTo(end.x * scale, start.y * scale);
        ctx.stroke();
        break;
    }
  };

  const drawSignaturePreview = (ctx: CanvasRenderingContext2D) => {
    if (currentPoints.length < 2) return;

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(currentPoints[0].x * scale, currentPoints[0].y * scale);

    for (let i = 1; i < currentPoints.length; i++) {
      ctx.lineTo(currentPoints[i].x * scale, currentPoints[i].y * scale);
    }

    ctx.stroke();
  };

  const checkForAnnotationHover = (point: Point) => {
    let foundAnnotation = null;

    for (let i = pageAnnotations.length - 1; i >= 0; i--) {
      const annotation = pageAnnotations[i];

      switch (annotation.type) {
        case "highlight":
          if (
            point.x >= annotation.bounds.x1 &&
            point.x <= annotation.bounds.x2 &&
            point.y >= annotation.bounds.y1 &&
            point.y <= annotation.bounds.y2
          ) {
            foundAnnotation = annotation.id;
          }
          break;

        case "underline":
          if (
            point.x >= annotation.bounds.x1 &&
            point.x <= annotation.bounds.x2 &&
            Math.abs(point.y - annotation.bounds.y1) <= 8 / scale
          ) {
            foundAnnotation = annotation.id;
          }
          break;

        case "comment":
          const distance = Math.sqrt(
            (annotation.position.x - point.x) ** 2 +
              (annotation.position.y - point.y) ** 2
          );

          if (distance < 10 / scale) {
            foundAnnotation = annotation.id;
          }
          break;

        case "signature":
          for (let j = 1; j < annotation.points.length; j++) {
            const p1 = annotation.points[j - 1];
            const p2 = annotation.points[j];

            const lineLength = Math.sqrt(
              (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2
            );
            if (lineLength === 0) continue;

            const t = Math.max(
              0,
              Math.min(
                1,
                ((point.x - p1.x) * (p2.x - p1.x) +
                  (point.y - p1.y) * (p2.y - p1.y)) /
                  (lineLength * lineLength)
              )
            );

            const projX = p1.x + t * (p2.x - p1.x);
            const projY = p1.y + t * (p2.y - p1.y);

            const distance = Math.sqrt(
              (point.x - projX) ** 2 + (point.y - projY) ** 2
            );

            if (distance < 8 / scale) {
              foundAnnotation = annotation.id;
              break;
            }
          }
          break;
      }

      if (foundAnnotation) break;
    }

    setHoveredAnnotation(foundAnnotation);

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor = foundAnnotation
        ? "pointer"
        : selectedTool
        ? "crosshair"
        : "default";
    }

    return foundAnnotation;
  };

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!selectedTool) {
      handleAnnotationClick(e);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    switch (selectedTool) {
      case "highlight":
      case "underline":
        setIsDrawing(true);
        setStartPoint({ x, y });
        setCurrentEndPoint({ x, y });
        break;

      case "comment":
        setCommentPosition({ x, y });

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const dialogX = Math.min(Math.max(e.clientX, 100), viewportWidth - 300);
        const dialogY = Math.min(
          Math.max(e.clientY - 100, 50),
          viewportHeight - 300
        );

        setDialogPosition({ x: dialogX, y: dialogY });
        setIsCommentDialogOpen(true);
        break;

      case "signature":
        setIsDrawing(true);
        setCurrentPoints([{ x, y }]);
        break;
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    checkForAnnotationHover({ x, y });

    if (!isDrawing || !selectedTool) return;

    if (selectedTool === "signature") {
      setCurrentPoints((prev) => {
        const lastPoint = prev[prev.length - 1];
        const distance = Math.sqrt(
          (x - lastPoint.x) ** 2 + (y - lastPoint.y) ** 2
        );

        if (distance > 0.5 / scale) {
          return [...prev, { x, y }];
        }
        return prev;
      });
    } else {
      setCurrentEndPoint({ x, y });
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !selectedTool) return;

    switch (selectedTool) {
      case "signature":
        if (currentPoints.length > 5) {
          onAddAnnotation({
            id: Date.now().toString(),
            type: "signature",
            pageNumber,
            points: currentPoints,
            position: currentPoints[0],
            color: "black",
          });
        }
        break;

      case "highlight":
      case "underline":
        if (startPoint && currentEndPoint) {
          const minDistance = 5 / scale;
          const distanceX = Math.abs(currentEndPoint.x - startPoint.x);
          const distanceY = Math.abs(currentEndPoint.y - startPoint.y);

          if (
            selectedTool === "highlight" &&
            distanceX > minDistance &&
            distanceY > minDistance
          ) {
            onAddAnnotation({
              id: Date.now().toString(),
              type: "highlight",
              pageNumber,
              bounds: {
                x1: Math.min(startPoint.x, currentEndPoint.x),
                y1: Math.min(startPoint.y, currentEndPoint.y),
                x2: Math.max(startPoint.x, currentEndPoint.x),
                y2: Math.max(startPoint.y, currentEndPoint.y),
                width: Math.abs(currentEndPoint.x - startPoint.x),
                height: Math.abs(currentEndPoint.y - startPoint.y),
              },
              color: `${currentColor}80`,
            });
          } else if (selectedTool === "underline" && distanceX > minDistance) {
            onAddAnnotation({
              id: Date.now().toString(),
              type: "underline",
              pageNumber,
              bounds: {
                x1: Math.min(startPoint.x, currentEndPoint.x),
                y1: startPoint.y,
                x2: Math.max(startPoint.x, currentEndPoint.x),
                y2: startPoint.y,
              },
              color: currentColor,
            });
          }
        }
        break;
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentEndPoint(null);
    setCurrentPoints([]);
  };

  const handleAnnotationClick = (e: MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const clickedComment = pageAnnotations.find(
      (ann) =>
        ann.type === "comment" &&
        Math.sqrt((ann.position.x - x) ** 2 + (ann.position.y - y) ** 2) <
          10 / scale
    );

    if (clickedComment) {
      setSelectedComment(clickedComment);

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const dialogX = Math.min(Math.max(e.clientX, 100), viewportWidth - 300);
      const dialogY = Math.min(
        Math.max(e.clientY - 100, 50),
        viewportHeight - 300
      );

      setDialogPosition({ x: dialogX, y: dialogY });
      setIsCommentDialogOpen(true);
    }
  };

  const handleCommentSave = (content: string) => {
    if (commentPosition) {
      onAddAnnotation({
        id: Date.now().toString(),
        type: "comment",
        pageNumber,
        position: commentPosition,
        content,
        color: currentColor || "#4CAF50",
      });
    } else if (selectedComment && onUpdateAnnotation) {
      onUpdateAnnotation(selectedComment.id, {
        ...selectedComment,
        content,
      });
    }

    setIsCommentDialogOpen(false);
    setCommentPosition(null);
    setSelectedComment(null);
    setDialogPosition(null);
  };

  const handleCommentDelete = () => {
    if (selectedComment && onDeleteAnnotation) {
      onDeleteAnnotation(selectedComment.id);
      setSelectedComment(null);
      setIsCommentDialogOpen(false);
    }
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 z-10"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDrawing(false);
          setHoveredAnnotation(null);
        }}
      />

      {(isCommentDialogOpen || !!selectedComment) && dialogPosition && (
        <div
          className="fixed z-40"
          style={{
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: `${dialogPosition.x}px`,
              top: `${dialogPosition.y}px`,
              pointerEvents: "auto",
            }}
          >
            <CommentDialog
              isOpen={true}
              position={dialogPosition}
              onClose={() => {
                setIsCommentDialogOpen(false);
                setSelectedComment(null);
                setCommentPosition(null);
              }}
              onSave={handleCommentSave}
              onDelete={selectedComment ? handleCommentDelete : undefined}
              comment={
                selectedComment?.type === "comment"
                  ? selectedComment.content
                  : undefined
              }
              timestamp={new Date().toLocaleString()}
            />
          </div>
        </div>
      )}

      {selectedTool && (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm shadow-lg">
          {selectedTool === "highlight" && (
            <p>Click and drag to highlight text or regions</p>
          )}
          {selectedTool === "underline" && (
            <p>Click and drag horizontally to underline text</p>
          )}
          {selectedTool === "comment" && (
            <p>Click where you want to add a comment</p>
          )}
          {selectedTool === "signature" && (
            <p>Click and drag to draw your signature</p>
          )}
        </div>
      )}
    </>
  );
};

export default AnnotationCanvas;
