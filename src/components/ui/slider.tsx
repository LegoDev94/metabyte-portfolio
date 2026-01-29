"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Slider({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <div
      data-slot="slider"
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50",
        className
      )}
    >
      <input
        type="range"
        data-slot="slider-input"
        className={cn(
          "bg-transparent absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0 z-10 [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-input [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-input [&::-moz-range-thumb]:shadow-sm [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:appearance-none"
        )}
        {...props}
      />
      <div
        data-slot="slider-track"
        className="bg-secondary relative grow h-1.5 rounded-full"
      >
        <div
          data-slot="slider-range"
          className="bg-primary absolute h-full rounded-full"
        />
      </div>
      <div
        data-slot="slider-thumb"
        className="bg-background border-input shadow-sm block size-4 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
    </div>
  )
}

export { Slider }
