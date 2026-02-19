import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { LayoutGrid, List } from "lucide-react";
import { Layout } from "@/components/Layout";
import { StudyCardView } from "@/components/study/StudyCardView";
import { StudyCompletedPanel } from "@/components/study/StudyCompletedPanel";
import { StudyScreenState } from "@/components/study/StudyScreenState";
import { StudyWordList } from "@/components/study/StudyWordList";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useWordsByDay, useUpdateProgress } from "@/hooks/use-words";

type StudyViewMode = "card" | "list";

export default function StudyMode() {
  const [, params] = useRoute("/level/:level/days/:day/study");
  const level = Number.parseInt(params?.level ?? "800", 10);
  const day = Number.parseInt(params?.day ?? "1", 10);
  const { data: words, isLoading } = useWordsByDay(level, day);
  const updateProgress = useUpdateProgress();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [viewMode, setViewMode] = useState<StudyViewMode>("card");

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompleted(false);
    setViewMode("card");
  }, [level, day]);

  if (isLoading || !words) return <StudyScreenState day={day} mode="loading" />;

  if (words.length === 0) return <StudyScreenState day={day} mode="empty" />;

  const currentWord = words[currentIndex];
  const isFirstWord = currentIndex === 0;
  const isLastWord = currentIndex === words.length - 1;
  const isListView = viewMode === "list";
  const progressPercent = (currentIndex / words.length) * 100;

  const handleToggleFavorite = (wordId: number, isFavorite: boolean) => {
    const targetWord = words.find((word) => word.id === wordId);
    if (!targetWord) return;
    updateProgress.mutate({ wordId, isKnown: targetWord.isKnown, isFavorite });
  };

  const handleMovePrevious = () => {
    if (isFirstWord) return;
    setCurrentIndex((prev) => prev - 1);
    setIsFlipped(false);
  };

  const handleMoveNext = () => {
    if (isLastWord) return;
    setCurrentIndex((prev) => prev + 1);
    setIsFlipped(false);
  };

  const handleMarkResult = (isKnown: boolean) => {
    updateProgress.mutate({
      wordId: currentWord.id,
      isKnown,
      isFavorite: currentWord.isFavorite,
    });
    setIsFlipped(false);
    if (isLastWord) {
      setCompleted(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
  };

  if (completed) {
    return (
      <Layout showBack title="Day Completed">
        <StudyCompletedPanel
          day={day}
          totalWords={words.length}
          onRestart={() => {
            setCompleted(false);
            setCurrentIndex(0);
          }}
        />
      </Layout>
    );
  }

  return (
    <Layout
      showBack
      title={`Day ${day} Study`}
      rightAction={
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 rounded-full px-2 text-xs font-semibold"
          onClick={() => setViewMode((prev) => (prev === "card" ? "list" : "card"))}
        >
          {isListView ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}
          {isListView ? "카드 보기" : "리스트 보기"}
        </Button>
      }
    >
      <div className="mx-auto flex h-full max-w-md flex-col">
        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>Progress</span>
            <span>{currentIndex + 1} / {words.length}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {isListView ? (
          <div className="flex-1 space-y-3">
            <p className="text-xs text-muted-foreground">단어를 누르면 카드로 바로 이동합니다.</p>
            <StudyWordList
              words={words}
              currentIndex={currentIndex}
              onSelectWord={(index) => {
                setCurrentIndex(index);
                setIsFlipped(false);
                setViewMode("card");
              }}
            />
          </div>
        ) : (
          <StudyCardView
            currentWord={currentWord}
            isFlipped={isFlipped}
            isFirstWord={isFirstWord}
            isLastWord={isLastWord}
            onFlip={() => setIsFlipped((prev) => !prev)}
            onToggleFavorite={handleToggleFavorite}
            onMovePrevious={handleMovePrevious}
            onMoveNext={handleMoveNext}
            onMarkUnknown={() => handleMarkResult(false)}
            onMarkKnown={() => handleMarkResult(true)}
          />
        )}
      </div>
    </Layout>
  );
}
