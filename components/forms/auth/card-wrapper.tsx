"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from "@/components/ui/card";
import { Header } from "./header";
import { BackButton } from "./back-button";

interface CardWrapperProps {
  children: React.ReactNode;
  backButtonLabel?: string;
  backButtonHref?: string;
  headerLabel?: string;
  headerTitle?: string;
  target_blank?: boolean | undefined;
}

export const CardWrapper = ({
  children,
  backButtonLabel,
  backButtonHref,
  headerLabel,
  headerTitle,
  target_blank
}: CardWrapperProps) => {
  return (
    <Card className="w-full max-w-[360px] shadow-xl m-auto bg-white/85 backdrop-blur-xl border-white/20 rounded-3xl">
      {(headerLabel) &&
        <CardHeader className="p-4 pb-2">
          <Header label={headerLabel} title={headerTitle} />
        </CardHeader>
      }
      <CardContent className="p-4 pt-0">
        {children}
      </CardContent>

      <CardFooter className="p-4 pt-3">
        {(backButtonLabel && backButtonHref) &&
          <BackButton
            label={backButtonLabel}
            href={backButtonHref}
            target_blank={target_blank}
          />
        }
      </CardFooter>
    </Card>
  );
};
