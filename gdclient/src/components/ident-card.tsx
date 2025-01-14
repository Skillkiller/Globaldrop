import { Copy, UserRoundSearch } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "./ui/input-otp";
import { toast } from "@/hooks/use-toast";

export function IdentCard({ ident }: { ident: string | undefined }) {
  function copyIdent() {
    if (ident) {
      navigator.clipboard.writeText(ident);
      toast({ title: "Ident Code kopiert!", duration: 2000 });
    }
  }

  const visableIdent = ident ? ident : "------";
  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <UserRoundSearch className="h-6 w-6" />
          <CardTitle className="text-2xl">Dein Verbindungscode</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Gebe diesen Code einer anderen Person um sich mit dir zu verbinden.
        </p>
      </CardHeader>
      <CardContent className="flex w-full items-center justify-center">
        <div className="flex gap-2">
          <InputOTP maxLength={6} value={visableIdent} readOnly>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <Button variant="outline" onClick={copyIdent}>
            <Copy />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
