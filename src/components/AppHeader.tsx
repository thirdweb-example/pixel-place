import { ExternalLinkIcon, ScanIcon } from "lucide-react";
import { TwitterXIcon } from "@/app/icons/twitter";
import { InfoModal } from "@/components/InfoModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TwitterLoginButton } from "@/components/TwitterLoginButton";
import { UserDropdown } from "@/components/UserDropdown";
import type { User } from "@/lib/get-user";
import {
  NEXT_PUBLIC_TOKEN_ADDRESS,
  NEXT_PUBLIC_TOKEN_CHAIN_ID,
} from "../lib/public-envs";
import { Button } from "./ui/button";

export function AppHeader({
  user,
  onLogout,
}: {
  user: User | null;
  onLogout: () => void;
}) {
  return (
    <div className="bg-background border-b py-4 px-4 relative z-10">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3">
            <ScanIcon className="size-5 hidden md:block" />
            <h1 className="text-2xl font-bold tracking-tight">Pixel Place</h1>
          </div>
          <InfoModal />
        </div>

        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            className="h-9 rounded-full hidden md:flex"
          >
            <a
              href={`http://thirdweb.com/${NEXT_PUBLIC_TOKEN_CHAIN_ID}/${NEXT_PUBLIC_TOKEN_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              PXP Token
              <ExternalLinkIcon className="size-3 text-muted-foreground" />
            </a>
          </Button>
          <ThemeToggle />
          {user ? (
            <UserDropdown
              user={{
                username: user.username,
                picture: user.picture,
                walletAddress: user.walletAddress,
              }}
              onLogout={onLogout}
            />
          ) : (
            <TwitterLoginButton icon={TwitterXIcon} label="Sign in" />
          )}
        </div>
      </header>
    </div>
  );
}
