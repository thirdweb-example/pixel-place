"use server";

import { toWei } from "thirdweb";
import { getUser } from "@/lib/get-user";
import {
  NEXT_PUBLIC_TOKEN_ADDRESS,
  NEXT_PUBLIC_TOKEN_CHAIN_ID,
} from "../lib/public-envs";
import { THIRDWEB_SECRET_KEY } from "../lib/server-envs";

interface WithdrawTokensParams {
  walletAddress: string;
  amount: number;
}

interface WithdrawTokensResult {
  success: boolean;
  error?: string;
}

export async function withdrawTokens(
  params: WithdrawTokensParams,
): Promise<WithdrawTokensResult> {
  try {
    const { user, authToken } = await getUser();
    if (!user) {
      return {
        success: false,
        error: "Invalid or expired authentication token",
      };
    }

    // Call thirdweb API to send tokens
    const response = await fetch(
      "https://api.thirdweb.com/v1/contracts/write",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-secret-key": THIRDWEB_SECRET_KEY,
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          chainId: NEXT_PUBLIC_TOKEN_CHAIN_ID,
          from: user.walletAddress,
          calls: [
            {
              contractAddress: NEXT_PUBLIC_TOKEN_ADDRESS,
              method: "function transfer(address to, uint256 amount)",
              params: [
                params.walletAddress,
                toWei(params.amount.toString()).toString(),
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      return {
        success: false,
        error: await response.text(),
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Withdrawal preparation error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to prepare withdrawal",
    };
  }
}
