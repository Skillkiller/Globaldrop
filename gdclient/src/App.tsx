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
import PeerDisplay from "./components/PeerDisplay";
import { ThemeProvider } from "./components/theme-provider";

interface RoomData {
  name: string;
  clients: string[];
}

function App() {
  const peerRef = useRef<Peer>();
  const [identNumber, setIdentNumber] = useState<string>();
  const [peers, setPeers] = useState([] as PeerEntity[]);
  const [fileProgressList, setFileProgressList] = useState(
    [] as FileProgress[]
  );

  const inputRef = useRef<HTMLInputElement>(null);

    const [openDialogFunction, setOpenDialogFunction] = useState<
      (() => void) | null
    >(null);

    const openFileProgressDialog = () => {
      if (openDialogFunction) openDialogFunction();
    };

    useEffect(() => {
      if (!peerRef.current) {
        console.log("Initializing Peer");
        peerRef.current = new Peer({
          host: import.meta.env.VITE_BACKEND_HOST,
          port: import.meta.env.VITE_BACKEND_PORT,
          path: import.meta.env.VITE_BACKEND_PEER_PATH,
          secure: import.meta.env.VITE_BACKEND_SECURE === "true",
        });
      }

      const getRoomData = async () => {
        const backendHost = import.meta.env.VITE_BACKEND_HOST;
        const backendPort = import.meta.env.VITE_BACKEND_PORT;
        const backendSecure = import.meta.env.VITE_BACKEND_SECURE === "true";
        const backendRoomPath = import.meta.env.VITE_BACKEND_ROOM_PATH;

        const protocol = backendSecure ? "https" : "http";
        const url = `${protocol}://${backendHost}:${backendPort}/${backendRoomPath}`;

        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error("Fehler beim Abrufen der Room Daten!");
          }
          const data: RoomData = await response.json();

          data.clients.forEach((ident) => {
            const conn = peerRef.current?.connect(ident, {
              reliable: true,
            });
            addDataConnectionListener(
              setPeers,
              conn!,
              setFileProgressList,
              openFileProgressDialog
            );
          });
        } catch (error) {
          console.error("Fehler bei der Anfrage:", error);
        }
      };

      peerRef.current.on("open", (id) => {
        console.log("Peer ID:", id);
        setIdentNumber(id);
        getRoomData();
      });

      peerRef.current.on("connection", (dataConnection: DataConnection) => {
        addDataConnectionListener(
          setPeers,
          dataConnection,
          setFileProgressList,
          openFileProgressDialog
        );
      });

      // Cleanup peer instance un unmount
      return () => {
        if (peerRef.current) {
          peerRef.current.destroy();
          peerRef.current = undefined;
          console.log("Peer destroyed");
        }
      };
    }, []);

    function onFilesSelected(event: ChangeEvent<HTMLInputElement>): void {
      startSendingFiles(
        event,
        peerRef,
        setFileProgressList,
        openFileProgressDialog
      );
    }

    return (
      <ThemeProvider storageKey="vite-ui-theme">
        {/* Sidebar */}
        <div className="flex flex-col lg:flex-row min-h-screen">
          <div className="w-full max-w-lg p-4 flex flex-col space-y-4">
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
              openFileProgressDialog={openFileProgressDialog}
            ></ConnectionCard>
            <div className="flex-grow">
              <ProgressDialog
                fileProgressList={fileProgressList}
                callbackOpenDialog={(openDialog) =>
                  setOpenDialogFunction(() => openDialog)
                }
              ></ProgressDialog>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-grow p-4">
            <PeerDisplay peers={peers} inputElementRef={inputRef} />
          </div>

          <input
            type="file"
            multiple
            style={{ display: "none" }}
            ref={inputRef}
            onChange={onFilesSelected}
          ></input>
        </div>
        <Card className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-50 w-auto max-w-[90%]">
          <CardContent className="p-2 text-center text-sm">
            <p>
              Globaldrop v{APP_VERSION} -{" "}
              <a
                href="https://github.com/Skillkiller/Globaldrop"
                target="_blank"
                className="underline"
              >
                GitHub
              </a>
            </p>
          </CardContent>
        </Card>
      </ThemeProvider>
    );
}

export default App;
