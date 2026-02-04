import { NavLink } from "react-router-dom";
import WalletButton from "./WalletButton";
import { useEffect, useState } from "react";

// 👉 ví admin (đúng ví deploy contract)
const ADMIN_ADDRESS = "0xa473930Bd3cd3aA3AC5d30C6ec38b2C6e270546b";

const linkStyle = ({ isActive }) => ({
  padding: "10px 12px",
  borderRadius: 10,
  textDecoration: "none",
  color: "#111827",
  background: isActive ? "#EEF2FF" : "transparent",
  fontWeight: isActive ? 700 : 500,
});

export default function Navbar() {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0].toLowerCase());
      }
    });

    // lắng nghe đổi ví
    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0].toLowerCase());
      } else {
        setAccount(null);
      }
    });
  }, []);

  const isAdmin =
    account && account === ADMIN_ADDRESS.toLowerCase();

  const linkStyleDark = ({ isActive }) => ({
    padding: "10px 12px",
    borderRadius: 10,
    textDecoration: "none",
    color: isActive ? "#0b0b0b" : "#b3b3b3",
    background: isActive ? "#d4a73a" : "transparent",
    fontWeight: isActive ? 700 : 500,
    transition: "all 0.2s",
  });

  return (
    <div style={{ background: "#0b0b0b", borderBottom: "1px solid rgba(212, 167, 58, 0.2)" }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ color: "#d4a73a", fontWeight: 800, fontSize: "18px" }}>
          HỆ THỐNG TRA CỨU CHỨNG CHỈ
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            marginLeft: 12,
            background: "#1a1a1a",
            padding: 6,
            borderRadius: 14,
            border: "1px solid rgba(212, 167, 58, 0.2)",
          }}
        >
          <NavLink to="/" style={linkStyleDark}>
            Tra cứu
          </NavLink>

          {isAdmin && (
            <>
              <NavLink to="/cap" style={linkStyleDark}>
                Cấp
              </NavLink>

              <NavLink to="/thu-hoi" style={linkStyleDark}>
                Thu hồi
              </NavLink>

              <NavLink to="/danh-sach-chung-chi" style={linkStyleDark}>
                Danh sách chứng chỉ
              </NavLink>
            </>
          )}
        </div>

        <div style={{ marginLeft: "auto" }}>
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
