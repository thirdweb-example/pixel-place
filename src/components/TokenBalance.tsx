import { toEther } from "thirdweb";
import { useTokenBalance } from "@/hooks/useTokenBalance";

export function TokenBalance({ walletAddress }: { walletAddress: string }) {
  const balanceQuery = useTokenBalance(walletAddress);

  if (balanceQuery.isPending) {
    return (
      <div className="text-muted-foreground animate-pulse">Loading...</div>
    );
  }

  if (balanceQuery.isError) {
    return (
      <div className="text-red-400">
        <span>Balance unavailable</span>
      </div>
    );
  }

  return (
    <div className="text-foreground">
      <span>{Number(toEther(BigInt(balanceQuery.data))).toFixed(1)} PXP</span>
    </div>
  );
}
