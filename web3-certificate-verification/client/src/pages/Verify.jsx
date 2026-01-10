import { useMemo, useState } from "react";

function Badge({ type }) {
  const map = {
    valid: { text: "✅ HỢP LỆ", bg: "#DCFCE7", color: "#166534" },
    revoked: { text: "⚠️ ĐÃ BỊ THU HỒI", bg: "#FFEDD5", color: "#9A3412" },
    not_found: { text: "❌ KHÔNG TỒN TẠI", bg: "#FEE2E2", color: "#991B1B" },
  };
  const s = map[type];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 10px",
        borderRadius: 999,
        background: s.bg,
        color: s.color,
        fontWeight: 800,
        fontSize: 13,
      }}
    >
      {s.text}
    </span>
  );
}

function ResultCard({ data }) {
  return (
    <div
      style={{
        marginTop: 14,
        border: "1px solid #E5E7EB",
        borderRadius: 16,
        padding: 16,
        background: "white",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontWeight: 900, fontSize: 16 }}>KẾT QUẢ XÁC THỰC</div>
        <Badge type={data.status} />
      </div>

      {data.status === "not_found" ? (
        <div style={{ marginTop: 10, color: "#374151" }}>
          Chứng chỉ này không được ghi nhận trên hệ thống.
        </div>
      ) : (
        <>
          <div style={{ marginTop: 12, color: "#111827", lineHeight: 1.8 }}>
            <div>
              <b>Mã chứng chỉ:</b> {data.certificateId}
            </div>
            <div>
              <b>Loại chứng chỉ:</b> {data.type}
            </div>
            <div>
              <b>Đơn vị cấp:</b> {data.issuer}
            </div>
            <div>
              <b>Ngày cấp:</b> {data.issuedDate}
            </div>
            <div style={{ wordBreak: "break-all" }}>
              <b>Mã giao dịch blockchain:</b> {data.txHash}
              <span style={{ opacity: 0.65 }}> (để sau)</span>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <button
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                background: "#F9FAFB",
                cursor: "pointer",
                fontWeight: 700,
              }}
              onClick={() => alert("Bước blockchain để sau. Hiện tại chỉ làm giao diện.")}
            >
              Xem trên blockchain
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function Verify() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);

  // DỮ LIỆU GIẢ LẬP (để demo UI trước)
  const mockDB = useMemo(
    () => ({
      "CC-ENG-2025-001": {
        status: "valid",
        certificateId: "CC-ENG-2025-001",
        type: "Chứng chỉ Tiếng Anh",
        issuer: "Trung tâm ABC",
        issuedDate: "12/05/2025",
        txHash: "0xA92F...D31",
      },
      "CC-IT-2025-007": {
        status: "revoked",
        certificateId: "CC-IT-2025-007",
        type: "Chứng chỉ Tin học",
        issuer: "Trường XYZ",
        issuedDate: "20/06/2025",
        txHash: "0x19B0...9AA",
      },
    }),
    []
  );

  const onVerify = () => {
    const key = code.trim().toUpperCase();
    if (!key) {
      alert("Vui lòng nhập mã chứng chỉ.");
      return;
    }
    const found = mockDB[key];
    if (!found) {
      setResult({ status: "not_found" });
    } else {
      setResult(found);
    }
  };

  return (
    <div style={{ background: "#F3F4F6", minHeight: "calc(100vh - 72px)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 16px" }}>
        {/* Tiêu đề */}
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 28, fontWeight: 950, color: "#111827" }}>
            HỆ THỐNG XÁC THỰC CHỨNG CHỈ SỐ
          </div>
          <div style={{ marginTop: 6, color: "#4B5563" }}>
            Ứng dụng công nghệ blockchain để kiểm tra tính hợp lệ của chứng chỉ
          </div>
        </div>

        {/* Khối nhập + nút */}
        <div
          style={{
            background: "white",
            borderRadius: 18,
            padding: 18,
            border: "1px solid #E5E7EB",
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 8, color: "#111827" }}>
            Mã chứng chỉ
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ví dụ: CC-ENG-2025-001"
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid #D1D5DB",
                outline: "none",
                fontSize: 15,
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") onVerify();
              }}
            />
            <button
              onClick={onVerify}
              style={{
                padding: "12px 16px",
                borderRadius: 14,
                border: "none",
                background: "#4F46E5",
                color: "white",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              XÁC THỰC CHỨNG CHỈ
            </button>
          </div>

          <div style={{ marginTop: 10, color: "#6B7280", fontSize: 13 }}>
            Gợi ý mã demo: <b>CC-ENG-2025-001</b> (hợp lệ), <b>CC-IT-2025-007</b> (thu hồi)
          </div>

          {/* Kết quả */}
          {result && <ResultCard data={result} />}
        </div>
      </div>
    </div>
  );
}
