import { Clock8Icon, EraserIcon, Loader2, ScanIcon } from "lucide-react";
import { useState } from "react";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { TwitterLoginButton } from "@/components/TwitterLoginButton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToolTipLabel } from "@/components/ui/tooltip";
import { COLOR_PALETTE, COOLDOWN_TIMER } from "@/constants";
import type { User } from "@/lib/get-user";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  user: User | null;
  highlightedCell: { row: number; col: number } | null;
  selectedColor: string | null;
  isUpdating: boolean;
  onColorSelect: (color: string | null) => void;
  onPlacePixel: (type: "place" | "clear") => Promise<boolean>;
}

export function ColorPicker({
  user,
  highlightedCell,
  selectedColor,
  isUpdating,
  onColorSelect,
  onPlacePixel,
}: ColorPickerProps) {
  const { timer, startTimer } = useTimer();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [lastSubmittedType, setLastSubmittedType] = useState<
    "place" | "clear" | null
  >(null);

  if (!user) {
    return (
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <TwitterLoginButton icon={ScanIcon} label="Sign in to place a pixel" />
      </div>
    );
  }

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <ToolTipLabel label={!highlightedCell ? "Select a cell" : undefined}>
          <DropdownMenuTrigger asChild>
            <RainbowButton
              type="button"
              disabled={!highlightedCell || timer !== null}
              className={cn(
                "rounded-full gap-2 disabled:opacity-100 transition-opacity duration-300",
                isDropdownOpen && "opacity-0",
              )}
              variant="default"
            >
              {timer === null ? (
                <>
                  <ScanIcon className="size-4" />
                  Place a pixel
                </>
              ) : (
                <>
                  <Clock8Icon className="size-4 animate-spin" />
                  Wait for {timer} seconds
                </>
              )}
            </RainbowButton>
          </DropdownMenuTrigger>
        </ToolTipLabel>
        <DropdownMenuContent
          className="w-96 p-4 translate-y-10 rounded-l-2xl"
          align="center"
        >
          {/* Color Palette */}
          <div className="flex flex-wrap justify-center gap-3 mb-4 border-b pb-4">
            {COLOR_PALETTE.map((color) => (
              <Button
                key={color}
                onClick={() => {
                  if (selectedColor === color) {
                    onColorSelect(null);
                  } else {
                    onColorSelect(color);
                  }
                }}
                className={cn(
                  "size-8 p-0 relative rounded-full transition-all duration-200 border",
                  selectedColor === color &&
                    "ring-2 ring-primary ring-offset-2 ring-offset-background",
                )}
                style={{ backgroundColor: color }}
              ></Button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Place Pixel Button */}
            <Button
              type="button"
              size="sm"
              onClick={async () => {
                setLastSubmittedType("place");
                const success = await onPlacePixel("place");
                if (success) {
                  startTimer(Math.ceil(COOLDOWN_TIMER / 1000));
                  setIsDropdownOpen(false);
                }
              }}
              variant="default"
            >
              <span className="flex items-center gap-2">
                {isUpdating && lastSubmittedType === "place" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ScanIcon className="size-4" />
                )}
                Place Pixel
              </span>
            </Button>

            {/* Clear Pixel Button */}
            <Button
              type="button"
              size="sm"
              onClick={async () => {
                setLastSubmittedType("clear");
                const success = await onPlacePixel("clear");
                if (success) {
                  startTimer(Math.ceil(COOLDOWN_TIMER / 1000));
                  setIsDropdownOpen(false);
                }
              }}
              variant="outline"
            >
              <span className="flex items-center gap-2">
                {isUpdating && lastSubmittedType === "clear" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <EraserIcon className="size-4 text-muted-foreground" />
                )}
                Clear Pixel
              </span>
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function useTimer() {
  const [timer, setTimer] = useState<number | null>(null);

  function startTimer(seconds: number) {
    setTimer(seconds);
    const intervalId = setInterval(() => {
      setTimer((prev) => {
        if (prev === null) {
          clearInterval(intervalId);
          return null; // keep null
        }

        if (prev <= 0) {
          clearInterval(intervalId);
          return null; // set null
        }

        return prev - 1;
      });
    }, 1000);
  }

  return { timer, startTimer };
}
