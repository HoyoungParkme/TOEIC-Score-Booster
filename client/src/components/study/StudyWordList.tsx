import { Badge } from "@/components/ui/badge";
import type { WordWithProgress } from "@/lib/wordStore";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StudyWordListProps {
  words: WordWithProgress[];
  currentIndex: number;
  onSelectWord: (index: number) => void;
}

export function StudyWordList({
  words,
  currentIndex,
  onSelectWord,
}: StudyWordListProps) {
  if (words.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 text-center text-sm text-muted-foreground">
        표시할 단어가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-4">
      {words.map((word, index) => {
        const isCurrent = index === currentIndex;
        return (
          <button
            key={word.id}
            type="button"
            onClick={() => onSelectWord(index)}
            className={cn(
              "w-full rounded-2xl border bg-white px-4 py-3 text-left transition-colors",
              "hover:border-primary/40 hover:bg-primary/5",
              isCurrent && "border-primary bg-primary/5",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {index + 1} / {words.length}
                </p>
                <p className="truncate text-lg font-bold text-foreground">
                  {word.word}
                </p>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {word.meaningKo}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {word.isFavorite && (
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                )}
                <Badge
                  variant={word.isKnown ? "default" : "secondary"}
                  className={cn(!word.isKnown && "text-muted-foreground")}
                >
                  {word.isKnown ? "Known" : "Unknown"}
                </Badge>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
