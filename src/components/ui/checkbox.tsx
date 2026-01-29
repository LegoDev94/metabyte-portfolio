"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <div className="relative flex">
      <input
        type="checkbox"
        data-slot="checkbox"
        className={cn(
          "peer appearance-none border border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:data-[state=checked]:bg-primary dark:data-[state=checked]:text-primary-foreground dark:data-[state=checked]:border-primary dark:bg-input/30 dark:hover:bg-input/50 disabled:cursor-not-allowed disabled:opacity-50 shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] size-4 shrink-0 rounded-[0.25rem] *:m-0 *:size-full *:hidden [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className
        )}
        {...props}
      />
      <Check
        aria-hidden="true"
        data-slot="checkbox-indicator"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 data-[state=checked]:opacity-100"
      />
    </div>
  )
}

export { Checkbox }
