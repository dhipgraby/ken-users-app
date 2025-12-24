import React from "react";
import SignUpForm from "@/components/forms/auth/signup-form";
import Link from "next/link"; // Assuming Link is from next/link
import { Button } from "@/components/ui/button"; // Assuming Button is a UI component
import { ChevronLeft } from "lucide-react"; // Assuming ChevronLeft is an icon component

const SignUpPage = () => {
  return (
    <>
      <div className="absolute top-8 left-8">
        <Button asChild variant="ghost" className="text-white hover:text-emerald-100 hover:bg-white/10 gap-2">
          <Link href="/">
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>
      </div>
      <SignUpForm />
    </>
  );
};

export default SignUpPage;
