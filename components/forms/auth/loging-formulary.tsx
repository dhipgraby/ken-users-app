import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import IconController from "@/components/icon-controller";
import Loading from "@/components/loading";
import Link from "next/link";
import Alert from "@/components/ui/alert";

const LoginFormulary = ({
  form,
  onSubmit,
  showTwoFactor,
  showTwoFactorSms,
  errorMsg,
  errorType,
  successMsg,
  isLoading
}: {
  form: any,
  onSubmit: (values: any) => void,
  showTwoFactor: boolean,
  showTwoFactorSms: boolean,
  errorMsg: string | null,
  errorType: "error" | "info" | "warning",
  successMsg: string | null,
  isLoading: boolean,
}) => {
  return (<Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      {showTwoFactor && (
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-emerald-950/90">Two Factor Email Code</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isLoading}
                  type="number"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {showTwoFactorSms && (
        <FormField
          control={form.control}
          name="smsCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-emerald-950/90">Two Factor SMS Code</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isLoading}
                  type="number"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {(!showTwoFactor && !showTwoFactorSms) && (
        <>
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-emerald-950/90">Username / Email</FormLabel>
                <FormControl>
                  <Input placeholder="username or email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-emerald-950/90">Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
      <div className="mt-4 flex justify-between items-center">
        <Link href="/auth/reset">Forgot password?</Link>
      </div>

      {/* submit btn */}
      <Alert message={errorMsg} type={errorType} />
      <Alert message={successMsg} type="success" />
      <Button disabled={isLoading} type="submit" className="w-full">
        <div className="flex items-center space-x-1">
          {isLoading ? (
            <>
              <Loading size={16} />
              <p>Login In...</p>
            </>
          ) : (
            <>
              <IconController icon="login" />
              <p>{showTwoFactor ? "Confirm" : "Login"}</p>
            </>
          )}
        </div>
      </Button>
    </form>
  </Form >);
};

export default LoginFormulary;