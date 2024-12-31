import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { TransferStatus } from "@/lib/utils";
import { useEffect, useState } from "react";

export interface FileProgress {
  id: string;
  name: string;
  chunksReceived: number;
  totalChunks: number;
}

export function ProgressDialog({
  fileProgressList,
  status,
}: {
  fileProgressList: FileProgress[];
  status: TransferStatus;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (status == "Working") {
      setDialogOpen(true);
    }
  }, [status]);

  console.log(fileProgressList);
  return (
    <Dialog open={dialogOpen}>
      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Fortschritt</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 justify-between items-center ">
          {fileProgressList.map((f) => (
            <>
              <Button
                key={f.id + "g1"}
                variant={"outline"}
                disabled={f.chunksReceived != f.totalChunks}
              >
                {f.name}
              </Button>
              <Progress
                key={f.id + "g2"}
                value={(f.chunksReceived / f.totalChunks) * 100}
                className="h-1/3"
              />
            </>
          ))}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="destructive"
            disabled={status !== "Done"}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ProgressDialog;
