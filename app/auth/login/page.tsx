import React from "react";
import LoginForm from "@/components/forms/auth/login-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const LoginPage = () => {
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
      <LoginForm />
    </>
  );
};

export default LoginPage;
