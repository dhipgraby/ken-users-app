"use client";

import React, { useState, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";
import {
  SignUpSchema,
  SignUpInputs,
  PSWD_FIELD_VALIDATION
} from "@/schemas/zod/auth-zod-schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import IconController from "@/components/icon-controller";
import Loading from "@/components/loading";
import { register } from "@/lib/actions/register";
import Link from "next/link";
import { CardWrapper } from "./card-wrapper";
import Alert from "@/components/ui/alert";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

const SignUpForm = () => {
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<"error" | "info" | "warning">("error");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const form = useForm<SignUpInputs>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signIn("google", {
        callbackUrl: DEFAULT_LOGIN_REDIRECT
      });
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Something went wrong with Google Login");
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: SignUpInputs) => {
    if (signUpError !== null) setSignUpError(null);
    if (isLoading === false) setIsLoading(true);

    try {
      const response = await register(
        {
          username: values.username,
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword
        }
      );

      // signup response handled below; removed console.log to keep console clean

      if (response.status) {
        if (response.status === 202) {
          toast.info("A new confirmation email has been sent. Please check your inbox and click the verification link.");
          setErrorType("info");
          setSignUpError("A new confirmation email has been sent. Please check your inbox and click the verification link.");
          setIsLoading(false);
          return;
        }

        if (response.status !== 200) {
          const errorMessage = response.message || response.error || "Something went wrong, try again or contact support.";
          setSignUpError(errorMessage);
          setErrorType("warning");
          setIsLoading(false);
          return;
        }

        toast.success("Successfully registered! We have sent a confirmation link to your email.");
        setSuccessMsg("Successfully registered! We have sent a confirmation link to your email.");
        setIsSuccess(true);
        setIsLoading(false);
      }
    } catch (error: any) {
      setIsLoading(false);
      console.log("error:", error);

      if (error.response && error.response.data && error.response.data.message) {
        const errorMessage = error.response.data.message;
        if (error.response.status === 202) {
          toast.info("A new confirmation email has been sent. Please check your inbox and click the verification link.");
          setErrorType("info");
        } else {
          toast.error(errorMessage);
        }
        setSignUpError(errorMessage);
      } else {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again or contact support.";
        setSignUpError(errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  return (
    <div className="min-h-screen w-full px-4 py-10 sm:py-12 flex items-start sm:items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-400 to-emerald-800">
      <CardWrapper
        headerTitle="Create an account"
        headerLabel="Enter your details"
        backButtonLabel="Already have an account? Login"
        backButtonHref="/auth/login"
      >
        {isSuccess ?
          <div>
            <h1 className="text-xl font-semibold">
                Account created Successfully!
            </h1>
            <CheckCircle className="h-20 w-20 text-green-600 mt-10 mb-10 m-auto" />
            <p className="text-lg">
                We have sent a confirmation link to your email to verify your account.
            </p>
            <Link href="/auth/login">
              <Button className="w-full mt-10">
                  Go Login
              </Button>
            </Link>
          </div>
          :
          <>
            <div className="w-full flex flex-col gap-y-2 pb-2">
              <Button
                variant="outline"
                className="w-full flex items-center gap-2 h-9 rounded-xl"
                onClick={onGoogleLogin}
                type="button"
              >
                <Image src="/google-logo.png" alt="Google Logo" width={20} height={20} />
                  Sign up with Google
              </Button>
              <div className="relative my-2">
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2">
                {/* form fields */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-emerald-950/90">Username</FormLabel>
                      <FormControl>
                        <Input className="h-9" placeholder="username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-emerald-950/90">Email</FormLabel>
                      <FormControl>
                        <Input className="h-9" placeholder="email@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <>
                      <FormItem>
                        <FormLabel className="text-emerald-950/90">Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="password"
                            className="h-9"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <>
                      <FormItem>
                        <FormLabel className="text-emerald-950/90">Confirm password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="same as password"
                            className="h-9"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </>
                  )}
                />
                <PasswordRequirements password={form.watch("password")} confirmPassword={form.watch("confirmPassword")} />

                {/* submit btn */}
                <div className="w-full d-block">
                  {signUpError && <Alert message={signUpError} type={errorType} />}
                  {successMsg && <Alert message={successMsg} type={"success"} />}
                </div>
                <Button disabled={isLoading} type="submit" className="w-full h-9 rounded-xl">
                  <div className="flex items-center space-x-1">
                    {isLoading ? (
                      <>
                        <Loading size={16} />
                        <p>Creating account</p>
                      </>
                    ) : (
                      <>
                        <IconController icon="login" />
                        <p>Create account</p>
                      </>
                    )}
                  </div>
                </Button>
              </form>
            </Form>
          </>
        }
      </CardWrapper>
    </div>
  );
};

const PasswordRequirements = ({
  password,
  confirmPassword
}: {
  password: string;
  confirmPassword: string;
}) => {
  const pswd_valid_requirements = useMemo(() => {
    return {
      minLength: Boolean(password.length >= 8),
      specialChar: Boolean(PSWD_FIELD_VALIDATION.TEST.SPECIAL_CHAR(password)),
      number: Boolean(PSWD_FIELD_VALIDATION.TEST.NUMBER(password)),
      upperCase: Boolean(PSWD_FIELD_VALIDATION.TEST.UPPERCASE(password))
    };
  }, [password]);

  return (
    <div className="p-2.5 border rounded-xl text-[11px] bg-white/50">
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        <div className="flex gap-1 items-center">
          {pswd_valid_requirements.minLength ? (
            <IconController icon="circleCheck" className="w-3.5 h-3.5" />
          ) : (
            <IconController icon="circleClose" className="w-3.5 h-3.5" />
          )}
          <p>8+ characters</p>
        </div>
        <div className="flex gap-1 items-center">
          {pswd_valid_requirements.specialChar ? (
            <IconController icon="circleCheck" className="w-3.5 h-3.5" />
          ) : (
            <IconController icon="circleClose" className="w-3.5 h-3.5" />
          )}
          <p>1 special</p>
        </div>
        <div className="flex gap-1 items-center">
          {pswd_valid_requirements.upperCase ? (
            <IconController icon="circleCheck" className="w-3.5 h-3.5" />
          ) : (
            <IconController icon="circleClose" className="w-3.5 h-3.5" />
          )}
          <p>1 uppercase</p>
        </div>
        <div className="flex gap-1 items-center">
          {pswd_valid_requirements.number ? (
            <IconController icon="circleCheck" className="w-3.5 h-3.5" />
          ) : (
            <IconController icon="circleClose" className="w-3.5 h-3.5" />
          )}
          <p>1 number</p>
        </div>
        <div className="flex gap-1 items-center col-span-2">
          {password === confirmPassword ? (
            <IconController icon="circleCheck" className="w-3.5 h-3.5" />
          ) : (
            <IconController icon="circleClose" className="w-3.5 h-3.5" />
          )}
          <p>Passwords match</p>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;