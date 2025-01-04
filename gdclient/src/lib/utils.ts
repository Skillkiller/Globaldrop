import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PeerEntity } from "./Peer";
import { DataConnection } from "peerjs";
import { FileMetadata, PeerMessage } from "./network";
import { FileProgress } from "@/components/dialog/progress-dialog";

import type { PeerMessageChunk, PeerMessageMetadata } from "./network";

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
  setFileProgressList: React.Dispatch<React.SetStateAction<FileProgress[]>>,
  openFileProgressDialog: () => void
) {
  dataConnection.on("open", () => addPeer(setPeers, dataConnection));
  dataConnection.on("close", () => removePeer(setPeers, dataConnection));

  dataConnection.on("data", (data) =>
    onData(data, setFileProgressList, openFileProgressDialog)
  );
}

function onData(
  data: any,
  setFileProgressList: React.Dispatch<React.SetStateAction<FileProgress[]>>,
  openFileProgressDialog: () => void
) {
  const message = data as PeerMessage;

  if (message.type === "Metadata") {
    const metadata = message as PeerMessageMetadata;
    setFileProgressList((oldList) =>
      oldList.concat({
        ...metadata,
        buffer: [],
        chunksReceived: 0,
        mode: "Receiver",
      })
    );
    openFileProgressDialog();
  } else if (message.type === "Chunk") {
    const chunkMessage = message as PeerMessageChunk;
    // Update progress bar and save chunk
    setFileProgressList((oldList) => {
      // Search old progress item
      const oldProgress = oldList.find((p) => p.id === chunkMessage.fileId);
      if (oldProgress) {
        oldProgress.buffer.push(chunkMessage.chunk);
        const progress: FileProgress = {
          ...oldProgress,
          chunksReceived: chunkMessage.chunkNumber + 1,
        };
        return oldList.map((p) => {
          if (p.id === progress.id) return progress;
          return p;
        });
      } else {
        return oldList;
      }
    });
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
