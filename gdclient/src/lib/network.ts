import { toast } from "@/hooks/use-toast";
import Peer, { DataConnection } from "peerjs";
import { ChangeEvent } from "react";

export interface PeerMessage {
  type: "Metadata" | "Chunk";
}

export interface PeerMessageMetadata extends PeerMessage {
  files: FileMetadata[];
}

export interface PeerMessageChunk extends PeerMessage {
  chunk: Blob;
  chunkNumber: number;
}

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
}

export function startSendingFiles(
  event: ChangeEvent<HTMLInputElement>,
  peerRef: React.MutableRefObject<Peer | undefined>
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
  sendFileMetadataList(dataConnection, event.target.files!);
}

function sendFileMetadataList(
  dataConnection: DataConnection,
  fileList: FileList
) {
  let list = [] as FileMetadata[];
  for (let index = 0; index < fileList.length; index++) {
    const file = fileList.item(index)!;
    list.push({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
    });
  }
  let metadata = {
    type: "Metadata",
    files: list,
  } as PeerMessageMetadata;
  dataConnection.send(metadata);
}
