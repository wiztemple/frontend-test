# Testing Guide: Document Signer & Annotation Tool

This guide will help you test the Document Signer & Annotation Tool application.

## Setup Instructions

1. Clone or download the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser to http://localhost:3000

## Testing Features

### Document Upload
1. **Drag and Drop:**
   - Drag a PDF file from your file system onto the upload area
   - Verify that the PDF is loaded and displayed

2. **File Selection:**
   - Click the "Select PDF" button
   - Choose a PDF file from your system
   - Verify that the PDF is loaded and displayed

### PDF Navigation
1. **Paging:**
   - Use the left/right arrows to navigate through pages
   - Verify the page number indicator updates correctly

2. **Zooming:**
   - Use the + and - buttons to zoom in and out
   - Verify the zoom percentage updates
   - Verify the document scales appropriately

### Annotation Tools
Test each annotation tool individually:

1. **Highlight Tool:**
   - Select the "Highlight" tool from the sidebar
   - Choose a color from the color picker
   - Click and drag to select text in the document
   - Verify the text is highlighted with the selected color

2. **Underline Tool:**
   - Select the "Underline" tool from the sidebar
   - Choose a color from the color picker
   - Click and drag to select text in the document
   - Verify the text is underlined with the selected color

3. **Comment Tool:**
   - Select the "Comment" tool from the sidebar
   - Click anywhere on the document
   - Enter a comment in the popup form
   - Click "Save"
   - Verify the comment appears at the clicked location

4. **Signature Tool:**
   - Select the "Signature" tool from the sidebar
   - Click anywhere on the document
   - Draw a signature in the signature pad
   - Click "Save"
   - Verify the signature appears at the clicked location

### Document Export
1. **Export with Annotations:**
   - After adding various annotations, click the "Export PDF" button
   - Verify the PDF is downloaded with a filename like "[original]_annotated.pdf"
   - Open the downloaded PDF and verify all annotations are visible

## Troubleshooting
- If PDF loading fails, ensure you're using a valid PDF file
- If annotations don't appear correctly, try refreshing the page
- If export fails, check the browser console for error messages

## Known Limitations
- Text selection for highlighting/underlining works best on documents with clear text layers
- Signature positioning might need adjustment based on document scale
- Very large PDF files might cause performance issues

## Next Steps
Future enhancements could include:
- Improved annotation positioning and scaling
- Additional annotation types (shapes, arrows, etc.)
- Annotation management panel
- Collaborative annotation features