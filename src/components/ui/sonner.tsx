import { useEffect } from "react";
import { toast, Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  useEffect(() => {
    let lastToastTime = 0;

    const handlePointerDown = (e: MouseEvent) => {
      // If toast exists and user clicks anywhere outside after 200ms of trigger, dismiss it instantly
      const target = e.target as HTMLElement | null;
      if (target?.closest("[data-sonner-toast]")) {
        toast.dismiss();
        return;
      }
      if (Date.now() - lastToastTime > 250) {
        toast.dismiss();
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  return (
    <Sonner
      className="toaster group"
      duration={2000}
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast cursor-pointer group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
