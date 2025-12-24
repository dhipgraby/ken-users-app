"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetPassowrdSchema } from "@/schemas/zod/auth-zod-schema";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { CardWrapper } from "./card-wrapper";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/lib/actions/reset";
import Alert from "@/components/ui/alert";

export const ResetForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof ResetPassowrdSchema>>({
    resolver: zodResolver(ResetPassowrdSchema),
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = (values: z.infer<typeof ResetPassowrdSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      resetPassword(values)
        .then((data: any) => {
          setError(data?.error);
          if (data.status === 200 || data.status === 202) setSuccess(data?.message);
        });
    });
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-400 to-emerald-800">
      <CardWrapper
        headerTitle="Reset your password"
        headerLabel="Enter your email and we’ll send you a reset link"
        backButtonLabel="Back to login"
        backButtonHref="/auth/login"
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-emerald-950/90">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="john.doe@example.com"
                        type="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Alert message={error} type="error" />
            <Alert message={success} type="success" />
            <Button
              disabled={isPending}
              type="submit"
              className="w-full"
            >
                Send reset link
            </Button>
          </form>
        </Form>
      </CardWrapper>
    </div>
  );
};
