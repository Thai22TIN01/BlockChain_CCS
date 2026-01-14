export default function ConfirmLogoutModal({ open, onClose, onConfirm }) {
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
          width: "min(460px, 100%)",
          background: "white",
          borderRadius: 16,
          padding: 18,
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 16, color: "#111827" }}>
          Xác nhận đăng xuất
        </div>
        <div style={{ color: "#6B7280", fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
          Bạn có chắc muốn đăng xuất khỏi giao diện không?
          <br />
          (Ví vẫn có thể đang “Connected” trong MetaMask.)
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #E5E7EB",
              background: "white",
              cursor: "pointer",
              fontWeight: 800,
            }}
          >
            Hủy
          </button>

          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 12,
              border: "none",
              background: "#111827",
              color: "white",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
