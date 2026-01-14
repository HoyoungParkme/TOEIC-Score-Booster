import { Link, useLocation } from "wouter";
import { ChevronLeft, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  className?: string;
}

export function Layout({ 
  children, 
  title, 
  showBack = false, 
  rightAction,
  className 
}: LayoutProps) {
  const [location, setLocation] = useLocation();

  /**
   * 현재 경로를 기준으로 뒤로가기 실패 시 사용할 경로를 계산합니다.
   */
  const getFallbackPath = (path: string): string => {
    const dayDetailMatch = path.match(/^\/level\/(\d+)\/days\/(\d+)(?:\/(study|quiz))?$/);
    if (dayDetailMatch) {
      const [, level, day, mode] = dayDetailMatch;
      if (mode) {
        return `/level/${level}/days/${day}`;
      }
      return `/level/${level}/days`;
    }

    const dayListMatch = path.match(/^\/level\/(\d+)\/days$/);
    if (dayListMatch) {
      return "/";
    }

    return "/";
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    setLocation(getFallbackPath(location));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-border/50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center justify-between transition-all">
        <div className="flex items-center gap-2">
          {showBack ? (
            <button
              type="button"
              onClick={handleBack}
              className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : (
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-muted text-primary transition-colors">
              <Home className="w-5 h-5" />
            </Link>
          )}
          {title && (
            <h1 className="font-display font-semibold text-lg tracking-tight animate-enter">
              {title}
            </h1>
          )}
        </div>
        <div>
          {rightAction}
        </div>
      </header>

      {/* Main Content */}
      <main className={cn("flex-1 p-4 overflow-y-auto no-scrollbar", className)}>
        {children}
      </main>

      {/* Optional: Bottom Navigation could go here if app expands */}
    </div>
  );
}
