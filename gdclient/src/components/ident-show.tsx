import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "./ui/input-otp";
import { Copy } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "@/hooks/use-toast";

function ShowIdent({ ident }: { ident: string | undefined }) {
  function copyIdent() {
    if (ident) {
      navigator.clipboard.writeText(ident);
      toast({ title: "Ident Code kopiert!", duration: 2000 });
    }
  }

  const visableIdent = ident ? ident : "------";
  return (
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
  );
}

export default ShowIdent;
