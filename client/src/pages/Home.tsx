import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { ArrowRight, Trophy, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <Layout>
      <div className="space-y-8 py-8">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-display font-bold text-foreground">
            Vocab Master
          </h1>
          <p className="text-muted-foreground text-lg max-w-[280px] mx-auto text-balance">
            Master your TOEIC vocabulary one day at a time.
          </p>
        </div>

        <div className="grid gap-6">
          <LevelCard 
            level={800} 
            color="bg-blue-500" 
            label="TOEIC 800" 
            description="Essential vocabulary for high scores"
            delay={0}
          />
          <LevelCard 
            level={900} 
            color="bg-indigo-600" 
            label="TOEIC 900" 
            description="Advanced words for perfectionists"
            delay={0.1}
          />
        </div>

        <div className="mt-12 p-6 rounded-2xl bg-secondary/50 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold text-lg">Daily Streak</h3>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex gap-1">
              {[...Array(7)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-8 h-10 rounded-md flex items-center justify-center text-xs font-bold ${i < 4 ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground border border-border'}`}
                >
                  {['M','T','W','T','F','S','S'][i]}
                </div>
              ))}
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold font-display">4</span>
              <span className="text-sm text-muted-foreground ml-1">days</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function LevelCard({ level, color, label, description, delay }: { level: number, color: string, label: string, description: string, delay: number }) {
  return (
    <Link href={`/level/${level}/days`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className={`relative overflow-hidden group rounded-3xl p-8 cursor-pointer shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 ${color}`}
      >
        <div className="relative z-10 text-white space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold font-display tracking-tight mb-1">{label}</h2>
            <p className="text-white/80 font-medium">{description}</p>
          </div>
          <div className="flex items-center gap-2 font-semibold text-sm bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-sm group-hover:bg-white group-hover:text-primary transition-colors">
            Start Learning <ArrowRight className="w-4 h-4" />
          </div>
        </div>
        
        {/* Decorative circle */}
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
      </motion.div>
    </Link>
  );
}
