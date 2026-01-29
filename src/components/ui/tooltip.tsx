"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<"div"> & { delayDuration?: number }) {
  return (
    <div
      data-slot="tooltip-provider"
      {...props}
      data-delay-duration={delayDuration}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="tooltip" {...props} />
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<"span">) {
  return <span data-slot="tooltip-trigger" {...props} />
}

interface TooltipContentProps extends React.ComponentProps<"div"> {
  sideOffset?: number
}

function TooltipContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: TooltipContentProps) {
  return (
    <div
      data-slot="tooltip-content"
      className={cn(
        "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit max-w-xs rounded-md px-3 py-1.5 text-xs text-balance",
        className
      )}
      data-side-offset={sideOffset}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
