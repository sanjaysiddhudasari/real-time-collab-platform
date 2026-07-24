import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import RoomNav from "../components/room/RoomNav";
import Workspace from "../components/room/Workspace";
import RoomModals from "../components/room/RoomModals";
import ChatSideBar from "../components/room/ChatSideBar";
import AISuggestionPanel from "../components/room/AiSuggesstionPanel";
import CommentThread from "../components/room/CommentThread";
import { useRoomSocket } from "../hooks/useRoomSocket";
import useUser from "../hooks/useUser";
import useChat from "../hooks/useChat";
import useCodeRunner from "../hooks/useCodeRunner";
import useFiles from "../hooks/useFiles";
import useCursorStyles from "../hooks/useCursorStyles";
import useInvite from "../hooks/useInvite";
import useRoomData from "../hooks/useRoomData";
import useRoomActions from "../hooks/useRoomActions";
import useAiReviewController from "../hooks/useAiReviewController";
import useComments from "../hooks/useComments";

export default function Room() {
  const { roomId } = useParams();
  const { user } = useUser();

  const chatEndRef = useRef(null);
  const editorRef = useRef(null);
  const removeCursorRef = useRef(null);
  const lastSyncedRef = useRef(null);

  const {input, setInput, handleSend, handleTyping} = useChat({roomId});
  const { files, setFiles, roomName, setRoomName, messages, setMessages, isloading, setIsLoading } = useRoomData();
  const { activeFile, activeFileId, setActiveFileId, showCreateModal, setShowCreateModal, renameTarget, setRenameTarget, handleCreateFile, handleRenameFile, handleLangChange } = useFiles({roomId, files});
  const { output, setOutput, outputOpen, setOutputOpen, runningFiles, setRunningFiles, lastRunFileId, setLastRunFileId, handleRun } = useCodeRunner({roomId, activeFileId});
  useCursorStyles();
  const { copied, handleCopyInvite, inviteCode, setInviteCode } = useInvite({roomId});
  const { handleLeave } = useRoomActions({ roomId });
  const ai = useAiReviewController({ editorRef, activeFileId, roomId });
  const commentHook = useComments({ roomId, fileId: activeFileId });

  const [users, setUsers] = useState([]);
  const [chatOpen, setChatOpen] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);
  const [activeCommentLine, setActiveCommentLine] = useState(null);
  const [commentsOpen, setCommentsOpen] = useState(true);

  useRoomSocket({
    roomId, user,
    setFiles, setMessages, setUsers, setRoomName,
    setOutputOpen, setOutput,
    setActiveFileId, setIsLoading,
    activeFileId, editorRef, removeCursorRef, lastSyncedRef,
    setInviteCode, setLastRunFileId, setRunningFiles,
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!commentsOpen) setActiveCommentLine(null);
  }, [commentsOpen]);

  // Insert the AI suggestion into the code as a comment above the flagged
  // line (live-synced to everyone), then save it as a thread comment.
  const handleAddSuggestion = async (item) => {
    const editor = editorRef.current;
    const model = editor?.getModel();
    let inserted = 0;
    if (editor && model && window.monaco && item.line <= model.getLineCount()) {
      const indent = (model.getLineContent(item.line) || "").match(/^\s*/)?.[0] || "";
      const marker = ["python", "ruby"].includes(activeFile?.lang)
        ? "#"
        : activeFile?.lang === "sql"
          ? "--"
          : "//";
      const commentLines = [
        `${marker} AI Review [${item.type}]: ${item.explanation}`,
        ...(item.suggestion
          ? item.suggestion.split("\n").map((l) => `${marker} Suggestion: ${l}`)
          : []),
      ];
      editor.executeEdits("ai-suggestion", [{
        range: new window.monaco.Range(item.line, 1, item.line, 1),
        text: commentLines.map((l) => indent + l).join("\n") + "\n",
      }]);
      inserted = commentLines.length;
    }
    try {
      await commentHook.create({
        roomId,
        fileId: activeFileId,
        line: item.line + inserted,
        type: item.type,
        explanation: item.explanation,
        suggestion: item.suggestion,
        isAI: true,
      });
      toast.success("Suggestion added as code comment");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  if (isloading) {
    return (
      <div className="h-screen bg-[#0d0d12] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0d0d12] flex flex-col overflow-hidden font-mono">
      <RoomNav
        users={users}
        lang={activeFile?.lang}
        setChatOpen={setChatOpen}
        chatOpen={chatOpen}
        roomName={roomName}
        handleLangChange={handleLangChange}
        handleRun={handleRun}
        isRunning={!!runningFiles[activeFileId]?.running}
        handleLeave={handleLeave}
        copied={copied}
        handleCopyInvite={handleCopyInvite}
        aiOpen={aiOpen}
        setAiOpen={setAiOpen}
        commentsOpen={commentsOpen}
        setCommentsOpen={setCommentsOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        <Workspace
          files={files} setFiles={setFiles}
          activeFileId={activeFileId} setActiveFileId={setActiveFileId}
          roomId={roomId}
          editorRef={editorRef} removeCursorRef={removeCursorRef} lastSyncedRef={lastSyncedRef}
          outputOpen={outputOpen} setOutputOpen={setOutputOpen}
          output={output} runningFiles={runningFiles} lastRunFileId={lastRunFileId}
          setShowCreateModal={setShowCreateModal} setRenameTarget={setRenameTarget}
          comments={commentHook.comments}
          commentsOpen={commentsOpen}
          onGutterClick={(line) => setActiveCommentLine(line)}
          activeCommentLine={activeCommentLine}
        />

        {chatOpen && (
          <ChatSideBar
            users={users}
            messages={messages}
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            chatEndRef={chatEndRef}
            onTyping={handleTyping}
          />
        )}

        {aiOpen && (
          <AISuggestionPanel
            suggestion={ai.currentRaw}
            isStreaming={ai.isStreaming}
            error={ai.error}
            onReview={(code, lang) => ai.triggerReview({ code, language: lang, fileId: activeFileId, roomId })}
            code={activeFile?.code}
            language={activeFile?.lang}
            editorRef={editorRef}
            parsedSuggestions={ai.parsedSuggestions}
            toggleLine={ai.toggleLine}
            onAddSuggestion={handleAddSuggestion}
          />
        )}
      </div>

      {activeCommentLine && (
        <CommentThread
          comments={commentHook.comments}
          line={activeCommentLine}
          onClose={() => setActiveCommentLine(null)}
          onReply={commentHook.reply}
          onResolve={commentHook.resolve}
          onUnresolve={commentHook.unresolve}
          onCreate={commentHook.create}
          editorRef={editorRef}
        />
      )}

      <RoomModals
        showCreateModal={showCreateModal} setShowCreateModal={setShowCreateModal}
        handleCreateFile={handleCreateFile}
        files={files} renameTarget={renameTarget} setRenameTarget={setRenameTarget}
        handleRenameFile={handleRenameFile}
      />
    </div>
  );
}
