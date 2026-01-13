import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useWordsByDay, useUpdateProgress } from "@/hooks/use-words";
import { Layout } from "@/components/Layout";
import { Flashcard } from "@/components/Flashcard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, X, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function StudyMode() {
  const [match, params] = useRoute("/level/:level/days/:day/study");
  const level = parseInt(params?.level || "800");
  const day = parseInt(params?.day || "1");

  const { data: words, isLoading } = useWordsByDay(level, day);
  const updateProgress = useUpdateProgress();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Pre-filter words that are not known? Or just study all?
  // Let's study all for now, maybe sorted by unknown first could be a future feature.

  useEffect(() => {
    // Reset index ONLY if words array actually changes its length or content substantially,
    // not just because the object reference changed due to react-query re-fetch.
    // However, since we want to prevent resetting to 0 during study, 
    // we should only reset when the day or level actually changes.
  }, [level, day]);

  if (isLoading || !words) {
    return (
      <Layout showBack title={`Studying Day ${day}`}>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">Loading your cards...</p>
        </div>
      </Layout>
    );
  }

  const currentWord = words[currentIndex];
  const progressPercent = ((currentIndex) / words.length) * 100;

  const handleNext = (known: boolean) => {
    // Optimistically update UI
    const isLast = currentIndex === words.length - 1;

    // Trigger mutation
    updateProgress.mutate({
      wordId: currentWord.id,
      isKnown: known,
      isFavorite: currentWord.isFavorite // Keep favorite status
    });

    setIsFlipped(false);

    if (isLast) {
      setCompleted(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleToggleFavorite = (wordId: number, isFavorite: boolean) => {
    updateProgress.mutate({
      wordId,
      isKnown: currentWord.isKnown,
      isFavorite
    });
  };

  if (completed) {
    return (
      <Layout showBack title="Day Completed">
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 animate-enter">
            <Check className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold font-display">Fantastic!</h2>
          <p className="text-muted-foreground text-lg max-w-xs mx-auto">
            You've reviewed all {words.length} words for Day {day}.
          </p>
          <div className="pt-8">
            <Button 
              onClick={() => {
                setCompleted(false);
                setCurrentIndex(0);
              }}
              size="lg"
              className="gap-2 rounded-full px-8"
            >
              <RotateCcw className="w-4 h-4" /> Study Again
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBack title={`Day ${day} Study`}>
      <div className="max-w-md mx-auto h-full flex flex-col">
        {/* Progress Bar */}
        <div className="mb-6 space-y-2">
          <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <span>Progress</span>
            <span>{currentIndex + 1} / {words.length}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Card Area */}
        <div className="flex-1 flex items-center justify-center mb-8 relative">
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
                onFlip={() => setIsFlipped(!isFlipped)}
                onToggleFavorite={handleToggleFavorite}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pb-4">
          <Button 
            variant="outline" 
            size="xl" 
            className="h-16 rounded-2xl border-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors text-lg font-semibold"
            onClick={() => handleNext(false)}
          >
            <X className="mr-2 w-5 h-5" /> Unknown
          </Button>
          <Button 
            variant="default" 
            size="xl" 
            className="h-16 rounded-2xl bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 text-lg font-semibold"
            onClick={() => handleNext(true)}
          >
            <Check className="mr-2 w-5 h-5" /> I Know It
          </Button>
        </div>
      </div>
    </Layout>
  );
}
