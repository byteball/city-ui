import { cn } from "@/lib/utils"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import * as React from "react"

const TooltipProvider = TooltipPrimitive.Provider

// Detect mobile (no hover + coarse pointer)
const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false)
  React.useEffect(() => {
    const mq = window.matchMedia("(hover: none) and (pointer: coarse)")
    const onChange = () => setIsMobile(mq.matches)
    onChange()
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])
  return isMobile
}

// Context so Trigger can toggle open on mobile
type Ctx = { isMobile: boolean; open: boolean; setOpen: (v: boolean) => void }
const TooltipCtx = React.createContext<Ctx | null>(null)

// Tooltip: uncontrolled on desktop, fully controlled on mobile
const Tooltip = ({
  children,
  onOpenChange,           // keep for desktop
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) => {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)

  // Close on outside click (only mobile; Radix won't do it for us if we ignore onOpenChange)
  React.useEffect(() => {
    if (!isMobile || !open) return
    const onDocPointerDown = (ev: PointerEvent) => {
      const t = ev.target as Node
      const portals = document.querySelectorAll("[data-radix-portal]")
      const isInPortal = Array.from(portals).some(p => p.contains(t))
      // if click is outside trigger and content (portaled), close
      if (!isInPortal) setOpen(false)
    }
    document.addEventListener("pointerdown", onDocPointerDown, { passive: true })
    return () => document.removeEventListener("pointerdown", onDocPointerDown)
  }, [isMobile, open])

  // Close on Escape (mobile + desktop)
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <TooltipCtx.Provider value={{ isMobile, open, setOpen }}>
      <TooltipPrimitive.Root
        {...props}
        // On mobile: ignore Radix open changes; use our own state only
        open={isMobile ? open : undefined}
        onOpenChange={isMobile ? () => { } : onOpenChange}
        // disableHoverableContent лучше задать на Provider, но тут тоже ок для мобильных
        disableHoverableContent={isMobile}
      >
        {children}
      </TooltipPrimitive.Root>
    </TooltipCtx.Provider>
  )
}

// Trigger: toggle on mobile via pointerdown, prevent default to avoid immediate blur
const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger> & { asChild?: boolean }
>(({ asChild = true, style, onPointerDown, onClick, ...props }, ref) => {
  const ctx = React.useContext(TooltipCtx)

  const handlePointerDown = (e: React.PointerEvent) => {
    onPointerDown?.(e)
    if (ctx?.isMobile) {
      // Prevent native focus/blur chain that leads Radix to request close
      e.preventDefault()
      e.stopPropagation()
      ctx.setOpen(!ctx.open) // toggle
    }
  }

  // Desktop click remains intact (Radix handles hover/focus); keep bubbling
  return (
    <TooltipPrimitive.Trigger
      {...props}
      ref={ref}
      // asChild={asChild}
      tabIndex={0}
      style={{ touchAction: "manipulation", display: "inline-block", ...style }}
      onPointerDown={handlePointerDown}
      onClick={onClick}
    />
  )
})

TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, onPointerDown, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      // Prevent content click from bubbling back and toggling/closing
      onPointerDown={(e) => {
        onPointerDown?.(e)
        e.stopPropagation()
      }}
      className={cn(
        "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
