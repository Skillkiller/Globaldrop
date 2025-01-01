import { useRef, useEffect, useState, ChangeEvent } from "react";
import Peer, { DataConnection } from "peerjs";
import { Card, CardContent, CardHeader } from "./components/ui/card";
import { GalleryVerticalEnd } from "lucide-react";
import IdentShow from "./components/ident-show";
import { Separator } from "./components/ui/separator";
import { ConnectionCard } from "./components/connection-card";
import { PeerEntity } from "./lib/Peer";
import { addDataConnectionListener } from "./lib/utils";
import { startSendingFiles } from "./lib/network";
import ProgressDialog, {
  FileProgress,
} from "./components/dialog/progress-dialog";

function App() {
  const peerRef = useRef<Peer>();
  const [identNumber, setIdentNumber] = useState<string>();
  const [peers, setPeers] = useState([] as PeerEntity[]);
  const [fileProgressList, setFileProgressList] = useState(
    [] as FileProgress[]
  );

  const inputRef = useRef<HTMLInputElement>(null);

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
      addDataConnectionListener(setPeers, dataConnection, setFileProgressList);
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
  }, []);

  function onFilesSelected(event: ChangeEvent<HTMLInputElement>): void {
    startSendingFiles(event, peerRef, setFileProgressList);
  }

  return (
    <div className="h-screen">
      <div className="grid grid-cols-3 auto-cols-min gap-4 h-screen">
        <div className="bg-gray-800 grid grid-rows-3 gap-4">
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
            inputElementRef={inputRef}
            setFileProgressList={setFileProgressList}
          ></ConnectionCard>
          <div className="w-full">
            <ProgressDialog
              fileProgressList={fileProgressList}
            ></ProgressDialog>
          </div>
        </div>
        <div className="col-span-2 bg-yellow-950">{peers.toString()}</div>
      </div>
      <input
        type="file"
        multiple
        style={{ display: "none" }}
        ref={inputRef}
        onChange={onFilesSelected}
      ></input>
    </div>
  );
}

export default App;
