import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useWordsByDay, useSubmitQuiz } from "@/hooks/use-words";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, ArrowRight, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WordWithProgress } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

export default function QuizMode() {
  const [match, params] = useRoute("/level/:level/days/:day/quiz");
  const [, setLocation] = useLocation();
  const level = parseInt(params?.level || "800");
  const day = parseInt(params?.day || "1");

  const { data: words, isLoading } = useWordsByDay(level, day);
  const submitQuiz = useSubmitQuiz();

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongWords, setWrongWords] = useState<number[]>([]);
  const [quizState, setQuizState] = useState<'intro' | 'active' | 'finished'>('intro');
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null);

  // Initialize Quiz
  const startQuiz = () => {
    if (!words) return;
    
    // Shuffle words and pick 10 (or less if not enough)
    const shuffled = [...words].sort(() => 0.5 - Math.random()).slice(0, 10);
    
    // Generate questions
    const generatedQuestions = shuffled.map(word => {
      const type = Math.random() > 0.5 ? 'multiple-choice' : 'typing';
      
      // For multiple choice, get 3 random wrong answers
      const wrongOptions = words
        .filter(w => w.id !== word.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(w => w.meaningKo);
        
      const options = [...wrongOptions, word.meaningKo].sort(() => 0.5 - Math.random());

      return {
        word,
        type,
        options
      };
    });

    setQuestions(generatedQuestions);
    setQuizState('active');
    setScore(0);
    setCurrentQIndex(0);
    setWrongWords([]);
  };

  const handleAnswer = (answer: string) => {
    const currentQ = questions[currentQIndex];
    let isCorrect = false;

    if (currentQ.type === 'multiple-choice') {
      isCorrect = answer === currentQ.word.meaningKo;
      setSelectedChoice(answer);
    } else {
      isCorrect = answer.toLowerCase().trim() === currentQ.word.word.toLowerCase().trim();
    }

    if (isCorrect) {
      setScore(s => s + 1);
      setShowFeedback('correct');
    } else {
      setWrongWords(prev => [...prev, currentQ.word.id]);
      setShowFeedback('incorrect');
    }

    // Wait a bit then move to next
    setTimeout(() => {
      setShowFeedback(null);
      setSelectedChoice(null);
      setUserAnswer("");
      
      if (currentQIndex < questions.length - 1) {
        setCurrentQIndex(prev => prev + 1);
      } else {
        finishQuiz();
      }
    }, 1500);
  };

  const finishQuiz = () => {
    setQuizState('finished');
    submitQuiz.mutate({
      level,
      score: score + (showFeedback === 'correct' ? 1 : 0), // Add last point if correct
      totalQuestions: questions.length,
      wrongWordIds: wrongWords
    });
  };

  if (isLoading) return <Layout showBack title="Loading Quiz..."><div className="p-8 text-center">Preparing...</div></Layout>;

  // INTRO SCREEN
  if (quizState === 'intro') {
    return (
      <Layout showBack title={`Day ${day} Quiz`}>
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
          <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
            <Trophy className="w-16 h-16 text-primary" />
          </div>
          <h2 className="text-3xl font-bold font-display">Test Your Skills</h2>
          <p className="text-muted-foreground">
            10 questions from Day {day}. Mixed format: typing & multiple choice.
          </p>
          <Button onClick={startQuiz} size="xl" className="w-full max-w-xs rounded-full mt-8 text-lg font-semibold">
            Start Quiz
          </Button>
        </div>
      </Layout>
    );
  }

  // RESULTS SCREEN
  if (quizState === 'finished') {
    return (
      <Layout showBack title="Quiz Results">
        <div className="space-y-8 text-center py-8">
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-border">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Your Score</span>
            <div className="text-6xl font-black text-primary my-4">{Math.round((score / questions.length) * 100)}%</div>
            <p className="text-lg font-medium text-gray-600">{score} out of {questions.length} correct</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg text-left px-2">Words to Review</h3>
            {wrongWords.length === 0 ? (
              <div className="p-6 bg-green-50 text-green-700 rounded-xl border border-green-200">
                Perfect score! No words to review.
              </div>
            ) : (
              <div className="space-y-2">
                {questions
                  .filter(q => wrongWords.includes(q.word.id))
                  .map(q => (
                    <div key={q.word.id} className="bg-white p-4 rounded-xl border flex justify-between items-center">
                      <div className="text-left">
                        <div className="font-bold text-red-600">{q.word.word}</div>
                        <div className="text-sm text-gray-500">{q.word.meaningKo}</div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs">Review</Button>
                    </div>
                  ))}
              </div>
            )}
          </div>
          
          <Button onClick={() => setLocation(`/level/${level}/days`)} className="w-full rounded-full" size="lg">
            Back to Days
          </Button>
        </div>
      </Layout>
    );
  }

  const currentQ = questions[currentQIndex];

  // ACTIVE QUIZ SCREEN
  return (
    <Layout title={`Question ${currentQIndex + 1}/${questions.length}`}>
      <div className="max-w-md mx-auto h-full flex flex-col justify-between py-4">
        <div className="flex-1 flex flex-col justify-center space-y-8">
          
          {/* Question Card */}
          <div className="text-center space-y-6">
            <span className="inline-block px-3 py-1 rounded-full bg-secondary text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {currentQ.type === 'multiple-choice' ? 'Select Meaning' : 'Type Word'}
            </span>
            <h2 className="text-4xl font-bold font-display text-foreground">
              {currentQ.type === 'multiple-choice' ? currentQ.word.word : currentQ.word.meaningKo}
            </h2>
          </div>

          {/* Feedback Overlay */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "absolute inset-0 z-10 rounded-3xl flex items-center justify-center backdrop-blur-sm",
                  showFeedback === 'correct' ? "bg-green-500/20" : "bg-red-500/20"
                )}
              >
                <div className={cn(
                  "p-6 rounded-full shadow-2xl scale-150",
                  showFeedback === 'correct' ? "bg-green-500 text-white" : "bg-red-500 text-white"
                )}>
                  {showFeedback === 'correct' ? <CheckCircle className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Area */}
          <div className="w-full">
            {currentQ.type === 'multiple-choice' ? (
              <div className="grid gap-3">
                {currentQ.options.map((option: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => !showFeedback && handleAnswer(option)}
                    disabled={!!showFeedback}
                    className={cn(
                      "w-full p-4 text-left rounded-xl border-2 transition-all font-medium text-lg",
                      selectedChoice === option 
                        ? (showFeedback === 'correct' ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700")
                        : "border-gray-100 bg-white hover:border-primary/50 hover:bg-slate-50"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <Input 
                  autoFocus
                  placeholder="Type the English word..."
                  value={userAnswer}
                  onChange={e => setUserAnswer(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !showFeedback && handleAnswer(userAnswer)}
                  className="h-14 text-lg text-center font-bold rounded-xl border-2 focus-visible:ring-0 focus-visible:border-primary"
                  disabled={!!showFeedback}
                />
                <Button 
                  onClick={() => handleAnswer(userAnswer)} 
                  disabled={!userAnswer || !!showFeedback}
                  className="w-full h-12 rounded-xl text-lg"
                >
                  Check Answer <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
