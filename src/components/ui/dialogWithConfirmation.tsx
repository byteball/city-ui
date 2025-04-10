import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const DialogWithConfirmation = DialogPrimitive.Root;

const DialogWithConfirmationTrigger = DialogPrimitive.Trigger;

const DialogWithConfirmationPortal = DialogPrimitive.Portal;

const DialogWithConfirmationClose = DialogPrimitive.Close;

const DialogWithConfirmationOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
    preventClose?: boolean;
    onCloseAttempt?: () => void;
  }
>(({ className, preventClose, onCloseAttempt, ...props }, ref) => {
  const handleClick = (e: React.MouseEvent) => {
    if (preventClose) {
      e.preventDefault();
      onCloseAttempt?.();
    }
  };

  return (
    <DialogPrimitive.Overlay
      ref={ref}
      onClick={handleClick}
      className={cn(
        "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  );
});
DialogWithConfirmationOverlay.displayName = DialogPrimitive.Overlay.displayName;

// Creating a context for managing DialogContent state
const DialogStateContext = React.createContext<{
  close: () => void;
}>({
  close: () => {},
});

// Component for managing dialog state
const DialogWithConfirmationStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <DialogWithConfirmation open={open} onOpenChange={setOpen}>
      <DialogStateContext.Provider value={{ close: () => setOpen(false) }}>{children}</DialogStateContext.Provider>
    </DialogWithConfirmation>
  );
};

const DialogWithConfirmationContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showCloseConfirmation?: boolean;
    confirmationText?: string;
    onConfirmClose?: () => void;
  }
>(
  (
    {
      className,
      children,
      showCloseConfirmation = true,
      confirmationText = "Are you sure you want to close?",
      onConfirmClose,
      ...props
    },
    ref
  ) => {
    const [showConfirmation, setShowConfirmation] = React.useState(false);
    const closeRef = React.useRef<HTMLButtonElement>(null);

    const handleCloseAttempt = (withoutConfirmation: boolean = false) => {
      if (showCloseConfirmation && !withoutConfirmation) {
        setShowConfirmation(true);
      } else {
        closeRef.current?.click();
      }
    };

    const handleConfirmClose = () => {
      setShowConfirmation(false);
      if (onConfirmClose) onConfirmClose();
      closeRef.current?.click();
    };

    const handleCancelClose = () => {
      setShowConfirmation(false);
    };

    // Capturing Escape key
    const handleEscapeKeyDown = (e: KeyboardEvent) => {
      if (showCloseConfirmation) {
        e.preventDefault();
        handleCloseAttempt();
      }
    };

    return (
      <DialogWithConfirmationPortal>
        <DialogWithConfirmationOverlay preventClose={showCloseConfirmation} onCloseAttempt={handleCloseAttempt} />
        <DialogPrimitive.Content
          ref={ref}
          onEscapeKeyDown={handleEscapeKeyDown}
          onPointerDownOutside={
            showCloseConfirmation
              ? (e) => {
                  e.preventDefault();
                  handleCloseAttempt();
                }
              : undefined
          }
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
            className
          )}
          {...props}
        >
          {children}

          {showConfirmation ? (
            <div className="absolute z-50 p-3 border rounded-md shadow-md right-4 top-4 bg-background">
              <p className="mb-3 text-sm">{confirmationText}</p>
              <div className="flex justify-end space-x-2">
                <button className="px-3 py-1 text-xs rounded-md bg-muted hover:bg-muted/80" onClick={handleCancelClose}>
                  Cancel
                </button>
                <button
                  className="px-3 py-1 text-xs rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  autoFocus
                  onClick={handleConfirmClose}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleCloseAttempt(true)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <X className="w-4 h-4" />
              <span className="sr-only">Close</span>
            </button>
          )}

          {/* Hidden element for closing the dialog */}
          <DialogPrimitive.Close ref={closeRef} className="hidden" />
        </DialogPrimitive.Content>
      </DialogWithConfirmationPortal>
    );
  }
);
DialogWithConfirmationContent.displayName = DialogPrimitive.Content.displayName;

const DialogWithConfirmationHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogWithConfirmationHeader.displayName = "DialogHeader";

const DialogWithConfirmationFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
DialogWithConfirmationFooter.displayName = "DialogFooter";

const DialogWithConfirmationTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogWithConfirmationTitle.displayName = DialogPrimitive.Title.displayName;

const DialogWithConfirmationDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
DialogWithConfirmationDescription.displayName = DialogPrimitive.Description.displayName;

export {
  DialogWithConfirmation,
  DialogWithConfirmationClose,
  DialogWithConfirmationContent,
  DialogWithConfirmationDescription,
  DialogWithConfirmationFooter,
  DialogWithConfirmationHeader,
  DialogWithConfirmationOverlay,
  DialogWithConfirmationPortal,
  DialogWithConfirmationStateProvider,
  DialogWithConfirmationTitle,
  DialogWithConfirmationTrigger,
};

