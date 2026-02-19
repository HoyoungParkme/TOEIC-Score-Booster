import { Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudyCompletedPanelProps {
  day: number;
  totalWords: number;
  onRestart: () => void;
}

export function StudyCompletedPanel({
  day,
  totalWords,
  onRestart,
}: StudyCompletedPanelProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-6 py-12 text-center">
      <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600 animate-enter">
        <Check className="h-12 w-12" />
      </div>
      <h2 className="font-display text-3xl font-bold">Fantastic!</h2>
      <p className="mx-auto max-w-xs text-lg text-muted-foreground">
        You've reviewed all {totalWords} words for Day {day}.
      </p>
      <div className="pt-8">
        <Button onClick={onRestart} size="lg" className="gap-2 rounded-full px-8">
          <RotateCcw className="h-4 w-4" />
          Study Again
        </Button>
      </div>
    </div>
  );
}
