import { useQuery } from "@tanstack/react-query";

async function fetchTokenBalance(walletAddress: string): Promise<string> {
  const response = await fetch("https://api.thirdweb.com/v1/contracts/read", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
    },
    body: JSON.stringify({
      chainId: process.env.NEXT_PUBLIC_TOKEN_CHAIN_ID,
      calls: [
        {
          contractAddress: process.env.NEXT_PUBLIC_TOKEN_ADDRESS,
          method: "function balanceOf(address owner) view returns (uint256)",
          params: [walletAddress],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Thirdweb API error: ${errorData.message || response.statusText}`,
    );
  }

  const data = (await response.json()) as {
    result: Array<{
      data: string;
    }>;
  };

  return data.result[0].data;
}

export function useTokenBalance(walletAddress: string) {
  return useQuery({
    queryKey: ["tokenBalance", walletAddress],
    queryFn: () => fetchTokenBalance(walletAddress),
    enabled: !!walletAddress,
  });
}
