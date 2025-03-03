import { useRef, forwardRef, InputHTMLAttributes, ReactNode, useEffect, useState } from "react"

import { cn } from "@/lib/utils"
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  suffix?: ReactNode;
  error?: string | boolean;
  description?: string;
  hintText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", suffix, error, description, hintText, ...props }, ref) => {
    const suffixStyle = { marginRight: 12 };
    const suffixWrapRef = useRef<HTMLDivElement>(null);
    const [inputStyle, setInputStyle] = useState({});

    useEffect(() => {
      if ((suffix || hintText) && suffixWrapRef?.current) {
        setInputStyle({ paddingRight: suffixWrapRef?.current.offsetWidth + 8 });
      } else {
        setInputStyle({});
      }
    }, [suffix, suffixWrapRef.current, suffixWrapRef?.current?.offsetWidth]);

    return (
      <div className="relative mt-1 rounded-md">
        <input
          type={type}
          autoComplete="off"
          className={cn(
            "flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-red-700 shadow-none focus-visible:ring-red-700" : "border-input shadow-input focus-visible:ring-blue-700 focus-visible:border-transparent",
            className
          )}
          ref={ref}
          {...props}
          style={inputStyle}
        />

        <div className="absolute inset-y-0 right-0 flex items-center h-[36px]" ref={suffixWrapRef}>
          {suffix || hintText ? (
            <div
              className={cn("text-gray-500 truncate", cn({ "flex space-x-2 items-center": suffix && hintText }))}
              style={suffixStyle}
            >
              <div>{suffix}</div>
              {hintText ? <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <QuestionMarkCircleIcon className={`w-5 h-5 ${error ? "text-red-700" : "text-gray-400"}`} aria-hidden="true" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{hintText}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider> : null}
            </div>
          ) : null}
        </div>

        {error ? <div className="mt-1 text-sm font-medium text-red-700">{error}</div> : <>
          {description ? <div className="mt-1 text-sm text-muted-foreground">{description}</div> : null}
        </>}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }