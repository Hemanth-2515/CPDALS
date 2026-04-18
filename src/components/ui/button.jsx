import * as React from "react";
import { cn } from "@/lib/utils";

const variantClasses = {
  default: "bg-slate-900 text-white shadow-sm hover:bg-slate-800",
  destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700",
  outline: "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50",
  secondary: "bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200",
  ghost: "text-slate-700 hover:bg-slate-100",
  link: "text-violet-600 underline-offset-4 hover:underline"
};

const sizeClasses = {
  default: "h-9 px-4 py-2",
  sm: "h-8 px-3 text-xs",
  lg: "h-10 px-8",
  icon: "h-9 w-9"
};

function buttonVariants({ variant = "default", size = "default", className } = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className
  );
}

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? "span" : "button";
  return <Comp className={buttonVariants({ variant, size, className })} ref={ref} {...props} />;
});

Button.displayName = "Button";

export { Button, buttonVariants };
