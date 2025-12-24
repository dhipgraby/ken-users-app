"use client";

// This must run before any component tries to use react-pdf
// Initialize at module load time, not in a component
if (typeof window !== "undefined") {
  // Dynamically import and set worker to avoid SSR issues
  import("react-pdf").then(({ pdfjs }) => {
    const pdfjsVersion = pdfjs.version;
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`;
  });
}

