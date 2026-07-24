import api from "../services/api";
import { useEffect, useState } from "react";

function useRooms() {
    const [loading, setLoading] = useState(true);
    const [rooms, setRooms] = useState([]);
    const [userId, setUserId] = useState("");
    const [error, setError] = useState("");

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const response = await api.get("/rooms");
            setRooms(response.data.rooms);
            setUserId(response.data.userId);
        } catch (error) {
            setError(error.response?.data?.message || "Failed to fetch rooms");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(fetchRooms, 0);

        // Poll every 30 seconds so dashboard stays up-to-date
        const interval = setInterval(fetchRooms, 30000);
        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
        };
    }, []);

    return [rooms, loading, userId, error, fetchRooms];
}

export default useRooms
