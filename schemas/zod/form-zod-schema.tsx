import { z } from "zod";

const MAX_FILE_SIZE = 1024 * 1024 * 5; // 5mb
export const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf"
];

export const FileSchema = z
  .object({
    file: z.any(),
    size: z.number(),
    type: z.string()
  })
  .refine(
    (file) => file.size <= MAX_FILE_SIZE,
    {
      message: "File must be less than 5MB."
    }
  )
  .refine(
    (file) => ACCEPTED_FILE_TYPES.includes(file.type),
    {
      message: `File type must be one of ${ACCEPTED_FILE_TYPES.join(", ")}`
    }
  );