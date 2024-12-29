import { useRef, useEffect, useState } from "react";
import Peer from "peerjs";

function App() {
  const peerRef = useRef<Peer | null>();

  const [identNumber, setIdentNumber] = useState<string>();
  const [connState, setConnState] = useState<
    "Not connected" | "Waiting for request"
  >("Not connected");

  useEffect(() => {
    if (!peerRef.current) {
      console.log("Initializing Peer");
      peerRef.current = new Peer(); // Peer wird nur einmal erstellt
    }

    // Beispiel: Event-Listener registrieren
    peerRef.current.on("open", (id) => {
      console.log("Peer ID:", id);
      setIdentNumber(id);
      setConnState("Waiting for request");
    });

    peerRef.current.on("connection", (conn) => {
      console.log("Connection established with:", conn.peer);
    });

    // Cleanup: Peer-Instanz zerstören, aber nur beim Unmount der Komponente
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
        console.log("Peer destroyed");
      }
    };
  }, []); // Nur einmal ausführen

  return (
    <div>
      <h1>
        Ident: {identNumber} - State: {connState}
      </h1>
      <p>Open the console to see Peer events.</p>
    </div>
  );
}

export default App;
