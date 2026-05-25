import api from "../services/api";
import { useEffect,useState } from "react";

function useRooms() {
    const [loading, setLoading] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [userId, setUserId] = useState("");
    const [error, setError] = useState("");

    const fetchRooms = async () => {
        setLoading(true);

        try {
            const response = await api.get("/rooms");
            setRooms(response.data.rooms);
            setUserId(response.data.userId);
            console.log(response);
        } catch (error) {
            setError(error.response?.data?.message || "Failed to fetch rooms");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    return [rooms, loading, userId,error, fetchRooms];
}

export default useRooms