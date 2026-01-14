import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/Home";
import DayList from "@/pages/DayList";
import DayDetail from "@/pages/DayDetail";
import StudyMode from "@/pages/StudyMode";
import QuizMode from "@/pages/QuizMode";
import NotFound from "@/pages/not-found";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/level/:level/days" component={DayList} />
      <Route path="/level/:level/days/:day" component={DayDetail} />
      <Route path="/level/:level/days/:day/study" component={StudyMode} />
      <Route path="/level/:level/days/:day/quiz" component={QuizMode} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <AppRouter />
        </TooltipProvider>
      </QueryClientProvider>
    </WouterRouter>
  );
}

export default App;
