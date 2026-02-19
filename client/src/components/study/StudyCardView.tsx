import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Flashcard } from "@/components/Flashcard";
import { Button } from "@/components/ui/button";
import type { WordWithProgress } from "@/lib/wordStore";

interface StudyCardViewProps {
  currentWord: WordWithProgress;
  isFlipped: boolean;
  isFirstWord: boolean;
  isLastWord: boolean;
  onFlip: () => void;
  onToggleFavorite: (wordId: number, isFavorite: boolean) => void;
  onMovePrevious: () => void;
  onMoveNext: () => void;
  onMarkUnknown: () => void;
  onMarkKnown: () => void;
}

export function StudyCardView({
  currentWord,
  isFlipped,
  isFirstWord,
  isLastWord,
  onFlip,
  onToggleFavorite,
  onMovePrevious,
  onMoveNext,
  onMarkUnknown,
  onMarkKnown,
}: StudyCardViewProps) {
  return (
    <>
      <div className="relative mb-6 flex flex-1 items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWord.id}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <Flashcard
              word={currentWord}
              isFlipped={isFlipped}
              onFlip={onFlip}
              onToggleFavorite={onToggleFavorite}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-3 pb-3">
        <Button
          type="button"
          variant="secondary"
          className="h-12 rounded-xl font-semibold"
          onClick={onMovePrevious}
          disabled={isFirstWord}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-12 rounded-xl font-semibold"
          onClick={onMoveNext}
          disabled={isLastWord}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 pb-4">
        <Button
          type="button"
          variant="outline"
          className="h-16 rounded-2xl border-2 text-lg font-semibold transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          onClick={onMarkUnknown}
        >
          <X className="mr-2 h-5 w-5" />
          Unknown
        </Button>
        <Button
          type="button"
          variant="default"
          className="h-16 rounded-2xl bg-green-600 text-lg font-semibold text-white shadow-lg shadow-green-200 hover:bg-green-700"
          onClick={onMarkKnown}
        >
          <Check className="mr-2 h-5 w-5" />
          I Know It
        </Button>
      </div>
    </>
  );
}
