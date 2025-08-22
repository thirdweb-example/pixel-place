import { toWei } from "thirdweb/utils";
import { THIRDWEB_SECRET_KEY } from "@/lib/server-envs";
import {
  NEXT_PUBLIC_THIRDWEB_SERVER_WALLET_ADDRESS,
  NEXT_PUBLIC_TOKEN_ADDRESS,
  NEXT_PUBLIC_TOKEN_CHAIN_ID,
} from "./public-envs";

interface TokenDistributionParams {
  walletAddress: string;
  pixelCount: number;
}

interface TokenDistributionResult {
  success: boolean;
  rewardAmountTokens?: number;
  transactionHash?: string;
  error?: string;
}

export async function transferTokens({
  walletAddress,
  pixelCount,
}: TokenDistributionParams): Promise<TokenDistributionResult> {
  try {
    const rewardAmount = toWei(pixelCount.toString()); // 1 token per pixel

    // Call thirdweb API to send tokens
    const contractWriteResponse = await fetch(
      "https://api.thirdweb.com/v1/contracts/write",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-secret-key": THIRDWEB_SECRET_KEY,
        },
        body: JSON.stringify({
          chainId: NEXT_PUBLIC_TOKEN_CHAIN_ID,
          from: NEXT_PUBLIC_THIRDWEB_SERVER_WALLET_ADDRESS,
          calls: [
            {
              contractAddress: NEXT_PUBLIC_TOKEN_ADDRESS,
              method: "function transfer(address to, uint256 amount)",
              params: [walletAddress, rewardAmount.toString()],
            },
          ],
        }),
      },
    );

    if (!contractWriteResponse.ok) {
      const errorData = await contractWriteResponse.json();
      throw new Error(
        `Contract Write API error: ${errorData.message || contractWriteResponse.statusText}`,
      );
    }

    const result = await contractWriteResponse.json();

    return {
      success: true,
      rewardAmountTokens: pixelCount,
      transactionHash: result.transactionHash,
    };
  } catch (error) {
    console.error("Token transfer error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to transfer coins",
    };
  }
}
