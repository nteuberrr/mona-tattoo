"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-body text-sm uppercase tracking-editorial transition-opacity duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2",
  {
    variants: {
      variant: {
        primary:
          "bg-ink text-bg hover:opacity-90 active:opacity-100 border border-ink",
        secondary:
          "bg-transparent text-ink border border-ink hover:bg-ink hover:text-bg",
        ghost:
          "bg-transparent text-ink hover:bg-line/50 border border-transparent",
        link: "bg-transparent text-ink underline-offset-4 hover:underline border-transparent p-0 h-auto tracking-normal normal-case",
        danger:
          "bg-danger text-bg hover:opacity-90 border border-danger"
      },
      size: {
        md: "h-12 px-6",
        sm: "h-10 px-4 text-xs",
        lg: "h-14 px-8",
        icon: "h-10 w-10 p-0"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
