import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import AnnotationCanvas from "./AnnotationCanvas";
import { AnnotationTool } from "./AnnotationToolbar";
import { Annotation } from "../types/annotation";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";

// Set the worker source for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfFile: File | null;
  selectedTool: AnnotationTool;
  selectedColor?: string;
  scale?: number;
  onAnnotationAdded?: (annotation: Annotation) => void;
  onAnnotationUpdated?: (id: string, annotation: Annotation) => void;
  onAnnotationDeleted?: (id: string) => void;
}

// Forward ref to expose methods to parent components
const PDFViewer = forwardRef<
  { getAnnotations: () => Annotation[] },
  PDFViewerProps
>(
  (
    {
      pdfFile,
      selectedTool,
      selectedColor = "#FFEB3B",
      scale = 1.2,
      onAnnotationAdded,
      onAnnotationUpdated,
      onAnnotationDeleted,
    },
    ref
  ) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [pageSize, setPageSize] = useState<{ width: number; height: number }>(
      { width: 0, height: 0 }
    );
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [, setDocumentTitle] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [thumbnails, setThumbnails] = useState<Array<string | null>>([]);
    const [showThumbnails, setShowThumbnails] = useState<boolean>(true);
    const pageRef = useRef<HTMLDivElement>(null);
    const [, setScrollPosition] = useState(0);

    useImperativeHandle(ref, () => ({
      getAnnotations: () => annotations,
    }));

    useEffect(() => {
      if (pdfFile) {
        setIsLoading(true);

        if (pdfUrl) {
          URL.revokeObjectURL(pdfUrl);
        }

        const newUrl = URL.createObjectURL(pdfFile);
        setPdfUrl(newUrl);
        setPageNumber(1);
        setDocumentTitle(pdfFile.name);

        setAnnotations([]);
      }

      return () => {
        if (pdfUrl) {
          URL.revokeObjectURL(pdfUrl);
        }
      };
    }, [pdfFile]);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setAnnotations([]);
      setIsLoading(false);

      setThumbnails(Array(numPages).fill(null));
    };

    useEffect(() => {
      if (!pdfUrl || !numPages) return;

      const generateThumbnails = async () => {
        for (let i = 0; i < Math.min(numPages, 5); i++) {
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (context) {
            try {
              const loadingTask = pdfjs.getDocument(pdfUrl);
              const pdf = await loadingTask.promise;
              const page = await pdf.getPage(i + 1);

              const viewport = page.getViewport({ scale: 0.2 });
              canvas.width = viewport.width;
              canvas.height = viewport.height;

              await page.render({
                canvasContext: context,
                viewport: viewport,
              }).promise;

              const thumbnail = canvas.toDataURL("image/png");

              setThumbnails((prev) => {
                const newThumbnails = [...prev];
                newThumbnails[i] = thumbnail;
                return newThumbnails;
              });
            } catch (error) {
              console.error("Error generating thumbnail", error);
            }
          }
        }
      };

      generateThumbnails();
    }, [pdfUrl, numPages]);

    interface Page {
        getViewport: ({ scale }: { scale: number }) => { width: number; height: number };
    }

    const onPageLoadSuccess = (page: Page) => {
        const { width, height } = page.getViewport({ scale: 1 });
        setPageSize({ width, height });
    };

    const handleAddAnnotation = (annotation: Annotation) => {
      setAnnotations((prev) => [...prev, annotation]);
      if (onAnnotationAdded) {
        onAnnotationAdded(annotation);
      }
    };

    const handleUpdateAnnotation = (
      id: string,
      updatedAnnotation: Annotation
    ) => {
      setAnnotations((prev) =>
        prev.map((ann) => (ann.id === id ? updatedAnnotation : ann))
      );
      if (onAnnotationUpdated) {
        onAnnotationUpdated(id, updatedAnnotation);
      }
    };

    const handleDeleteAnnotation = (id: string) => {
      setAnnotations((prev) => prev.filter((ann) => ann.id !== id));
      if (onAnnotationDeleted) {
        onAnnotationDeleted(id);
      }
    };

    const goToPage = (page: number) => {
      if (page >= 1 && page <= (numPages || 1)) {
        setPageNumber(page);
      }
    };

    const goToPrevPage = () => {
      setPageNumber((prev) => Math.max(prev - 1, 1));
    };

    const goToNextPage = () => {
      setPageNumber((prev) => Math.min(prev + 1, numPages || 1));
    };

    // Track scroll position for thumbnails sync
    useEffect(() => {
      const handleScroll = () => {
        if (pageRef.current) {
          setScrollPosition(window.scrollY);
        }
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (!pdfUrl) {
      return null;
    }

    return (
      <div className="flex flex-col lg:flex-row gap-4 w-full">
        {showThumbnails && numPages && (
          <div className="hidden lg:block w-64 bg-white rounded-lg shadow-sm border border-gray-100 p-3 h-[calc(100vh-250px)] overflow-auto">
            <div className="flex justify-between items-center mb-3 pb-2 border-b">
              <h3 className="text-sm font-medium text-gray-700">Pages</h3>
              <span className="text-xs text-gray-500">{numPages} pages</span>
            </div>
            <div className="space-y-3">
              {Array.from(new Array(numPages)).map((_, index) => (
                <div
                  key={index}
                  onClick={() => goToPage(index + 1)}
                  className={`cursor-pointer rounded-md overflow-hidden border transition-all ${
                    pageNumber === index + 1
                      ? "border-blue-400 shadow-sm ring-2 ring-blue-100"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {thumbnails[index] ? (
                    <div className="relative">
                      <img
                        src={thumbnails[index] || ""}
                        alt={`Page ${index + 1}`}
                        className="w-full h-auto"
                      />
                      <div className="absolute bottom-0 right-0 bg-gray-800 bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded-tl-md">
                        {index + 1}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-100 aspect-[3/4] flex items-center justify-center">
                      <div className="text-gray-400 text-xs">Loading...</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1">
          <div className="bg-white p-3 rounded-lg shadow-sm mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                className="p-1.5 rounded text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent"
                title="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center">
                <input
                  type="number"
                  value={pageNumber}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) goToPage(value);
                  }}
                  min="1"
                  max={numPages || 1}
                  className="w-12 p-1 text-center border border-gray-300 rounded-md text-sm"
                />
                <span className="mx-1 text-gray-500 text-sm">of</span>
                <span className="text-gray-700 text-sm font-medium">
                  {numPages}
                </span>
              </div>

              <button
                onClick={goToNextPage}
                disabled={pageNumber >= (numPages || 1)}
                className="p-1.5 rounded text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent"
                title="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="hidden md:flex items-center ml-2">
                <button
                  onClick={() => setShowThumbnails((prev) => !prev)}
                  className={`p-1.5 rounded text-gray-600 hover:bg-gray-100 ${
                    showThumbnails ? "bg-gray-100" : ""
                  }`}
                  title="Toggle thumbnails"
                >
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 shadow-md">
            <div
              className="relative bg-white shadow-inner mx-auto"
              ref={pageRef}
            >
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center p-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                }
                error={
                  <div className="text-center py-10 text-red-600">
                    <div className="text-xl mb-2">⚠️</div>
                    <div className="font-medium">
                      Failed to load PDF document
                    </div>
                    <p className="text-sm text-red-500 mt-2">
                      The document may be corrupt or unsupported.
                    </p>
                  </div>
                }
                className="mx-auto"
              >
                {isLoading ? (
                  <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <>
                    <Page
                      pageNumber={pageNumber}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      scale={scale}
                      onLoadSuccess={onPageLoadSuccess}
                      className="pdf-page shadow-md"
                      loading={
                        <div className="flex justify-center items-center h-96">
                          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      }
                    />

                    {pageSize.width > 0 && (
                      <AnnotationCanvas
                        selectedTool={selectedTool}
                        pageNumber={pageNumber}
                        pageWidth={pageSize.width}
                        pageHeight={pageSize.height}
                        scale={scale}
                        onAddAnnotation={handleAddAnnotation}
                        onUpdateAnnotation={handleUpdateAnnotation}
                        onDeleteAnnotation={handleDeleteAnnotation}
                        annotations={annotations.filter(
                          (a) => a.pageNumber === pageNumber
                        )}
                        currentColor={selectedColor}
                      />
                    )}
                  </>
                )}
              </Document>
            </div>
          </div>

          {/* Mobile page navigation (shown only on small screens) */}
          <div className="lg:hidden flex items-center justify-center mt-4 space-x-3">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm disabled:bg-gray-100 disabled:text-gray-400 flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            <span className="text-gray-700 bg-white px-3 py-2 rounded-lg shadow-sm border">
              {pageNumber} / {numPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= (numPages || 1)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm disabled:bg-gray-100 disabled:text-gray-400 flex items-center"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    );
  }
);

PDFViewer.displayName = "PDFViewer";

export default PDFViewer;
