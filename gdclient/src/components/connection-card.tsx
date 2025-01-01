import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Unplug, Link } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import { PeerEntity } from "@/lib/Peer";
import { addDataConnectionListener, openFileDialog } from "@/lib/utils";

export function ConnectionCard({
  peerRef,
  peers,
  inputElementRef,
  setPeers,
  connectIdent,
}: {
  peerRef: React.MutableRefObject<Peer | undefined>;
  peers: PeerEntity[];
  inputElementRef: React.RefObject<HTMLInputElement>;
  setPeers: React.Dispatch<React.SetStateAction<PeerEntity[]>>;
  connectIdent?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [connectButtonEnabled, setConnectButtonEnabled] = useState(false);
  const [value, setValue] = useState(connectIdent ? connectIdent : "");

  function submitForm(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = (event.target as any).identCode.value;
    console.log(code);
    const conn = peerRef.current?.connect(code, { reliable: true });
    console.log(conn);
    conn?.on("open", () => {
      openFileDialog(inputElementRef, conn.peer, conn.connectionId);
    });

    addDataConnectionListener(setPeers, conn!);
  }

  if (connectIdent) {
    formRef.current?.submit();
  }

  useEffect(() => {
    setConnectButtonEnabled(() => {
      return value.length == 6 && !peers.some((p) => p.identCode === value);
    });
  }, [peers, value]);

  return (
    <Card className="w-full max-w-md h-max">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Unplug className="h-6 w-6" />
          <CardTitle className="text-2xl">Verbinde dich zu anderen</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Gib den 6-stelligen Code ein, um dich mit anderen zu verbinden.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <div className="flex flex-col space-y-4 items-center max-w-[280px]">
            <form
              ref={formRef}
              className="flex justify-center gap-2"
              onSubmit={submitForm}
            >
              <InputOTP
                maxLength={6}
                onChange={(value) => setValue(value)}
                name="identCode"
              >
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
              <Button
                className="w-full max-w-[280px]"
                disabled={!connectButtonEnabled}
              >
                <Link />
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
