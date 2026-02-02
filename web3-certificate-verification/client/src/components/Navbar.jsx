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

  return (
    <div style={{ background: "#111827" }}>
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
        <div style={{ color: "white", fontWeight: 800 }}>
          CHỨNG CHỈ WEB3
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            marginLeft: 12,
            background: "white",
            padding: 6,
            borderRadius: 14,
          }}
        >
          <NavLink to="/" style={linkStyle}>
            Xác thực
          </NavLink>

          {isAdmin && (
            <>
              <NavLink to="/cap" style={linkStyle}>
                Cấp
              </NavLink>

              <NavLink to="/thu-hoi" style={linkStyle}>
                Thu hồi
              </NavLink>

              <NavLink to="/danh-sach-chung-chi" style={linkStyle}>
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
