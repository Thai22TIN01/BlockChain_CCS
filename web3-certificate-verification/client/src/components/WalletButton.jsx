import { useState } from "react";

export default function WalletButton() {
  const [connected, setConnected] = useState(false);

  return (
    <button
      onClick={() => setConnected((v) => !v)}
      style={{
        padding: "10px 14px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.25)",
        background: connected ? "#22C55E" : "transparent",
        color: "white",
        fontWeight: 700,
        cursor: "pointer",
      }}
      title="Frontend trước: đang giả lập"
    >
      {connected ? "✅ Đã kết nối ví" : "🔗 Kết nối ví"}
    </button>
  );
}
