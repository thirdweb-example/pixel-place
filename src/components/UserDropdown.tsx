/* eslint-disable @next/next/no-img-element */
import { LogOut } from "lucide-react";
import { TokenBalance } from "@/components/TokenBalance";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { CopyButton } from "./ui/CopyButton";
import { WithdrawTokensDialog } from "./WithdrawTokensDialog";

type UserDropdownProps = {
  user: {
    username: string;
    picture: string;
    walletAddress: string;
  };
  onLogout: () => void;
};

export function UserDropdown({ user, onLogout }: UserDropdownProps) {
  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}•••${address.slice(-4)}`;
  };

  const tokenBalanceQuery = useTokenBalance(user.walletAddress);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer px-2 rounded-lg hover:bg-card py-1 relative">
          <img
            src={user.picture}
            alt={user.username}
            className="size-8 rounded-full"
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user.username}</span>
            <div className="text-xs">
              <TokenBalance walletAddress={user.walletAddress} />
            </div>
          </div>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80 p-4 flex flex-col gap-3"
        align="end"
        sideOffset={26}
      >
        {/* User Profile Section */}
        <div className="flex flex-col items-center mb-4 ">
          <img
            src={user.picture}
            alt={user.username}
            className="size-16 rounded-full mb-2"
          />
          <span className="text-sm font-medium text-center">
            @{user.username}
          </span>
        </div>

        {/* Wallet Address  */}
        <div>
          <DropdownMenuLabel className="px-0">Wallet Address</DropdownMenuLabel>
          <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-md">
            <span className="text-sm font-mono flex-1">
              {formatWalletAddress(user.walletAddress)}
            </span>
            <CopyButton
              text={user.walletAddress}
              variant="ghost"
              className="translate-x-2"
              iconClassName="size-3"
            />
          </div>
        </div>

        {/* Token Balance  */}
        <div>
          <DropdownMenuLabel className="px-0">Tokens Earned</DropdownMenuLabel>
          <div className="px-3 py-2 bg-card rounded-md text-sm">
            <TokenBalance walletAddress={user.walletAddress} />
          </div>
        </div>

        {/* Withdraw Button */}
        {tokenBalanceQuery.data && (
          <WithdrawTokensDialog userTokenBalance={tokenBalanceQuery.data} />
        )}

        {/* Logout Button */}
        <DropdownMenuItem onClick={onLogout} asChild>
          <Button variant="outline" className="w-full">
            <LogOut className="size-3.5 text-muted-foreground" />
            Logout
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
