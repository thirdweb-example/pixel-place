import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error?: string;
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="min-h-dvh bg-background text-foreground dark flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md mx-auto p-6">
        <div className="text-red-500 text-6xl">⚠️</div>
        <h1 className="text-2xl font-bold">Connection Error</h1>
        <p className="text-muted-foreground">
          {error ||
            "Failed to load the data. Please check your connection and try again."}
        </p>
        <Button onClick={() => window.location.reload()}>
          Retry Connection
        </Button>
      </div>
    </div>
  );
}
