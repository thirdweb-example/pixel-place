export function LoadingState() {
  return (
    <div className="min-h-dvh bg-background text-foreground dark flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-lg">Loading</p>
      </div>
    </div>
  );
}
