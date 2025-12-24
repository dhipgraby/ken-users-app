"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useSendSupportMutation } from "@/queries/support-query";

const brand = "#0F5E59";

export default function GetSupport() {
  const [subject, setSubject] = React.useState("");
  const [type, setType] = React.useState("question");
  const [desc, setDesc] = React.useState("");
  const sendSupport = useSendSupportMutation();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !desc.trim()) {
      toast.error("Please fill in the required fields.");
      return;
    }
    try {
      const res = await sendSupport.mutateAsync({ subject, type: type as any, description: desc });
      if ((res as any)?.status && (res as any)?.status >= 400) {
        toast.error((res as any)?.message || "Failed to send support request");
      } else {
        toast.success("We've received your request. We'll get back to you soon.");
        setSubject("");
        setType("question");
        setDesc("");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to send support request");
    }
  };

  const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <label className="text-sm font-medium">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );

  return (
    <div className="mx-auto w-full max-w-2xl py-6 md:py-8">
      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="p-6 md:p-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Get Support</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              One of our support agents will get back to you as soon as possible.
            </p>
            <div className="mt-3 h-px w-full bg-muted" />
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label required>Subject Line</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., How do I calculate my emissions?"
              />
            </div>

            <div className="space-y-1.5">
              <Label required>Request Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="enhancement">Enhancement</SelectItem>
                  <SelectItem value="question">Question</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label required>Describe Your Issue</Label>
              <Textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={8}
                placeholder="e.g., I am unable to calculate my emissions."
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={sendSupport.isPending}
                className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-70"
                style={{ backgroundColor: brand }}
              >
                {sendSupport.isPending ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
