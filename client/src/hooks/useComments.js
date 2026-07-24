import { useState, useEffect, useCallback } from "react";
import { socket } from "../socket/socket";

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function useComments({ roomId, fileId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!roomId || !fileId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/comments/${roomId}/${fileId}`, { credentials: "include" });
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  }, [roomId, fileId]);

  useEffect(() => {
    refresh();
    socket.on("comment-updated", refresh);
    return () => { socket.off("comment-updated", refresh); };
  }, [refresh]);

  const reply = useCallback(async (id, explanation) => {
    await fetch(`${API}/comments/${id}/reply`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ explanation }),
    });
    socket.emit("comment-updated");
    refresh();
  }, [refresh]);

  const resolve = useCallback(async (id) => {
    await fetch(`${API}/comments/${id}/resolve`, {
      method: "PATCH",
      credentials: "include",
    });
    socket.emit("comment-updated");
    refresh();
  }, [refresh]);

  const unresolve = useCallback(async (id) => {
    await fetch(`${API}/comments/${id}/unresolve`, {
      method: "PATCH",
      credentials: "include",
    });
    socket.emit("comment-updated");
    refresh();
  }, [refresh]);

  const create = useCallback(async ({ line, type, explanation, suggestion }) => {
    if (!roomId || !fileId) return;
    await fetch(`${API}/comments`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, fileId, line, type, explanation, suggestion }),
    });
    socket.emit("comment-updated");
    refresh();
  }, [roomId, fileId, refresh]);

  return { comments, loading, reply, resolve, unresolve, create, refresh };
}
