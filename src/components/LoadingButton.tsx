import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";

interface LoadingButtonProps {
  onClick: () => void;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | null
    | undefined;
  loading: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function LoadingButton({
  onClick,
  variant,
  loading,
  disabled,
  className,
  children,
}: LoadingButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={loading || disabled}
      variant={variant}
      className={cn("flex items-center gap-2", className)}
    >
      {loading && <Loader2 className="size-5 animate-spin" />}
      {children}
    </Button>
  );
}
