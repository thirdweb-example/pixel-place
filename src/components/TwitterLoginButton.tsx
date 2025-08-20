"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { login } from "@/actions/login";
import { RainbowButton } from "./magicui/rainbow-button";

export function TwitterLoginButton(props: {
  icon: React.FC<{ className?: string }>;
  label: string;
}) {
  const loginMutation = useMutation({
    mutationFn: login,
  });

  return (
    <RainbowButton
      className="rounded-full gap-2"
      onClick={async () => {
        try {
          const result = await loginMutation.mutateAsync(
            window.location.origin,
          );
          if (result?.error) {
            toast.error("Failed to login", {
              description: result.error,
            });
          }
        } catch (e) {
          toast.error("Failed to login", {
            description: e instanceof Error ? e.message : undefined,
          });
        }
      }}
    >
      {loginMutation.isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <props.icon className="size-4" />
      )}
      {props.label}
    </RainbowButton>
  );
}
