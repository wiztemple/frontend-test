"use client";

import { useState, useRef, useEffect } from "react";
import AnnotationToolbar, {
  AnnotationTool,
} from "./components/AnnotationToolbar";
import { downloadPdf, exportAnnotatedPdf } from "./lib/pdfExports";
import DocumentUploader from "./components/DocumentUploader";
import PDFViewer from "./components/PDFViewer";
import { Annotation } from "./types/annotation";
import {
  FileText,
  HelpCircle,
  Info,
  X,
  ChevronLeft,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ElementType;
}

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [selectedTool, setSelectedTool] = useState<AnnotationTool>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>("#FFEB3B");
  const [scale, setScale] = useState<number>(1.2);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [undoStack, setUndoStack] = useState<Annotation[][]>([]);
  const [redoStack, setRedoStack] = useState<Annotation[][]>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const viewerRef = useRef<{ getAnnotations: () => Annotation[] } | null>(null);

  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem("pdf-annotator-visited");
    if (!hasVisitedBefore && !pdfFile) {
      setShowTutorial(true);
      localStorage.setItem("pdf-annotator-visited", "true");
    }
  }, []);

  const handleFileUpload = (file: File) => {
    setPdfFile(file);
    setSelectedTool(null);
    setAnnotations([]);
    setUndoStack([]);
    setRedoStack([]);
  };

  const handleAddAnnotation = (annotation: Annotation) => {
    setUndoStack((prev) => [...prev, [...annotations]]);
    setRedoStack([]);

    setAnnotations((prev) => [...prev, annotation]);
  };

  const handleUpdateAnnotation = (
    id: string,
    updatedAnnotation: Annotation
  ) => {
    setUndoStack((prev) => [...prev, [...annotations]]);
    setRedoStack([]);

    setAnnotations((prev) =>
      prev.map((ann) => (ann.id === id ? updatedAnnotation : ann))
    );
  };

  const handleDeleteAnnotation = (id: string) => {
    setUndoStack((prev) => [...prev, [...annotations]]);
    setRedoStack([]);

    setAnnotations((prev) => prev.filter((ann) => ann.id !== id));
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      const newUndoStack = undoStack.slice(0, -1);

      setRedoStack((prev) => [...prev, [...annotations]]);

      setAnnotations(previousState);
      setUndoStack(newUndoStack);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      const newRedoStack = redoStack.slice(0, -1);

      setUndoStack((prev) => [...prev, [...annotations]]);

      setAnnotations(nextState);
      setRedoStack(newRedoStack);
    }
  };

  const handleClearAnnotations = () => {
    if (annotations.length === 0) return;

    setUndoStack((prev) => [...prev, [...annotations]]);
    setRedoStack([]);

    setAnnotations([]);
  };

  const handleExportPdf = async () => {
    if (!pdfFile || !viewerRef.current) return;

    try {
      setIsExporting(true);
      setExportProgress(0);

      const exportButton = document.getElementById("export-button");
      if (exportButton) {
        exportButton.textContent = "Exporting...";
        exportButton.setAttribute("disabled", "true");
      }

      const annotations = viewerRef.current.getAnnotations();
      const pdfBytes = await exportAnnotatedPdf(pdfFile, annotations);
      downloadPdf(pdfBytes, `annotated-${pdfFile.name}`);

      if (exportButton) {
        exportButton.textContent = "Export PDF";
        exportButton.removeAttribute("disabled");
      }

      setIsExporting(false);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please check console for details.");
      setIsExporting(false);

      const exportButton = document.getElementById("export-button");
      if (exportButton) {
        exportButton.textContent = "Export PDF";
        exportButton.removeAttribute("disabled");
      }
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.6));
  };

  const handleResetZoom = () => {
    setScale(1.2);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!pdfFile) return;

      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Redo: Ctrl+Shift+Z or Cmd+Shift+Z or Ctrl+Y
      if (
        ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) ||
        ((e.ctrlKey || e.metaKey) && e.key === "y")
      ) {
        e.preventDefault();
        handleRedo();
      }

      // Zoom In: Ctrl++ or Cmd++
      if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        handleZoomIn();
      }

      // Zoom Out: Ctrl+- or Cmd+-
      if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        handleZoomOut();
      }

      // Reset Zoom: Ctrl+0 or Cmd+0
      if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        handleResetZoom();
      }

      // Escape key to deselect tool
      if (e.key === "Escape" && selectedTool) {
        e.preventDefault();
        setSelectedTool(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pdfFile, selectedTool, undoStack.length, redoStack.length]);

  const tutorialSteps: TutorialStep[] = [
    {
      title: "Upload Your Document",
      description:
        "Start by uploading a PDF document that you want to annotate or sign.",
      icon: FileText,
    },
    {
      title: "Choose Annotation Tools",
      description:
        "Use the toolbar to select different annotation types: highlight, underline, comments, or add your signature.",
      icon: Settings,
    },
    {
      title: "Export When Finished",
      description:
        "When you're done, export your annotated PDF to save all changes in a new document.",
      icon: Info,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center justify-center">
            <FileText className="text-blue-600 mr-3 h-8 w-8" />
            PDF Annotation & Signing Tool
          </h1>
          <p className="mt-2 text-gray-600">
            Upload, annotate, and sign your documents effortlessly.
          </p>
          {!pdfFile && (
            <button
              onClick={() => setShowTutorial(true)}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center mx-auto"
            >
              <HelpCircle className="w-4 h-4 mr-1" />
              How it works
            </button>
          )}
        </header>

        {!pdfFile ? (
          <div className="max-w-xl mx-auto">
            <DocumentUploader onFileUpload={handleFileUpload} />
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setPdfFile(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Upload
              </button>

              <div className="text-sm text-gray-500 flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                <span className="font-medium">{pdfFile.name}</span>
                <span className="ml-2 text-gray-400">
                  ({Math.round(pdfFile.size / 1024)} KB)
                </span>
              </div>
            </div>

            <AnnotationToolbar
              selectedTool={selectedTool}
              onSelectTool={setSelectedTool}
              onExportPdf={handleExportPdf}
              onColorChange={setSelectedColor}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onResetZoom={handleResetZoom}
              onClearAnnotations={handleClearAnnotations}
              canUndo={undoStack.length > 0}
              canRedo={redoStack.length > 0}
              onUndo={handleUndo}
              onRedo={handleRedo}
            />

            <div className="flex justify-center relative">
              <PDFViewer
                pdfFile={pdfFile}
                selectedTool={selectedTool}
                ref={viewerRef}
                onAnnotationAdded={handleAddAnnotation}
                onAnnotationUpdated={handleUpdateAnnotation}
                onAnnotationDeleted={handleDeleteAnnotation}
                selectedColor={selectedColor}
                scale={scale}
              />

              {isExporting && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg z-50">
                  <div className="bg-white p-6 rounded-lg shadow-xl w-80 text-center">
                    <h3 className="text-lg font-bold mb-3">Exporting PDF</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${exportProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Please wait while we generate your annotated document...
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                      {exportProgress}% complete
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  How to Use the PDF Annotator
                </h2>
                <button
                  onClick={() => setShowTutorial(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6 my-4">
                {tutorialSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    className="flex"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="mr-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <step.icon className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                onClick={() => setShowTutorial(false)}
                className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition mt-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Got it
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Helper (Optional) */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="bg-white p-2 rounded-full shadow-lg text-gray-500 hover:text-blue-600 transition-colors"
          title="Keyboard Shortcuts"
        >
          <Settings className="w-5 h-5" />
        </button>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              className="absolute bottom-12 left-0 bg-white rounded-lg shadow-xl p-4 w-64 text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="font-medium text-gray-800 mb-2">
                Keyboard Shortcuts
              </h3>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-600">Undo</span>
                  <span className="font-mono text-gray-500">Ctrl+Z</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Redo</span>
                  <span className="font-mono text-gray-500">Ctrl+Y</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Zoom In</span>
                  <span className="font-mono text-gray-500">Ctrl+Plus</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Zoom Out</span>
                  <span className="font-mono text-gray-500">Ctrl+Minus</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reset Zoom</span>
                  <span className="font-mono text-gray-500">Ctrl+0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cancel Tool</span>
                  <span className="font-mono text-gray-500">Esc</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
