import api from "../services/api";
import { useEffect, useState } from "react";

function useRooms() {
    const [loading, setLoading] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [userId, setUserId] = useState("");
    const [error, setError] = useState("");

    const fetchRooms = async () => {
        try {
            const response = await api.get("/rooms");
            setRooms(response.data.rooms);
            setUserId(response.data.userId);
        } catch (error) {
            setError(error.response?.data?.message || "Failed to fetch rooms");
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchRooms().finally(() => setLoading(false));
        
        // Poll every 30 seconds so dashboard stays up-to-date
        const interval = setInterval(fetchRooms, 30000);
        return () => clearInterval(interval);
    }, []);

    return [rooms, loading, userId, error, fetchRooms];
}

export default useRooms
