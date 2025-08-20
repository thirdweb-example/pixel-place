"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowUpRightIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { isAddress, toEther } from "thirdweb/utils";
import { z } from "zod";
import { withdrawTokens } from "@/actions/withdraw";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const withdrawFormSchema = z.object({
  walletAddress: z.string().refine((val) => {
    if (isAddress(val)) {
      return true;
    }
    return false;
  }, "Invalid wallet address"),
  amount: z.number().min(0, "Amount must be larger than 0"),
});

type WithdrawFormData = z.infer<typeof withdrawFormSchema>;

interface WithdrawTokensDialogProps {
  userTokenBalance: string;
}

export function WithdrawTokensDialog({
  userTokenBalance,
}: WithdrawTokensDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full my-2">
          Withdraw Tokens
        </Button>
      </DialogTrigger>
      <WithdrawTokensDialogContent
        userTokenBalance={userTokenBalance}
        setIsOpen={setIsOpen}
      />
    </Dialog>
  );
}

export function WithdrawTokensDialogContent({
  userTokenBalance,
  setIsOpen,
}: WithdrawTokensDialogProps & {
  setIsOpen: (isOpen: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const userBalance = Number(toEther(BigInt(userTokenBalance)));

  const form = useForm<WithdrawFormData>({
    resolver: zodResolver(withdrawFormSchema),
    defaultValues: {
      walletAddress: "",
      amount: userBalance, // Pre-fill with user's balance
    },
  });

  const onSubmit = async (data: WithdrawFormData) => {
    if (data.amount > userBalance) {
      toast.error("Insufficient balance", {
        description: `You only have ${userBalance.toFixed(2)} tokens available`,
      });
      return;
    }

    // First, validate the withdrawal request on the server
    const validationResult = await withdrawTokens({
      walletAddress: data.walletAddress,
      amount: data.amount,
    });

    if (!validationResult.success) {
      toast.error("Failed to withdraw tokens", {
        description: validationResult.error,
      });
    } else {
      toast.success("Tokens withdrawn successfully!");
      queryClient.invalidateQueries({ queryKey: ["tokenBalance"] });
      setIsOpen(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          Withdraw Tokens
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Withdraw the PXP tokens to another wallet
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        <div className="p-4 bg-card rounded-lg">
          <div className="text-sm text-muted-foreground">Tokens Earned</div>
          <div className="text-xl font-bold text-foreground">
            {userBalance.toFixed(2)} PXP
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Wallet Address Field */}
            <FormField
              control={form.control}
              name="walletAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wallet Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0x..."
                      {...field}
                      className="font-mono bg-card"
                    />
                  </FormControl>
                  <FormDescription>
                    The tokens will be sent to this wallet address
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount Field */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Amount
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      max={userBalance}
                      className="bg-card"
                      placeholder="Enter amount"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    The amount of PXP to send to the wallet address
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={form.formState.isSubmitting}
            >
              Withdraw Tokens
              {form.formState.isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowUpRightIcon className="size-4" />
              )}
            </Button>
          </form>
        </Form>
      </div>
    </DialogContent>
  );
}
