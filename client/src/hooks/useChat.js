import { useState } from "react";
import {socket} from '../socket/socket';

function useChat({roomId}) {

    const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    socket.emit("send-message", { roomId, content: input });
    setInput("");
  };

  const handleTyping = () => {
    socket.emit("typing", { roomId });
  };

  return {input, setInput, handleSend, handleTyping};
}

export default useChat;
