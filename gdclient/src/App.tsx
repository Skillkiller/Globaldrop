import { useRef, useEffect, useState, FormEventHandler } from "react";
import Peer, { DataConnection } from "peerjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "./components/ui/input-otp";
import { Button } from "./components/ui/button";
import { Copy } from "lucide-react";
import { Toaster } from "./components/ui/toaster";
import { useToast } from "./hooks/use-toast";
import { Badge } from "./components/ui/badge";

function App() {
  const peerRef = useRef<Peer | null>();

  const formRef = useRef<HTMLFormElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [identNumber, setIdentNumber] = useState<string>();
  const [connState, setConnState] = useState<
    "Not connected" | "Waiting for request"
  >("Not connected");

  const { toast } = useToast();

  function copyIdentCode() {
    if (identNumber) {
      navigator.clipboard.writeText(identNumber);
      toast({ title: "Ident Code kopiert!", duration: 2000 });
    }
  }

  function submitForm(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = (event.target as any).otp.value;
    console.log(code);
    const conn = peerRef.current?.connect(code, { reliable: true });
    console.log(conn);
    conn?.on("open", () => {
      conn.send("Hallo Welt!");
    });
  }

  useEffect(() => {
    if (!peerRef.current) {
      console.log("Initializing Peer");
      peerRef.current = new Peer(
        "" + (Math.floor(Math.random() * 999999) + 100_000)
      ); // Peer wird nur einmal erstellt
    }

    // Beispiel: Event-Listener registrieren
    peerRef.current.on("open", (id) => {
      console.log("Peer ID:", id);
      setIdentNumber(id);
      setConnState("Waiting for request");
    });

    peerRef.current.on("connection", (dataConnection: DataConnection) => {
      console.log("New data connection from:", dataConnection.peer);
      dataConnection.on("data", (data) => {
        console.log(data);
      });
    });

    peerRef.current.on("error", (err) => {
      console.log(err);
    });

    // Cleanup: Peer-Instanz zerstören, aber nur beim Unmount der Komponente
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
        console.log("Peer destroyed");
      }
    };
  }, []); // Nur einmal ausführen

  return (
    <div>
      <Toaster />
      <Card></Card>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="rounded-xl">
            <Card>
              <CardHeader>
                <CardTitle>Global Drop</CardTitle>
                <CardDescription>
                  Teile Dateien und Dokumente einfach über das Netzwerk!
                </CardDescription>
              </CardHeader>
              <CardContent></CardContent>
              <CardFooter className="flex justify-between"></CardFooter>
            </Card>
          </div>
          <div className="rounded-xl">
            <Card>
              <CardHeader>
                <CardTitle>
                  Ident Code - <Badge>{connState}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={identNumber} readOnly>
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
                  <Button onClick={copyIdentCode}>
                    <Copy />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="rounded-xl">
            <Card>
              <CardHeader>
                <CardTitle>Verbinden</CardTitle>
                <CardDescription>
                  Verbinde dich zu einer anderen Person mit dem Ident Code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  ref={formRef}
                  className="flex justify-center"
                  onSubmit={submitForm}
                >
                  <InputOTP
                    maxLength={6}
                    onComplete={() => buttonRef.current?.focus()}
                    autoFocus
                    name="otp"
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
                  <Button ref={buttonRef}>Submit</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </div>
  );
}

export default App;
