import { FileProgress } from "@/components/dialog/progress-dialog";
import { toast } from "@/hooks/use-toast";
import Peer, { DataConnection } from "peerjs";
import { ChangeEvent } from "react";
import { fileMetaDataListToProgressList } from "./utils";
import FileChunker from "./FileChunker";

export interface PeerMessage {
  type: "Metadata" | "Chunk";
}

export interface PeerMessageMetadata extends PeerMessage {
  files: FileMetadata[];
}

export interface PeerMessageChunk extends PeerMessage {
  fileId: string;
  chunk: ArrayBuffer;
  chunkNumber: number;
  totalChunks: number;
}

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
}

export function startSendingFiles(
  event: ChangeEvent<HTMLInputElement>,
  peerRef: React.MutableRefObject<Peer | undefined>,
  setFileProgressList: React.Dispatch<React.SetStateAction<FileProgress[]>>
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
  let progress = sendFileMetadataList(
    dataConnection,
    event.target.files!,
    setFileProgressList
  );

  // TODO Start upload
  for (let index = 0; index < event.target.files!.length; index++) {
    const file = event.target.files!.item(index)!;
    const chunker = new FileChunker(file, 1024);

    console.log("Total chunks:", chunker.info());
    chunker.start((data, chunkIndex) => {
      dataConnection.send({
        fileId: progress[index].id,
        chunk: data,
        chunkNumber: chunkIndex,
        totalChunks: chunker.info(),
        type: "Chunk",
      } as PeerMessageChunk);

      setFileProgressList((progressList) => {
        const fileProgress = {
          ...progressList[index],
          chunksReceived: chunkIndex + 1,
          totalChunks: chunker.info(),
        } as FileProgress;

        let tmp = [] as FileProgress[];

        progressList.forEach((element, index2) => {
          if (index === index2) tmp.push(fileProgress);
          else tmp.push(element);
        });

        return tmp;
      });
    });
  }
}

function sendFileMetadataList(
  dataConnection: DataConnection,
  fileList: FileList,
  setFileProgressList: React.Dispatch<React.SetStateAction<FileProgress[]>>
): FileProgress[] {
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
  let progressList = fileMetaDataListToProgressList(metadata.files);
  setFileProgressList(progressList);
  return progressList;
}
