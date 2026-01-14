import { useEffect, useState } from "react";
import { connectWallet, getCurrentAccount } from "../web3/wallet";
import DisconnectModal from "./DisconnectModal";
import ConfirmLogoutModal from "./ConfirmLogoutModal";

export default function WalletButton() {
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false); // NEW
  const [showLogoutModal, setShowLogoutModal] = useState(false); // modal hướng dẫn sau logout

  // Load account nếu site đã từng connect
  useEffect(() => {
    (async () => {
      const acc = await getCurrentAccount();
      if (acc) {
        setAccount(acc);
        setShowLogoutModal(false);
        setConfirmOpen(false);
      }
    })();

    if (!window.ethereum) return;

    const onAccountsChanged = (accs) => {
      const acc = accs?.[0] || "";
      setAccount(acc);

      // Nếu có account => đang connect => đóng các modal
      if (acc) {
        setShowLogoutModal(false);
        setConfirmOpen(false);
      }
    };

    window.ethereum.on("accountsChanged", onAccountsChanged);
    return () =>
      window.ethereum.removeListener("accountsChanged", onAccountsChanged);
  }, []);

  // Kết nối ví
  const onConnect = async () => {
    try {
      if (!window.ethereum) {
        alert("Chưa thấy MetaMask. Cài extension hoặc bật MetaMask lên nha.");
        return;
      }

      setLoading(true);
      setShowLogoutModal(false);
      setConfirmOpen(false);

      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      const res = await connectWallet();
      if (res?.account) {
        setAccount(res.account);
        setShowLogoutModal(false);
        setConfirmOpen(false);
      }
    } catch (err) {
      console.error(err);
      alert("Kết nối MetaMask thất bại. Mở Console (F12) xem lỗi.");
    } finally {
      setLoading(false);
    }
  };

  // Đăng xuất (frontend) - chỉ gọi khi đã confirm
  const onLogout = () => {
    setAccount("");
    setShowLogoutModal(true); // hiện modal hướng dẫn ngắt kết nối thật
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

          {/* đổi: bấm là hỏi xác nhận */}
          <button
            onClick={() => setConfirmOpen(true)}
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

      {/* MODAL XÁC NHẬN */}
      <ConfirmLogoutModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          onLogout();
        }}
      />

      {/* MODAL HƯỚNG DẪN SAU KHI LOGOUT */}
      <DisconnectModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </>
  );
}
