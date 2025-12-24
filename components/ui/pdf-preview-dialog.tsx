"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, RotateCcw } from "lucide-react";
import Loading from "@/components/loading";

const PDFDocument = dynamic(() => import("react-pdf").then((mod) => mod.Document), {
  ssr: false,
  loading: () => <Loading size={32} text="Preparing document" />
});

const PDFPage = dynamic(() => import("react-pdf").then((mod) => mod.Page), {
  ssr: false,
  loading: () => <Loading size={32} text="Loading page" />
});

export default function PdfPreviewDialog({
  open,
  onClose,
  src,
  title
}: {
  open: boolean;
  onClose: () => void;
  src: string; // e.g. "/assets/GoZero Calculator PDF.pdf" (served from public)
  title?: string;
}) {
  const [numPages, setNumPages] = React.useState<number>(0);
  const [pageNumber, setPageNumber] = React.useState<number>(1);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [scale, setScale] = React.useState<number>(1.5);
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);
  const [pageInput, setPageInput] = React.useState<string>("1");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const encodedSrc = React.useMemo(() => {
    if (!src) return src;
    const ensureEncoded = (value: string) => {
      try {
        const decoded = decodeURI(value);
        return encodeURI(decoded);
      } catch {
        return encodeURI(value);
      }
    };

    const sanitized = ensureEncoded(src);
    if (/^(blob:|data:|https?:)/i.test(sanitized)) {
      return sanitized;
    }

    if (typeof window !== "undefined") {
      const prefix = sanitized.startsWith("/") ? "" : "/";
      return `${window.location.origin}${prefix}${sanitized}`;
    }

    return sanitized;
  }, [src]);

  React.useEffect(() => {
    if (!open) {
      // reset when closing so it always opens on first page
      setPageNumber(1);
      setPageInput("1");
      setNumPages(0);
      setLoadError(null);
      setScale(1.5);
      setIsFullscreen(false);
    }
  }, [open]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setPageNumber((p) => Math.max(1, p - 1));
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setPageNumber((p) => (numPages ? Math.min(numPages, p + 1) : p));
      } else if (e.key === "Escape" && isFullscreen) {
        e.preventDefault();
        setIsFullscreen(false);
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, numPages, isFullscreen]);

  const onPdfLoadSuccess = React.useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoadError(null);
  }, []);

  const handlePageInputChange = (value: string) => {
    setPageInput(value);
    const pageNum = parseInt(value, 10);
    if (pageNum && pageNum >= 1 && pageNum <= numPages) {
      setPageNumber(pageNum);
    }
  };

  const handleZoom = (direction: "in" | "out" | "reset") => {
    if (direction === "in") {
      setScale((s) => Math.min(s + 0.25, 3));
    } else if (direction === "out") {
      setScale((s) => Math.max(s - 0.25, 0.5));
    } else {
      setScale(1.5);
    }
  };

  const handlePageClick = () => {
    if (pageNumber < numPages) {
      setPageNumber((p) => p + 1);
    }
  };

  const handleSwipe = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    if (!touch) return;
    const startX = touch.clientX;
    const handleTouchEnd = (endEvent: TouchEvent) => {
      const endTouch = endEvent.changedTouches[0];
      const diff = startX - endTouch.clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          // Swiped left → next page
          setPageNumber((p) => (numPages ? Math.min(numPages, p + 1) : p));
        } else {
          // Swiped right → prev page
          setPageNumber((p) => Math.max(1, p - 1));
        }
      }
      document.removeEventListener("touchend", handleTouchEnd);
    };
    document.addEventListener("touchend", handleTouchEnd);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        className={`border-none shadow-2xl ${
          isFullscreen
            ? "max-w-full max-h-screen h-screen"
            : "max-w-4xl max-h-[90vh]"
        } overflow-hidden`}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-center flex-1">{title || src.split("/").pop()}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title="Toggle fullscreen (F)"
              className="text-xs"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div
          ref={containerRef}
          className="flex flex-col gap-0 overflow-auto flex-1 relative"
          onTouchEnd={handleSwipe}
        >
          {/* Navigation Bar - Positioned over PDF */}
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-gray-50 p-3 rounded-lg border border-b">
            {/* Left: Previous button */}
            <Button
              disabled={pageNumber === 1}
              variant="outline"
              size="sm"
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              title="Previous page (← or ↑)"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Center: Page info and input */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium whitespace-nowrap">Page</span>
              <input
                type="number"
                min="1"
                max={numPages}
                value={pageInput}
                onChange={(e) => handlePageInputChange(e.target.value)}
                onBlur={() => setPageInput(String(pageNumber))}
                className="w-12 px-2 py-1 border rounded text-sm text-center"
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">of {numPages || "…"}</span>
            </div>

            {/* Right: Next button */}
            <Button
              disabled={!numPages || pageNumber >= numPages}
              variant="outline"
              size="sm"
              onClick={() => setPageNumber((p) => (numPages ? Math.min(numPages, p + 1) : p))}
              title="Next page (→ or ↓)"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Zoom and Controls Bar - Positioned over PDF */}
          <div className="sticky top-12 z-10 flex items-center justify-center gap-2 bg-gray-50 p-3 rounded-lg border border-b flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleZoom("out")}
              disabled={scale <= 0.5}
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>

            <span className="text-sm font-medium whitespace-nowrap">{Math.round(scale * 100)}%</span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleZoom("in")}
              disabled={scale >= 3}
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>

            <div className="h-6 w-px bg-gray-300" />

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleZoom("reset")}
              title="Reset zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* PDF Viewer */}
          <div className="flex justify-center flex-1 bg-gray-100 rounded-lg p-2">
            <div
              onClick={handlePageClick}
              className="cursor-pointer transition-opacity hover:opacity-80"
              title="Click to go to next page"
            >
              <PDFDocument
                file={encodedSrc}
                onLoadSuccess={onPdfLoadSuccess}
                onLoadError={(err) => setLoadError(err?.message || "Failed to load PDF")}
                loading={<Loading size={48} text="Loading document" />}
                error={
                  <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    Failed to load PDF file.
                  </div>
                }
              >
                <PDFPage
                  className="border rounded-md p-2 bg-white"
                  canvasBackground="#fff"
                  loading={<Loading size={48} text="Loading page" />}
                  pageNumber={pageNumber}
                  scale={scale}
                />
              </PDFDocument>
            </div>
          </div>

          {loadError && (
            <p className="text-sm text-muted-foreground text-center">{loadError}</p>
          )}

          {/* Help Text */}
          <p className="text-xs text-muted-foreground text-center py-2">
            💡 Keyboard: Arrow keys to navigate • F for fullscreen • Swipe on mobile
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
