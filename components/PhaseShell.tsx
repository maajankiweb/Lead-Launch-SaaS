"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

export function PhaseShell({
  title,
  subtitle,
  children,
  onPrev,
  onNext,
  nextLabel = "Next phase",
  nextDisabled = false,
  prevDisabled = false,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onPrev?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  prevDisabled?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="max-w-7xl mx-auto px-4 sm:px-6 pb-32"
    >
      <header className="mb-6 sm:mb-10">
        <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl text-foreground leading-[1.1] tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-2 sm:mt-4 text-xs sm:text-base max-w-2xl leading-relaxed">{subtitle}</p>
      </header>
      <div>{children}</div>
      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/90 backdrop-blur-lg pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={onPrev}
            disabled={prevDisabled || !onPrev}
            aria-label="Go to previous phase"
            className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm"
          >
            <ChevronLeft className="h-4 w-4 mr-1 sm:mr-1.5" strokeWidth={1.75} /> Back
          </Button>
          <Button
            onClick={onNext}
            disabled={nextDisabled || !onNext}
            aria-label={nextLabel}
            className="h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm transition-transform duration-150 active:scale-[0.98]"
          >
            {nextLabel} <ChevronRight className="h-4 w-4 ml-1 sm:ml-1.5" strokeWidth={1.75} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
