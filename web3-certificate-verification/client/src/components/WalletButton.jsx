import { useEffect, useState } from "react";
import { connectWallet, getCurrentAccount } from "../web3/wallet";

export default function WalletButton() {
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Load account nếu site đã từng connect
  useEffect(() => {
    (async () => {
      const acc = await getCurrentAccount();
      if (acc) {
        setAccount(acc);
        setShowLogoutModal(false); // nếu đang mở modal logout thì đóng lại
      }
    })();

    if (!window.ethereum) return;

    const onAccountsChanged = (accs) => {
      const acc = accs?.[0] || "";
      setAccount(acc);

      // Nếu có account => chắc chắn đang connect => không được hiện modal "đăng xuất"
      if (acc) setShowLogoutModal(false);
    };

    window.ethereum.on("accountsChanged", onAccountsChanged);
    return () => window.ethereum.removeListener("accountsChanged", onAccountsChanged);
  }, []);

  // Kết nối ví
  const onConnect = async () => {
    try {
      if (!window.ethereum) {
        alert("Chưa thấy MetaMask. Cài extension hoặc bật MetaMask lên nha.");
        return;
      }

      setLoading(true);
      setShowLogoutModal(false); // connect lại thì đóng modal logout (nếu còn)

      // Ép MetaMask hỏi lại quyền account (luôn bật popup)
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      const res = await connectWallet();
      if (res?.account) {
        setAccount(res.account);
        setShowLogoutModal(false); // connect thành công => đóng modal
      }
    } catch (err) {
      console.error(err);
      alert("Kết nối MetaMask thất bại. Mở Console (F12) xem lỗi.");
    } finally {
      setLoading(false);
    }
  };

  // Đăng xuất (frontend)
  const onLogout = () => {
    setAccount("");
    setShowLogoutModal(true); // CHỈ bật modal ở đây
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

  return (
    <>
      {/* NÚT */}
      {!account ? (
        <button
          onClick={onConnect}
          disabled={loading}
          style={{
            ...btnBase,
            background: "transparent",
            opacity: loading ? 0.7 : 1,
          }}
          title="Kết nối ví MetaMask"
        >
          {loading ? "⏳ Đang kết nối..." : "🔗 Kết nối ví"}
        </button>
      ) : (
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
      )}

      {/* MODAL LOGOUT - CHỈ HIỆN KHI showLogoutModal = true */}
      {showLogoutModal && (
        <div
          onClick={() => setShowLogoutModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: 16,
              padding: 22,
              minWidth: 360,
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>
              ✅ Đã đăng xuất khỏi ví
            </div>

            <button
              onClick={() => setShowLogoutModal(false)}
              style={{
                width: "100%",
                padding: "10px 16px",
                borderRadius: 12,
                border: "none",
                background: "#111827",
                color: "white",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
