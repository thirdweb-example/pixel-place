import { ExternalLinkIcon, HelpCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { COOLDOWN_TIMER } from "@/constants";
import {
  NEXT_PUBLIC_TOKEN_ADDRESS,
  NEXT_PUBLIC_TOKEN_CHAIN_ID,
} from "../lib/public-envs";

export function InfoModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="size-8 p-0">
          <HelpCircleIcon className="size-5 text-muted-foreground" />
          <span className="sr-only">App Information</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            About Pixel Place
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium text-base">How to Play</h3>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <p>
                <strong>Pixel Place</strong> is a realtime collaborative digital
                artwork
              </p>

              <p>
                As a participation reward,{" "}
                <span className="text-foreground">
                  you get 1 PXP coin for every pixel you place.
                </span>{" "}
                You can place a pixel every {Math.ceil(COOLDOWN_TIMER / 1000)}{" "}
                seconds
              </p>

              <p>You must login with Twitter to place pixels.</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-base">Game Features</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>You can zoom in/out to see the full canvas</p>

              <p>
                You can click on a pixel to see the username of the player who
                placed it.
              </p>

              <p>
                You can place a pixel on any cell - empty or already colored. If
                you place a pixel on an already colored cell, the color of that
                cell will be replaced with the new color.
              </p>

              <p>
                The canvas updates in real-time. When you place a pixel, it
                appears in real-time to all other players.
              </p>

              <p>
                You can see the list of all active players on top right corner.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-base">Withdrawing Coins</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                A wallet is generated for you when you login and all coins are
                sent to this wallet. You can withdraw these coins at any time to
                any other wallet. Click on your username on top right corner and
                use the Withdraw feature.
              </p>
            </div>
          </div>

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
              View PXP coin
              <ExternalLinkIcon className="size-3 text-muted-foreground" />
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
