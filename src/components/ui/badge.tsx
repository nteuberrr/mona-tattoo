import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-1 text-[0.65rem] uppercase tracking-editorial font-medium",
  {
    variants: {
      variant: {
        default: "bg-ink text-bg",
        outline: "bg-transparent text-ink border border-ink",
        muted: "bg-line text-ink-soft",
        warning: "bg-[#F6E6C4] text-[#6B5217]",
        success: "bg-[#DCE6DC] text-[#2E4A2E]"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
