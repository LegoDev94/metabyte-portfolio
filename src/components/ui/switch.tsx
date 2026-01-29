"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      role="switch"
      data-slot="switch"
      className={cn(
        "bg-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:data-[state=checked]:bg-primary dark:data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:hover:bg-input/50 disabled:cursor-not-allowed disabled:opacity-50 shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <span
        data-slot="switch-thumb"
        className={cn(
          "bg-background data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0 pointer-events-none block size-4 rounded-full shadow-lg transition-transform"
        )}
      />
    </button>
  )
}

export { Switch }
