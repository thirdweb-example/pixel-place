"use server";

import { redirect } from "next/navigation";
import { THIRDWEB_SECRET_KEY } from "@/lib/server-envs";

export async function login(
  origin: string,
): Promise<{ error: string; success: boolean } | null> {
  const authResponse = await fetch(
    `https://api.thirdweb.com/v1/auth/initiate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret-key": THIRDWEB_SECRET_KEY,
      },
      body: JSON.stringify({
        method: "oauth",
        provider: "x",
        redirectUrl: `${origin}/api/auth/callback`,
      }),
    },
  );

  if (!authResponse.ok) {
    return {
      error: "Failed to initiate authentication",
      success: false,
    };
  }

  const json = await authResponse.json();

  // redirects to https://embedded-wallet.thirdweb.com/api/...
  // which then shows a twitter login page
  // that page redirects to `${origin}/api/auth/callback` on login success
  redirect(json.redirectUrl);
}
