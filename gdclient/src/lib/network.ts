import { FileProgress } from "@/components/dialog/progress-dialog";
import { toast } from "@/hooks/use-toast";
import Peer, { DataConnection } from "peerjs";
import { ChangeEvent } from "react";
import FileChunker from "./FileChunker";

export interface PeerMessage {
  type: "Metadata" | "Chunk" | "ChunkReceived";
}

export interface PeerMessageMetadata extends PeerMessage, FileMetadata {}

export interface PeerMessageChunk extends PeerMessage {
  fileId: string;
  chunkNumber: number;
  chunk: ArrayBuffer;
}

export interface PeerMessageChunkReceived extends PeerMessage {
  fileId: string;
  chunkNumber: number;
}

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  mime: string;
  totalChunks: number;
}

function startSendingSingleFile(
  fileId: string,
  chunker: FileChunker,
  dataConnection: DataConnection
) {
  chunker.start((data, chunkIndex) => {
    dataConnection.send({
      fileId: fileId,
      chunk: data,
      chunkNumber: chunkIndex,
      type: "Chunk",
    } as PeerMessageChunk);
  });
}

export function startSendingFiles(
  event: ChangeEvent<HTMLInputElement>,
  peerRef: React.MutableRefObject<Peer | undefined>,
  setFileProgressList: React.Dispatch<React.SetStateAction<FileProgress[]>>,
  openFileProgressDialog: () => void
) {
  const targetIdentCode = event.target.getAttribute("target-ident-code");
  const targetConnectionId = event.target.getAttribute("target-connection-id");
  const connection = peerRef.current?.getConnection(
    targetIdentCode!,
    targetConnectionId!
  );

  if (!(connection as DataConnection)) {
    toast({
      title: "Verbindung zu " + targetIdentCode + " verloren",
      description:
        "Es konnten keine Daten mit " +
        targetConnectionId +
        " augetauscht werden!",
      duration: 5000,
      variant: "destructive",
    });
    return;
  }

  const dataConnection = connection as DataConnection;
  openFileProgressDialog();
  for (let index = 0; index < event.target.files!.length; index++) {
    const file = event.target.files!.item(index)!;
    const chunker = new FileChunker(file, 1024 * 1024 * 5);
    const metadata = sendFileMetadata(dataConnection, file, chunker.info());
    setFileProgressList((oldList) =>
      oldList.concat({
        ...metadata,
        chunksReceived: 0,
        mode: "Sender",
        buffer: [],
      })
    );
    startSendingSingleFile(metadata.id, chunker, dataConnection);
  }
}

function sendFileMetadata(
  dataConnection: DataConnection,
  file: File,
  totalChunks: number
): FileMetadata {
  const fileProgress: FileMetadata = {
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    mime: file.type,
    totalChunks: totalChunks,
  };
  dataConnection.send({
    type: "Metadata",
    ...fileProgress,
  } as PeerMessageMetadata);

  return fileProgress;
}