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

export interface FileProgress {
  id: string;
  name: string;
  chunksReceived: number;
  totalChunks: number;
  mode: "Sender" | "Receiver";
  buffer: ArrayBuffer[] | null;
}

export function ProgressDialog({
  fileProgressList,
}: {
  fileProgressList: FileProgress[];
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <ChevronsLeftRightEllipsis />
          Dateien
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Fortschritt</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 justify-between items-center ">
          {fileProgressList.map((f) => (
            <Button
              key={f.id + "-dl-button"}
              variant={"outline"}
              disabled={
                f.chunksReceived != f.totalChunks && f.mode === "Receiver"
              }
            >
              {f.name}
            </Button>
          ))}
          {fileProgressList.map((f) => (
            <Progress
              key={f.id + "-status"}
              value={(f.chunksReceived / f.totalChunks) * 100}
              className="h-1/3"
            />
          ))}
        </div>
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ProgressDialog;
