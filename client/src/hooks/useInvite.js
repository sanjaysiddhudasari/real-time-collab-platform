import { useState } from "react";

function useInvite({roomId}) {
    const [copied, setCopied] = useState(false);
    const [inviteCode, setInviteCode] = useState(null);
     const handleCopyInvite = () => {
    const link = inviteCode
      ? `${window.location.origin}/invite/${inviteCode}`
      : `${window.location.origin}/room/${roomId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
    } else {
      const ta = document.createElement("textarea");
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return { handleCopyInvite,copied, inviteCode, setInviteCode };
}

export default useInvite;