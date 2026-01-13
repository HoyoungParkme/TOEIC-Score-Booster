import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-bold mb-4 font-display">404</h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-xs mx-auto">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Link href="/" className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors">
          Return Home
        </Link>
      </div>
    </Layout>
  );
}
