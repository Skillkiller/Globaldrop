import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PeerEntity } from "./Peer";
import { DataConnection } from "peerjs";
import { FileMetadata, PeerMessage } from "./network";
import { FileProgress } from "@/components/dialog/progress-dialog";

import type { PeerMessageMetadata } from "./network";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type TransferStatus = "Working" | "Done";

export function openFileDialog(
  inputElementRef: React.RefObject<HTMLInputElement>,
  identCode: string,
  connectionId: string
) {
  inputElementRef.current?.click();
  inputElementRef.current?.setAttribute("target-ident-code", identCode);
  inputElementRef.current?.setAttribute("target-connection-id", connectionId);
}

export function fileMetaDataListToProgressList(
  fileMetadata: FileMetadata[]
): FileProgress[] {
  return fileMetadata.map((f) => {
    return {
      id: f.id,
      name: f.name,
      chunksReceived: 0,
      totalChunks: 1,
    } as FileProgress;
  });
}

export function addDataConnectionListener(
  setPeers: React.Dispatch<React.SetStateAction<PeerEntity[]>>,
  dataConnection: DataConnection,
  setFileProgressList: React.Dispatch<React.SetStateAction<FileProgress[]>>
) {
  dataConnection.on("open", () => addPeer(setPeers, dataConnection));
  dataConnection.on("close", () => removePeer(setPeers, dataConnection));

  dataConnection.on("data", (data) => onData(data, setFileProgressList));
}

function onData(
  data: any,
  setFileProgressList: React.Dispatch<React.SetStateAction<FileProgress[]>>
) {
  const message = data as PeerMessage;

  if (message.type === "Metadata") {
    const metadata = message as PeerMessageMetadata;
    const progress = fileMetaDataListToProgressList(metadata.files);
    setFileProgressList(progress);
  } else {
    console.log(data);
  }
}

function addPeer(
  setPeers: React.Dispatch<React.SetStateAction<PeerEntity[]>>,
  dataConnection: DataConnection
) {
  setPeers((prevPeers) => {
    const newPeers = [
      ...prevPeers,
      {
        identCode: dataConnection.peer,
        connectionId: dataConnection.connectionId,
      } as PeerEntity,
    ];
    console.log("Peers (immediately after open):", newPeers);
    return newPeers;
  });
}

function removePeer(
  setPeers: React.Dispatch<React.SetStateAction<PeerEntity[]>>,
  dataConnection: DataConnection
) {
  setPeers((prevPeers) => {
    const newPeers = prevPeers.filter(
      (p) => p.connectionId !== dataConnection.connectionId
    );
    console.log("Peers (immediately after close):", newPeers);
    return newPeers;
  });
}
