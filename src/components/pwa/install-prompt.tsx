import { AnimatePresence, motion } from "motion/react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/hooks/use-pwa";

/** Bottom-sheet style install invite, shown once until dismissed. */
export function InstallPrompt() {
  const { canInstall, isIos, installed, dismissed, install, dismiss } = useInstallPrompt();
  const visible = !installed && !dismissed && (canInstall || isIos);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed inset-x-3 bottom-20 z-50 mx-auto max-w-md surface-card/95 p-4 shadow-2xl backdrop-blur-xl lg:bottom-6 lg:left-auto lg:right-6 lg:mx-0"
          role="dialog"
          aria-label="Install CanteenOS"
        >
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Download className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">Install CanteenOS</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {isIos && !canInstall ? (
                  <>
                    Tap <Share className="inline size-3" /> Share, then “Add to Home Screen” for the
                    full-screen app.
                  </>
                ) : (
                  "Get the full-screen app with offline ordering and instant launches."
                )}
              </p>
              {canInstall ? (
                <Button size="sm" className="mt-3 rounded-xl" onClick={() => void install()}>
                  Install app
                </Button>
              ) : null}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              aria-label="Dismiss install prompt"
              onClick={dismiss}
            >
              <X className="size-4" />
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
