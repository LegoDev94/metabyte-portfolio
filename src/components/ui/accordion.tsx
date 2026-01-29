"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

function Accordion({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="accordion" className={cn("flex flex-col gap-2", className)} {...props} />
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="accordion-item" className={cn("border rounded-lg px-4 py-3", className)} {...props} />
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="accordion-trigger"
      className={cn(
        "flex flex-1 items-center justify-between gap-2 rounded-lg py-3 text-left text-sm font-medium transition-[color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </button>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="accordion-content"
      className={cn(
        "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        className
      )}
      {...props}
    >
      <div className="pt-0 pb-4">{children}</div>
    </div>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
