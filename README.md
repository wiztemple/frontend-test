# PDF Annotation & Signing Tool

A modern web application for annotating, commenting, and signing PDF documents directly in the browser.

![PDF Annotation Tool](https://via.placeholder.com/800x450/4A90E2/FFFFFF?text=PDF+Annotation+Tool)

## Features

- **Document Viewing**: Load and view PDF documents with smooth page navigation
- **Annotation Tools**: Highlight text, underline sections, add comments, and draw signatures
- **Color Options**: Customize annotation colors for better organization
- **Export**: Save annotated PDFs with all changes embedded
- **Undo/Redo**: Full history tracking for all annotation actions
- **Zoom Controls**: Easily zoom in, out, and reset view
- **Keyboard Shortcuts**: Improve workflow efficiency with keyboard shortcuts
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/wiztemple/frontend-test
   cd frontend-test
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Technology Stack

- **Next.js**: React framework for the application
- **React**: UI library for component-based architecture
- **PDF.js**: Mozilla's PDF rendering library
- **TypeScript**: Type-safe JavaScript for better development experience
- **Tailwind CSS**: Utility-first CSS framework for styling

## Usage Guide

### Basic Workflow

1. **Upload a Document**: Click the upload area or drag and drop a PDF file
2. **Select a Tool**: Choose from highlight, underline, comment, or signature tools
3. **Annotate the Document**: Click and drag to create annotations on the PDF
4. **Export**: Click "Export PDF" to save your annotated document

### Tools Overview

- **Highlight** 🟨: Click and drag to highlight areas of text or content
- **Underline** **\_**: Click and drag horizontally to underline text
- **Comment** 💬: Click on any location to add a text comment
- **Signature** ✍️: Click and drag to draw your signature on the document

### Keyboard Shortcuts

- **Undo**: Ctrl+Z (Cmd+Z on Mac)
- **Redo**: Ctrl+Y or Ctrl+Shift+Z (Cmd+Shift+Z on Mac)
- **Zoom In**: Ctrl++ (Cmd++ on Mac)
- **Zoom Out**: Ctrl+- (Cmd+- on Mac)
- **Reset Zoom**: Ctrl+0 (Cmd+0 on Mac)
- **Cancel Tool**: Esc

## Project Structure

```
/
├── app/                 # Next.js app directory
│   ├── components/      # React components
│   │   ├── AnnotationCanvas.tsx     # Canvas for annotations
│   │   ├── AnnotationToolbar.tsx    # Tool selection UI
│   │   ├── CommentDialog.tsx        # Comment popup dialog
│   │   ├── DocumentUploader.tsx     # File upload component
│   │   └── PDFViewer.tsx            # PDF rendering component
│   ├── lib/             # Utility functions
│   │   └── pdfExports.ts            # PDF export functionality
│   ├── types/           # TypeScript type definitions
│   │   └── annotation.ts            # Annotation type definitions
│   └── page.tsx         # Main application page
├── public/              # Static assets
└── package.json         # Project dependencies
```

## Customization

### Changing Colors

Edit the `colors` array in `components/AnnotationToolbar.tsx` to customize available annotation colors:

```typescript
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
```

### Adding New Tools

To add a new annotation tool, you'll need to:

1. Add the tool type to `types/annotation.ts`
2. Update the `AnnotationTool` type in `components/AnnotationToolbar.tsx`
3. Add the tool to the `tools` array in the toolbar component
4. Implement drawing and interaction logic in `components/AnnotationCanvas.tsx`

## Troubleshooting

### Common Issues

- **PDF doesn't load**: Make sure your PDF is not password-protected or corrupt
- **Export fails**: Check that you have permission to download files in your browser
- **Drawing issues**: Try refreshing the page or using a different browser

### Browser Compatibility

This application works best with:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Mozilla PDF.js for PDF rendering
- React-PDF for React integration
- All contributors to the project

---

## Future Improvements

- [ ] Add text annotation tool for typed text overlays
- [ ] Add shape tools (rectangle, circle, arrow)
- [ ] Implement annotation search and filtering
- [ ] Add PDF page rotation and reorganization
- [ ] Enable collaborative editing with real-time updates
- [ ] Add form filling capabilities
