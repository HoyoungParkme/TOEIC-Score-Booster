import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Star } from "lucide-react";
import type { WordWithProgress } from "@shared/schema";
import { cn } from "@/lib/utils";

interface FlashcardProps {
  word: WordWithProgress;
  onToggleFavorite: (wordId: number, isFavorite: boolean) => void;
  isFlipped: boolean;
  onFlip: () => void;
}

export function Flashcard({ word, onToggleFavorite, isFlipped, onFlip }: FlashcardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = 'en-US';
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(word.id, !word.isFavorite);
  };

  return (
    <div 
      className="w-full aspect-[4/5] relative perspective-1000 cursor-pointer group"
      onClick={onFlip}
    >
      <motion.div
        className="w-full h-full relative transform-style-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Front Face */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-3xl shadow-xl border border-border/50 flex flex-col items-center justify-center p-8">
          <div className="absolute top-6 right-6 z-10">
            <button 
              onClick={handleFavorite}
              className={cn(
                "p-3 rounded-full transition-all hover:bg-yellow-50 active:scale-90",
                word.isFavorite ? "text-yellow-400 fill-current" : "text-gray-300 hover:text-yellow-400"
              )}
            >
              <Star className="w-6 h-6" />
            </button>
          </div>
          
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold font-display text-primary tracking-tight">
              {word.word}
            </h2>
            <button
              onClick={handleSpeak}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                isSpeaking 
                  ? "bg-primary text-primary-foreground ring-4 ring-primary/20" 
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              <Volume2 className={cn("w-4 h-4", isSpeaking && "animate-pulse")} />
              Listen
            </button>
          </div>
          
          <p className="absolute bottom-8 text-sm text-muted-foreground font-medium animate-pulse">
            Tap to reveal meaning
          </p>
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-slate-900 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-white">
          <div className="absolute top-6 right-6 z-10">
            <button 
              onClick={handleFavorite}
              className={cn(
                "p-3 rounded-full transition-all hover:bg-white/10 active:scale-90",
                word.isFavorite ? "text-yellow-400 fill-current" : "text-white/30 hover:text-yellow-400"
              )}
            >
              <Star className="w-6 h-6" />
            </button>
          </div>

          <div className="text-center space-y-6 w-full">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-white/50 font-bold">Meaning</span>
              <h3 className="text-2xl md:text-3xl font-bold leading-tight">
                {word.meaningKo}
              </h3>
            </div>

            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto" />

            {(word.exampleEn || word.exampleKo) && (
              <div className="text-left bg-white/10 rounded-xl p-4 space-y-3 w-full backdrop-blur-sm">
                {word.exampleEn && (
                  <p className="text-lg font-medium leading-snug text-white/90">
                    "{word.exampleEn}"
                  </p>
                )}
                {word.exampleKo && (
                  <p className="text-sm text-white/60 font-light">
                    {word.exampleKo}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
