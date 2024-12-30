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
import { Copy, GalleryVerticalEnd, Unplug } from "lucide-react";
import { Toaster } from "./components/ui/toaster";
import { useToast } from "./hooks/use-toast";
import { Badge } from "./components/ui/badge";
import IdentShow from "./components/ident-show";
import { Separator } from "./components/ui/separator";
import { ConnectionCard } from "./components/connection-card";
import { PeerEntity } from "./lib/Peer";
import { addDataConnectionListener } from "./lib/utils";

function App() {
  const peerRef = useRef<Peer>();
  const [identNumber, setIdentNumber] = useState<string>();

  const [peers, setPeers] = useState([] as PeerEntity[]);

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
    });

    peerRef.current.on("connection", (dataConnection: DataConnection) => {
      addDataConnectionListener(setPeers, dataConnection);

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
        peerRef.current = undefined;
        console.log("Peer destroyed");
      }
    };
  }, []); // Nur einmal ausführen

  return (
    <div className="h-screen">
      <div className="grid grid-cols-3 auto-cols-min gap-4 h-screen">
        <div className="bg-gray-800 grid grid-rows-2 gap-4">
          <Card>
            <CardHeader>
              <div className="flex flex-row items-center gap-4">
                <div className="flex aspect-square items-center justify-center rounded-lg size-8 bg-primary text-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <p className="text-3xl">GlobalDrop</p>
              </div>
              <Separator></Separator>
            </CardHeader>
            <CardContent className="flex w-full items-center justify-center ">
              <IdentShow ident={identNumber}></IdentShow>
            </CardContent>
          </Card>
          <ConnectionCard
            peerRef={peerRef}
            peers={peers}
            setPeers={setPeers}
          ></ConnectionCard>
        </div>
        <div className="col-span-2 bg-yellow-950">{peers.toString()}</div>
      </div>
    </div>
  );
}

export default App;
