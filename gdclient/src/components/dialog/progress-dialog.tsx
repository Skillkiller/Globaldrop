import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "../ui/progress";
import { ChevronsLeftRightEllipsis } from "lucide-react";
import { FileMetadata } from "@/lib/network";
import { useEffect, useRef } from "react";
import React from "react";

export interface FileProgress extends FileMetadata {
  chunksReceived: number;
  mode: "Sender" | "Receiver";
  buffer: ArrayBuffer[];
}

export const ProgressDialog = ({
  fileProgressList,
  callbackOpenDialog,
}: {
  fileProgressList: FileProgress[];
  callbackOpenDialog: (openDialog: () => void) => void;
}) => {
  const firstButtonRef = useRef<HTMLButtonElement | null>(null);

  let dialogOpen = false;

  function openDialog(): void {
    if (!dialogOpen && firstButtonRef.current) {
      firstButtonRef.current.click();
    }
  }

  useEffect(() => {
    callbackOpenDialog(openDialog);
  }, [callbackOpenDialog]);

  function saveFile(fileProgress: FileProgress) {
    console.log(fileProgress);
    const blob = new Blob(fileProgress.buffer, {
      type: fileProgress.mime,
    });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileProgress.name || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(downloadUrl);
  }

  return (
    <Dialog onOpenChange={(open) => (dialogOpen = open)}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" ref={firstButtonRef}>
          <ChevronsLeftRightEllipsis />
          Dateien
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Fortschritt</DialogTitle>
        </DialogHeader>
        {fileProgressList.length === 0 && (
          <h1>Es wurden bisher keine Daten übertragen</h1>
        )}
        <div className="grid grid-cols-2 gap-4 justify-between items-center ">
          {fileProgressList.map((f) => (
            <React.Fragment key={f.id}>
              <Button
                key={f.id + "-dl-button"}
                variant={
                  f.chunksReceived !== f.totalChunks ? "outline" : "default"
                }
                disabled={
                  f.chunksReceived !== f.totalChunks || f.mode !== "Receiver"
                }
                onClick={(e) => {
                  e.preventDefault();
                  saveFile(f);
                }}
              >
                <p className="text-ellipsis overflow-hidden">{f.name}</p>
              </Button>
              <Progress
                key={f.id + "-status"}
                value={(f.chunksReceived / f.totalChunks) * 100}
                className="h-1/3"
              />
            </React.Fragment>
          ))}
        </div>
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProgressDialog;
