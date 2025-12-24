"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LoginSchema, LoginInputs } from "@/schemas/zod/auth-zod-schema";
import { CardWrapper } from "./card-wrapper";
import { login } from "@/lib/actions/login";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { useLoginMutation } from "@/queries/user/profile-query";
import LoginFormulary from "./loging-formulary";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [showTwoFactorSms, setShowTwoFactorSms] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<"error" | "info" | "warning">("error");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const form = useForm<LoginInputs>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      identifier: "",
      password: ""
    }
  });

  const { submitLoginMutation } = useLoginMutation();

  const onGoogleLogin = async () => {
    try {
      setErrorMsg(null);
      setIsLoading(true);
      await signIn("google", {
        callbackUrl: callbackUrl || DEFAULT_LOGIN_REDIRECT
      });
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: LoginInputs) => {
    try {
      // Clear previous error message and set loading state
      setErrorMsg(null);
      setIsLoading(true);

      const payload = {
        identifier: values.identifier,
        password: values.password,
        code: values.code || undefined,
        smsCode: values.smsCode || undefined
      };

      const loging = await submitLoginMutation.mutateAsync({
        setIsLoading,
        setErrorMsg,
        serverAction: async () => await login(payload)
      });

      const response = (loging as any)?.serverResponse;
      if (!response) {
        setIsLoading(false);
        setErrorType("error");
        setErrorMsg("No response received from the server. Please try again.");
        return;
      }

      if (response.status) {
        if (response.status !== 200) {

          const errorMessage = response.message || response.error || "Something went wrong, try again or contact support.";
          if (response.status === 202) {
            toast.info(response.message);
          } else {
            setErrorMsg(errorMessage);
          }

          setErrorType("warning");
          if (response.message === "Token is expired") {
            form.reset();
            setShowTwoFactor(false);
            setShowTwoFactorSms(false);
          }
          setIsLoading(false);
          return;
        }

        const accessToken = response.token;
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", accessToken);
        }

        // Establish next-auth session client-side (avoids server async headers/cookies warnings)
        const signInResult = await signIn("credentials", {
          token: accessToken,
          redirect: false,
          callbackUrl: callbackUrl || DEFAULT_LOGIN_REDIRECT,
          redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT // backward compatibility (beta API)
        });

        if (signInResult && (signInResult as any).error) {
          const msg = (signInResult as any).error || "Session establishment failed";
          setErrorMsg(msg);
          toast.error(msg);
          setIsLoading(false);
          return;
        }

        toast.success("Successfully logged in! Redirecting...");
        setSuccessMsg("Successfully logged in!");
        router.push("/dashboard");
      }
    } catch (error: any) {
      handleError(error);
    }
  };

  const handleError = (error: any) => {
    setIsLoading(false);
    console.log("error:", error);

    // Next.js server actions can throw E394 if the request is redirected/blocked
    // (commonly by middleware) and the client receives a non-RSC response.
    if (error && typeof error === "object" && (error as any).__NEXT_ERROR_CODE === "E394") {
      const msg = "Login request was redirected/blocked before reaching the server. Please try again. If it keeps happening, refresh the page.";
      setErrorType("error");
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (error.response && error.response.data && error.response.data.message) {
      const errorMessage = error.response.data.message;
      if (error.response.status === 202) {
        toast.info("A new confirmation email has been sent. Please check your inbox and click the verification link.");
        setErrorType("info");
      } else {
        toast.error(errorMessage);
      }
      setErrorMsg(errorMessage);
    } else {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again or contact support.";
      setErrorMsg(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen w-full px-4 py-10 sm:py-12 flex items-start sm:items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-400 to-emerald-800">
      <CardWrapper
        headerTitle="Welcome back"
        headerLabel="Login to your account"
        backButtonLabel="Don't have an account?"
        backButtonHref="/auth/signup"
      >
        <div className="w-full flex flex-col gap-y-3 pb-3">
          <Button
            variant="outline"
            className="w-full flex items-center gap-2 h-10 rounded-xl"
            onClick={onGoogleLogin}
            type="button"
          >
            <Image src="/google-logo.png" alt="Google Logo" width={20} height={20} />
            Sign in with Google
          </Button>
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
        </div>
        <LoginFormulary
          form={form}
          onSubmit={onSubmit}
          showTwoFactor={showTwoFactor}
          showTwoFactorSms={showTwoFactorSms}
          errorMsg={errorMsg}
          errorType={errorType}
          successMsg={successMsg}
          isLoading={isLoading}
        />
      </CardWrapper>
    </div>
  );
};

export default LoginForm;