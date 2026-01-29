"use client"

import * as React from "react"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="radio-group"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <div className="relative flex">
      <input
        type="radio"
        data-slot="radio-group-item"
        className={cn(
          "border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:data-[state=checked]:bg-primary dark:data-[state=checked]:text-primary-foreground dark:data-[state=checked]:border-primary dark:bg-input/30 dark:hover:bg-input/50 disabled:cursor-not-allowed disabled:opacity-50 shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] appearance-none size-4 shrink-0 rounded-full border *:m-0 *:size-full *:hidden [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className
        )}
        {...props}
      />
      <Circle
        aria-hidden="true"
        data-slot="radio-group-indicator"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 data-[state=checked]:opacity-100 fill-current text-current"
      />
    </div>
  )
}

export { RadioGroup, RadioGroupItem }
