import { useState } from "react";
import { socket } from "../socket/socket";

function useCodeRunner({roomId,activeFileId}) {
  const [output, setOutput] = useState("");
  const [outputOpen, setOutputOpen] = useState(false);
  const [runningFiles, setRunningFiles] = useState({});
  const [lastRunFileId, setLastRunFileId] = useState(null);
  const handleRun = () => {
    socket.emit("run-code", { roomId, fileId: activeFileId });
  };

  return { output, setOutput, outputOpen, setOutputOpen, runningFiles, setRunningFiles, lastRunFileId, setLastRunFileId, handleRun };
}

export default useCodeRunner;
