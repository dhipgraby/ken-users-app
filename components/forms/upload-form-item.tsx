"use client";

import {
  FormField,
  FormItem,
  FormMessage
} from "@/components/ui/form";
import { File as FileIcon, FileUp } from "lucide-react";
import { ACCEPTED_FILE_TYPES } from "@/schemas/zod/form-zod-schema";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import PreviewDocument from "../preview-document";
import { ControllerRenderProps } from "react-hook-form";
import { Separator } from "../ui/separator";

interface UploadProps {
    form: any;
    fieldName: string;
    title?: string;
    description?: string;
}

const UploadFormField = ({
  form,
  fieldName,
  title,
  description
}: UploadProps) => {

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: ControllerRenderProps<any, any>
  ) => {
    const _file = event.target?.files?.[0];
    if (!_file) return;
    if (!ACCEPTED_FILE_TYPES.includes(_file.type)) {
      event.target.value = "";
      form.setError(fieldName, {
        type: "fileType",
        message: "Please select a JPEG, PNG, or WebP image."
      });
      return;
    }
    if (form.getFieldState(fieldName).error?.type === "fileType") {
      form.clearErrors(fieldName);
    }
    const newFile = { file: _file, name: _file.name, url: URL.createObjectURL(_file), type: _file.type, size: _file.size };
    field.onChange(newFile ?? undefined);
  };

  return (
    <div className="border-2 m-2 rounded-md place-self-center h-fit w-11/12">
      <div className="w-full p-4">
        {title && <h1 className="font-semibold">{title}</h1>}
        {description && <p className="text-xs max-w-52">{description}</p>}
        {title && <Separator className="mb-4 mt-2 h-1" />}
        <FormField
          control={form.control}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <div className="grid gap-4 grid-cols-1 justify-items-center">
                {field.value && (
                  <div className="flex space-x-2 items-center">
                    <FileIcon />
                  </div>
                )}
                {field.value && (
                  <div className="justify-self-center">
                    <p className="font-bold text-xs">
                      {field.value.name}
                    </p>
                  </div>
                )}
                <div>
                  {field.value && (
                    <PreviewDocument uploadedFile={field.value} />
                  )}
                  <Button
                    type="button"
                    variant={"ghost"}
                    className=" bg-transparent border-2 shadow-lg dark:bg-zinc-800 dark:border-slate-700 dark:text-slate-400 text-nowrap py-1 flex-wrap space-x-2 items-center text-md rounded-md cursor-pointer"
                  >
                    <label
                      htmlFor={fieldName}
                      className="cursor-pointer flex px-2"
                    >
                      <FileUp width={16} className="mr-2" />
                      {field.value ? "Change image" : "Upload image"}
                    </label>
                    <Input
                      id={fieldName}
                      className="sr-only"
                      type="file"
                      accept={ACCEPTED_FILE_TYPES.join(",")}
                      onChange={(event) => handleFileChange(event, field)}
                    />
                  </Button>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>

  );
};

export default UploadFormField;
