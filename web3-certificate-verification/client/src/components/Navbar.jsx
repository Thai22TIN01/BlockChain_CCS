import { NavLink } from "react-router-dom";
import WalletButton from "./WalletButton";

const linkStyle = ({ isActive }) => ({
  padding: "10px 12px",
  borderRadius: 10,
  textDecoration: "none",
  color: "#111827",
  background: isActive ? "#EEF2FF" : "transparent",
  fontWeight: isActive ? 700 : 500,
});

export default function Navbar() {
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
        <div style={{ color: "white", fontWeight: 800, letterSpacing: 0.5 }}>
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
          <NavLink to="/cap" style={linkStyle}>
            Cấp
          </NavLink>
          <NavLink to="/thu-hoi" style={linkStyle}>
            Thu hồi
          </NavLink>
          <NavLink to="/cua-toi" style={linkStyle}>
            Của tôi
          </NavLink>
        </div>

        <div style={{ marginLeft: "auto" }}>
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
