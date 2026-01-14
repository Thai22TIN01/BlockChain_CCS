export default function DisconnectModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(520px, 100%)",
          background: "white",
          borderRadius: 16,
          padding: 18,
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: "#ECFDF5",
              display: "grid",
              placeItems: "center",
              fontWeight: 900,
              color: "#16A34A",
            }}
          >
            ✓
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16, color: "#111827" }}>
              Đã đăng xuất khỏi giao diện
            </div>
            <div style={{ color: "#6B7280", fontSize: 13, marginTop: 2 }}>
              Muốn ngắt kết nối thật trong MetaMask thì làm thêm bước dưới.
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            padding: 12,
            background: "#F9FAFB",
            border: "1px solid #E5E7EB",
            borderRadius: 12,
            color: "#111827",
            lineHeight: 1.5,
            fontSize: 14,
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 6 }}>
            Ngắt kết nối thật trong MetaMask:
          </div>
          <ol style={{ margin: 0, paddingLeft: 18 }}>
            <li>Mở MetaMask</li>
            <li>Nhấn (⋮) hoặc menu</li>
            <li>
              Chọn <b>Connected sites</b>
            </li>
            <li>
              Chọn <b>localhost:5173</b> → <b>Disconnect</b>
            </li>
          </ol>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button
            onClick={() => navigator.clipboard.writeText("localhost:5173")}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #E5E7EB",
              background: "white",
              cursor: "pointer",
              fontWeight: 700,
            }}
            title="Copy để tìm nhanh trong Connected sites nếu cần"
          >
            Copy localhost
          </button>

          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 12,
              border: "none",
              background: "#111827",
              color: "white",
              cursor: "pointer",
              fontWeight: 800,
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
