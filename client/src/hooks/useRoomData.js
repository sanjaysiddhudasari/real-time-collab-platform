import { useEffect, useState,useParams } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import useUser from "./useUser";

function useRoomData() {
  const { user } = useUser();
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [messages, setMessages] = useState([]);
  const [isloading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const res = await api.get(`/rooms/${roomId}`);
        const data = res.data.room;
        setFiles(data.files);
        setRoomName(data.roomname);
        const messages = data.messages.map((msg) => ({
          ...msg,
          sender: msg.sender?.username
            ? msg.sender
            : { _id: msg.sender, username: "Unknown" },
          self:
            (msg.sender?._id?.toString() || msg.sender?.toString()) ===
            user?.userId?.toString(),
        }));
        setMessages(messages);
        setIsLoading(false);
      } catch (error) {
        toast.error("Room not found");
        navigate("/", { replace: true });
      }
    };
    fetchRoomData();
  }, [roomId]);

  return {
    files,
    setFiles,
    roomName,
    setRoomName,
    messages,
    setMessages,
    isloading,
    setIsLoading
  };
}

export default useRoomData;
