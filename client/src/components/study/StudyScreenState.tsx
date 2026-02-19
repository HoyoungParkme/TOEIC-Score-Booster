import { Layout } from "@/components/Layout";

interface StudyScreenStateProps {
  day: number;
  mode: "loading" | "empty";
}

export function StudyScreenState({ day, mode }: StudyScreenStateProps) {
  if (mode === "loading") {
    return (
      <Layout showBack title={`Studying Day ${day}`}>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="font-medium text-muted-foreground">Loading your cards...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBack title={`Day ${day} Study`}>
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">학습할 단어가 없습니다.</p>
      </div>
    </Layout>
  );
}
