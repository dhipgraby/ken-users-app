"use client";

import React, { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight, FileUp } from "lucide-react";
import { FileProps } from "@/types/components";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Loading from "@/components/loading";

const PDFDocument = dynamic(() => import("react-pdf").then((mod) => mod.Document), {
  ssr: false,
  loading: () => <Loading size={32} text="Preparing document" />
});

const PDFPage = dynamic(() => import("react-pdf").then((mod) => mod.Page), {
  ssr: false,
  loading: () => <Loading size={32} text="Loading page" />
});

const PreviewDocument: React.FC<{
  uploadedFile: FileProps;
}> = ({ uploadedFile }) => {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onPdfLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={"ghost"}
          className="my-2 px-4 py-1 flex hover:border-black space-x-2 items-center  text-md font-semibold border-2 w-full rounded-md cursor-pointer"
        >
          <FileUp width={16} />
          <p>Preview Document</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-full max-h-[900px] overflow-scroll border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">{uploadedFile.name}</DialogTitle>
          <DialogDescription className="text-center">
            Preview the uploaded file
          </DialogDescription>
        </DialogHeader>
        {uploadedFile && (
          <>
            {uploadedFile.name.endsWith(".pdf") ? (
              <div className="grid gap-4 justify-items-center">
                <PDFDocument file={uploadedFile.file} onLoadSuccess={onPdfLoadSuccess}>
                  <PDFPage
                    className={"border-2 rounded-md p-4"}
                    canvasBackground="#727272"
                    loading={<Loading size={48} text="Loading page preview" />}
                    pageNumber={pageNumber}
                    scale={2}
                  />
                </PDFDocument>
                <div className="flex space-x-2 items-center ">
                  <Button
                    disabled={pageNumber === 1}
                    variant="ghost"
                    type="button"
                    size="icon"
                    onClick={() => setPageNumber(() => pageNumber - 1)}
                  >
                    <ChevronLeft />
                  </Button>
                  <p>
                    Page {pageNumber} of {numPages}
                  </p>
                  <Button
                    disabled={numPages ? pageNumber >= numPages : true}
                    variant="ghost"
                    type="button"
                    size="icon"
                    onClick={() => setPageNumber(() => pageNumber + 1)}
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="justify-self-center">
                <Image
                  className="rounded-lg"
                  src={uploadedFile.url}
                  alt={uploadedFile.name}
                  width={600}
                  height={600}
                />
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PreviewDocument;
