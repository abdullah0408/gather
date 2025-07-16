import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";

interface LoadingButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function LoadingButton({
  onClick,
  loading,
  disabled,
  className,
  children,
}: LoadingButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={loading || disabled}
      className={cn("flex items-center gap-2", className)}
    >
      {loading && <Loader2 className="size-5 animate-spin" />}
      {children}
    </Button>
  );
}
