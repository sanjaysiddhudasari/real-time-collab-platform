import { useNavigate } from "react-router-dom";
import { socket } from "../socket/socket";
import api from "../services/api";

export default function useRoomActions({ roomId }) {
  const navigate = useNavigate();

  const handleLeave = async () => {
    socket.emit("leave-room", { roomId });
    try {
      await api.post(`/rooms/${roomId}/leave`);
    } catch (error) {
      console.log("Error leaving room:", error);
    }
    navigate("/");
  };

  return { handleLeave };
}
