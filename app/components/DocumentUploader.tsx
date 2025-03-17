"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, AlertCircle, CheckCircle2, X } from "lucide-react";

interface DocumentUploaderProps {
  onFileUpload: (file: File) => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onFileUpload,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const errorMessage =
          rejectedFiles[0].errors[0]?.message ||
          "Invalid file format. Please upload a PDF file.";
        setError(errorMessage);
        return;
      }

      const file = acceptedFiles[0];
      if (file && file.type === "application/pdf") {
        setIsUploading(true);

        // Simulate processing time to show loading animation
        setTimeout(() => {
          onFileUpload(file);
          setIsUploading(false);
        }, 800);
      } else if (file) {
        setError("Please upload a PDF file.");
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "application/pdf": [".pdf"],
      },
      maxFiles: 1,
      maxSize: 50 * 1024 * 1024, // 50MB max size
    });

  const getBorderColor = () => {
    if (isDragReject || error) return "border-red-400";
    if (isDragActive) return "border-blue-400";
    return "border-gray-300";
  };

  return (
    <div className="flex flex-col items-center">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer w-full transition-all duration-200 ${getBorderColor()} ${
          isDragActive ? "bg-blue-50" : "bg-white hover:bg-gray-50"
        } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center space-y-4">
          {error ? (
            <div className="text-red-500 rounded-full p-3 bg-red-50">
              <AlertCircle size={40} />
            </div>
          ) : (
            <div className="text-blue-500 rounded-full p-3 bg-blue-50">
              <Upload size={40} />
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold mb-2 text-gray-800">
              {error ? "Upload Error" : "Upload Your Document"}
            </h2>

            {error ? (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            ) : (
              <p className="text-gray-500 mb-2 max-w-sm mx-auto">
                {isDragActive
                  ? "Drop your PDF here"
                  : "Drag and drop your PDF here, or click to browse your files"}
              </p>
            )}
          </div>

          {!error && (
            <button className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-300 focus:outline-none">
              {isUploading ? "Processing..." : "Choose File"}
            </button>
          )}

          {error && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setError(null);
              }}
              className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-lg shadow-sm hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center space-x-6 text-gray-500">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span className="text-sm">PDF format</span>
        </div>

        <div className="w-px h-5 bg-gray-300"></div>

        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm">Up to 50MB</span>
        </div>

        <div className="w-px h-5 bg-gray-300"></div>

        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm">Secure upload</span>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4 max-w-xl text-center">
        <h3 className="font-medium text-blue-700 mb-1">
          Why use our PDF Annotation Tool?
        </h3>
        <p className="text-sm text-blue-600">
          Annotate documents with highlighting, comments, and signatures without
          installing any software. Your documents are processed securely and
          never stored on our servers.
        </p>
      </div>
    </div>
  );
};

export default DocumentUploader;
