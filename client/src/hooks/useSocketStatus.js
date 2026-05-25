import { useState,useEffect } from "react";
import { socket } from "../socket/socket";

function useSocketStatus() {
  const [connected, setConnected] = useState(socket.connected);
  const [socketId, setSocketId] = useState(socket.id||"");
  useEffect(() => {
    if(!socket.connected){
      socket.connect();
    }

    socket.on("connect", () => {
      setConnected(true);
      setSocketId(socket.id);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);
  return [connected,socketId];
}

export default useSocketStatus;
