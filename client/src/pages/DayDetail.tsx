import { useRoute, Link } from "wouter";
import { Layout } from "@/components/Layout";
import { Brain, Layers, BookOpenCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function DayDetail() {
  const [match, params] = useRoute("/level/:level/days/:day");
  const level = parseInt(params?.level || "800");
  const day = parseInt(params?.day || "1");

  return (
    <Layout showBack title={`Day ${day}`}>
      <div className="space-y-8 py-8 h-full flex flex-col justify-center">
        <div className="text-center space-y-2 mb-8">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpenCheck className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold font-display">Ready to learn?</h2>
          <p className="text-muted-foreground">Choose your mode for Day {day}</p>
        </div>

        <div className="grid gap-4 max-w-sm mx-auto w-full">
          <Link href={`/level/${level}/days/${day}/study`}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white p-6 rounded-2xl shadow-lg border-2 border-transparent hover:border-primary/20 cursor-pointer flex items-center gap-6 group"
            >
              <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Layers className="w-7 h-7" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-900">Flashcards</h3>
                <p className="text-sm text-gray-500">Memorize words with cards</p>
              </div>
            </motion.div>
          </Link>

          <Link href={`/level/${level}/days/${day}/quiz`}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white p-6 rounded-2xl shadow-lg border-2 border-transparent hover:border-indigo/20 cursor-pointer flex items-center gap-6 group"
            >
              <div className="w-14 h-14 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Brain className="w-7 h-7" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-900">Quiz Mode</h3>
                <p className="text-sm text-gray-500">Test your knowledge</p>
              </div>
            </motion.div>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
