import { PeerEntity } from "@/lib/Peer";
import { openFileDialog } from "@/lib/utils";
import { Laptop, Smartphone } from "lucide-react";

export default function PeerDisplay({
  peers,
  inputElementRef,
}: {
  peers: PeerEntity[];
  inputElementRef: React.RefObject<HTMLInputElement>;
}) {
  function sendFileTo(peer: PeerEntity) {
    console.log("Send to", peer.identCode);
    openFileDialog(inputElementRef, peer.identCode, peer.connectionId);
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-wrap justify-center gap-12">
        {peers.map((peer) => (
          <div
            key={peer.identCode}
            className="flex flex-col items-center cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              sendFileTo(peer);
            }}
          >
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              {true ? (
                <Laptop className="w-10 h-10" />
              ) : (
                <Smartphone className="w-10 h-10" />
              )}
            </div>
            <span className="mt-2 text-sm font-medium text-secondary-foreground">
              {peer.identCode.substring(0, 3) +
                " - " +
                peer.identCode.substring(3, 6)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
