import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import './App.css';
function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [numPagesToExtract, setNumPagesToExtract] = useState(7);
  const [extractedLink, setExtractedLink] = useState(null);
  const [remainingLink, setRemainingLink] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFile(file);
    }
  };

  const extractPages = async () => {
    const pdfBuffer = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    const extractedPdf = await PDFDocument.create();
    const remainingPdf = await PDFDocument.create();

    const totalPages = pdfDoc.getPageCount();
    const pagesToExtract = Math.min(numPagesToExtract, totalPages); // <-- Use numPagesToExtract here

    for (let i = 0; i < totalPages; i++) {
      const [copiedPage] = await (i < pagesToExtract ? extractedPdf : remainingPdf).copyPages(pdfDoc, [i]);
      (i < pagesToExtract ? extractedPdf : remainingPdf).addPage(copiedPage);
    }

    const extractedBytes = await extractedPdf.save();
    const remainingBytes = await remainingPdf.save();

    setExtractedLink(URL.createObjectURL(new Blob([extractedBytes], { type: 'application/pdf' })));
    setRemainingLink(URL.createObjectURL(new Blob([remainingBytes], { type: 'application/pdf' })));
  };

  return (
    <div className="extract-interace">
      <input type="file" onChange={handleFileChange} />
      {pdfFile && (
        <>
          <input
            type="number"
            value={numPagesToExtract}
            onChange={(e) => setNumPagesToExtract(e.target.value)}
            placeholder="Number of pages to extract"
          />
          <button onClick={extractPages}>Extract Pages</button>
        </>
      )}
      {extractedLink && (
        <div>
          <a href={extractedLink} download="extracted_pages.pdf">
            Download Extracted Pages
          </a>
          <a href={remainingLink} download="remaining_pages.pdf">
            Download Remaining Pages
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
