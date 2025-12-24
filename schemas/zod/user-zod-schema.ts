import { z } from "zod";

export const VendorsConfigSchema = z.object({
  feeRate: z.any().refine((val) => !Number.isNaN(parseInt(val, 10)), {
    message: "Expected number, received a string"
  }).refine((val) => parseInt(val, 10) >= 0, {
    message: "Minimum fee rate is 0%"
  }).refine((val) => parseInt(val, 10) < 100, {
    message: "Maximum fee rate is 99%"
  }).optional(),
  isTwoFactorEnabled: z.boolean(),
  email: z.string().email()
});

export type VendorsConfig = z.infer<typeof VendorsConfigSchema>;