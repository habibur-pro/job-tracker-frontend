import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { IJob } from "@/types";
import { useState } from "react";
import { JobStatus } from "@/enum";
import { useUpdateJobStatusMutation } from "@/redux/api/jobApi";
type Params = {
  job: IJob;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
const StatusUpdateModal = ({ job, isModalOpen, setIsModalOpen }: Params) => {
  const [newStatus, setNewStatus] = useState(job?.status);
  const [note, setNote] = useState("");
  const [updateJobStatus] = useUpdateJobStatusMutation();

  const updateStatus = async () => {
    try {
      await updateJobStatus({
        jobId: job.id,
        data: { status: newStatus as JobStatus, note },
      });
      setIsModalOpen(false);
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Job Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={newStatus}
              onValueChange={(val) => setNewStatus(val as JobStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(JobStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Note</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about this status update..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={updateStatus}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatusUpdateModal;
