"use client";

import React from "react";
import Image from "next/image";
import { FileUp } from "lucide-react";
import { FileProps } from "@/types/components";
import { ACCEPTED_FILE_TYPES } from "@/schemas/zod/form-zod-schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const PreviewDocument: React.FC<{
  uploadedFile: FileProps;
}> = ({ uploadedFile }) => {
  const isImage = ACCEPTED_FILE_TYPES.includes(uploadedFile.file?.type);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={"ghost"}
          className="my-2 px-4 py-1 flex hover:border-black space-x-2 items-center  text-md font-semibold border-2 w-full rounded-md cursor-pointer"
        >
          <FileUp width={16} />
          <p>Preview Image</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-full max-h-[900px] overflow-scroll border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">{uploadedFile.name}</DialogTitle>
          <DialogDescription className="text-center">
            Preview the uploaded image
          </DialogDescription>
        </DialogHeader>
        {isImage ? (
          <div className="justify-self-center">
            <Image
              className="rounded-lg"
              src={uploadedFile.url}
              alt={uploadedFile.name}
              width={600}
              height={600}
            />
          </div>
        ) : (
          <p className="text-center">Preview is only available for JPEG, PNG, and WebP images.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PreviewDocument;
