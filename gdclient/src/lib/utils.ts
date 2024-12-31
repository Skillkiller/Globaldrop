import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PeerEntity } from "./Peer";
import { DataConnection } from "peerjs";
import { PeerMessage } from "./network";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function openFileDialog(
  inputElementRef: React.RefObject<HTMLInputElement>,
  identCode: string,
  connectionId: string
) {
  inputElementRef.current?.click();
  inputElementRef.current?.setAttribute("target-ident-code", identCode);
  inputElementRef.current?.setAttribute("target-connection-id", connectionId);
}

export function addDataConnectionListener(
  setPeers: React.Dispatch<React.SetStateAction<PeerEntity[]>>,
  dataConnection: DataConnection
) {
  dataConnection.on("open", () => addPeer(setPeers, dataConnection));
  dataConnection.on("close", () => removePeer(setPeers, dataConnection));

  dataConnection.on("data", (data) => {
    const message = data as PeerMessage;
    console.log(message);
  });
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
