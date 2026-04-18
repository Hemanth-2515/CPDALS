import * as React from "react";
import { cn } from "@/lib/utils";

function badgeVariants({ variant = "default", className } = {}) {
  const variantClass =
    variant === "secondary"
      ? "bg-slate-100 text-slate-700"
      : variant === "outline"
        ? "border border-slate-200 text-slate-700"
        : variant === "destructive"
          ? "bg-red-100 text-red-700"
          : "bg-slate-900 text-white";

  return cn("inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold", variantClass, className);
}

function Badge({ className, variant, ...props }) {
  return <div className={badgeVariants({ variant, className })} {...props} />;
}

export { Badge, badgeVariants };
