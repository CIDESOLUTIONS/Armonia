"use client"

import React from "react"

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <label
        className={className}
        ref={ref}
        {...props}
      >
        {children}
      </label>
    )
  }
)

Label.displayName = "Label"
