import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import FrameworkLogo from "../../framework-logo";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"]
});

interface HeaderProps {
  label: string;
  title?: string;
}

export const Header = ({
  label,
  title
}: HeaderProps) => {
  return (
    <div className="w-full flex flex-col gap-y-4 items-center justify-center">
      <FrameworkLogo variant="light" size={60} withShadow={true} />
      <h1 className={cn(
        "text-xl font-bold tracking-tight text-gray-900",
        font.className,
      )}>
        {title || "Auth"}
      </h1>
      <p className="text-muted-foreground text-sm text-center max-w-[90%]">
        {label}
      </p>
    </div>
  );
};
