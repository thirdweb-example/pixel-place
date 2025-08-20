import type { UserSession } from "@/lib/supabase";

interface GridInfoOverlayProps {
  onlineUsers: UserSession[];
  isLoading: boolean;
  error: string | null;
}

export function GridInfoOverlay({
  onlineUsers,
  isLoading,
  error,
}: GridInfoOverlayProps) {
  return (
    <div className="absolute top-4 right-4 space-y-3">
      <div className="bg-card/80 backdrop-blur-sm text-card-foreground rounded-lg p-3 border">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Active Players</span>
        </div>

        <div className="text-xs text-muted-foreground">
          {isLoading ? (
            <span className="animate-pulse">Loading...</span>
          ) : error ? (
            <span className="text-red-400">Error</span>
          ) : (
            `${onlineUsers.length} active`
          )}
        </div>

        {/* User List */}
        {!isLoading && !error && (
          <>
            {onlineUsers.length > 0 ? (
              <div className="mt-2 space-y-1 max-h-32 overflow-y-auto no-scrollbar">
                {onlineUsers.map((user) => (
                  <div
                    key={user.user_id}
                    className="flex items-center gap-2 text-xs rounded hover:bg-muted/50 transition-colors"
                  >
                    <div className="size-1.5 bg-green-400 rounded-full flex-shrink-0"></div>
                    <a
                      href={`https://x.com/${user.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate flex-1"
                    >
                      {user.username}
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2 text-xs text-muted-foreground">
                No users online
              </div>
            )}
          </>
        )}

        {error && <div className="text-xs text-red-400 mt-1">{error}</div>}
      </div>
    </div>
  );
}
