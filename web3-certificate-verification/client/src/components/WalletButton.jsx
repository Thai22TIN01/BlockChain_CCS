import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { connectWallet, getCurrentAccount } from "../web3/wallet";

export default function WalletButton() {
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(false);

  // Load account nếu site đã từng connect
  useEffect(() => {
    (async () => {
      const acc = await getCurrentAccount();
      if (acc) setAccount(acc);
    })();

    if (!window.ethereum) return;

    // Khi đổi account trong MetaMask → update UI
    const onAccountsChanged = (accs) => {
      setAccount(accs?.[0] || "");
    };

    window.ethereum.on("accountsChanged", onAccountsChanged);
    return () =>
      window.ethereum.removeListener("accountsChanged", onAccountsChanged);
  }, []);

  // Kết nối ví (luôn hiện popup nếu chưa có quyền)
  const onConnect = async () => {
    try {
      setLoading(true);

      // Ép MetaMask hỏi lại quyền account (luôn bật popup)
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      const res = await connectWallet();
      if (!res) return;

      setAccount(res.account);
    } catch (err) {
      console.error(err);
      alert("Kết nối MetaMask thất bại. Mở Console (F12) xem lỗi.");
    } finally {
      setLoading(false);
    }
  };

  // Đăng xuất ở frontend + gợi ý disconnect thật
  const onLogout = async () => {
    setAccount("");

    // KHÔNG thể tự disconnect MetaMask hoàn toàn bằng code,
    // nhưng có thể gợi ý user làm đúng thao tác
    alert(
      "Đã đăng xuất khỏi giao diện.\n\nMuốn ngắt kết nối thật:\nMetaMask → (⋮) → Connected sites → Disconnect localhost:5173"
    );
  };

  const btnBase = {
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.25)",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };

  // CHƯA CONNECT
  if (!account) {
    return (
      <button
        onClick={onConnect}
        disabled={loading}
        style={{
          ...btnBase,
          background: "transparent",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "⏳ Đang kết nối..." : "🔗 Kết nối ví"}
      </button>
    );
  }

  // ĐÃ CONNECT
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          ...btnBase,
          background: "#22C55E",
          cursor: "default",
        }}
        title="Ví đang kết nối"
      >
        ✅ {account.slice(0, 6)}...{account.slice(-4)}
      </div>

      <button
        onClick={onLogout}
        style={{
          ...btnBase,
          background: "transparent",
        }}
        title="Đăng xuất (frontend)"
      >
        🚪 Đăng xuất
      </button>
    </div>
  );
}
