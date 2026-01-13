import { useRoute, Link } from "wouter";
import { useDaysList } from "@/hooks/use-words";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DayList() {
  const [match, params] = useRoute("/level/:level/days");
  const level = parseInt(params?.level || "800");
  const { data: days, isLoading } = useDaysList(level);

  if (isLoading) {
    return (
      <Layout showBack title={`Level ${level}`}>
        <div className="grid grid-cols-2 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBack title={`TOEIC ${level} Plan`}>
      <div className="space-y-6">
        <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
          <h2 className="text-xl font-bold text-primary mb-2">Your Progress</h2>
          <div className="w-full bg-white h-3 rounded-full overflow-hidden shadow-inner">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-1000"
              style={{ width: `${days ? (days.reduce((acc, d) => acc + d.known, 0) / days.reduce((acc, d) => acc + d.total, 0)) * 100 : 0}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            {days?.reduce((acc, d) => acc + d.known, 0)} words learned out of {days?.reduce((acc, d) => acc + d.total, 0)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {days?.map((day, index) => (
            <DayCard key={day.day} day={day} level={level} index={index} />
          ))}
        </div>
      </div>
    </Layout>
  );
}

function DayCard({ day, level, index }: { day: any, level: number, index: number }) {
  const progress = Math.round((day.known / day.total) * 100);
  const isComplete = progress === 100;
  
  return (
    <Link href={`/level/${level}/days/${day.day}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05 }}
        className={cn(
          "relative p-5 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex flex-col justify-between aspect-square",
          isComplete 
            ? "bg-green-50 border-green-200 text-green-900" 
            : progress > 0 
              ? "bg-white border-primary/20 hover:border-primary" 
              : "bg-white border-transparent shadow-sm hover:shadow-md"
        )}
      >
        <div className="flex justify-between items-start">
          <span className={cn("text-sm font-bold uppercase tracking-wider", isComplete ? "text-green-600" : "text-muted-foreground")}>
            Day
          </span>
          {isComplete ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <div className="relative w-5 h-5">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={progress > 0 ? "#E2E8F0" : "#F1F5F9"}
                  strokeWidth="4"
                />
                {progress > 0 && (
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="4"
                    strokeDasharray={`${progress}, 100`}
                    className="transition-all duration-1000 ease-out"
                  />
                )}
              </svg>
            </div>
          )}
        </div>
        
        <div>
          <span className="text-4xl font-display font-bold block mb-1">{day.day}</span>
          <span className="text-xs font-medium opacity-80">
            {day.known}/{day.total} words
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
