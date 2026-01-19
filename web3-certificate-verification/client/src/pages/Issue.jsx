import { useState } from "react";
import { issueCertificate } from "../web3/certificate";

export default function Issue() {
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [certificateName, setCertificateName] = useState("");
  const [message, setMessage] = useState("");

  const handleIssue = async () => {
    try {
      setMessage("Đang gửi giao dịch...");
      const tx = await issueCertificate(
        studentId,
        studentName,
        certificateName
      );
      await tx.wait();
      setMessage("✅ Cấp chứng chỉ thành công!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi: chỉ admin (ví deploy) mới được cấp");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "calc(100vh - 200px)",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 500,
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
          padding: "40px",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "30px",
            fontSize: "28px",
            fontWeight: 600,
            color: "#1f2937",
            textAlign: "center",
          }}
        >
          Cấp chứng chỉ
        </h2>

        <div style={{ marginBottom: "16px" }}>
          <input
            placeholder="Mã sinh viên"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleIssue();
              }
            }}
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: "16px",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              outline: "none",
              transition: "border-color 0.2s",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#3b82f6";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e5e7eb";
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <input
            placeholder="Tên sinh viên"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleIssue();
              }
            }}
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: "16px",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              outline: "none",
              transition: "border-color 0.2s",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#3b82f6";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e5e7eb";
            }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <input
            placeholder="Tên chứng chỉ"
            value={certificateName}
            onChange={(e) => setCertificateName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleIssue();
              }
            }}
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: "16px",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              outline: "none",
              transition: "border-color 0.2s",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#3b82f6";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e5e7eb";
            }}
          />
        </div>

        <button
          onClick={handleIssue}
          style={{
            width: "100%",
            padding: "14px 24px",
            fontSize: "16px",
            fontWeight: 600,
            color: "#ffffff",
            backgroundColor: "#10b981",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background-color 0.2s, transform 0.1s",
            boxShadow: "0 2px 4px rgba(16, 185, 129, 0.3)",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#059669";
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#10b981";
            e.target.style.transform = "translateY(0)";
          }}
          onMouseDown={(e) => {
            e.target.style.transform = "translateY(0)";
          }}
        >
          Cấp chứng chỉ
        </button>

        {message && (
          <div
            style={{
              marginTop: "24px",
              padding: "16px",
              backgroundColor: message.includes("✅")
                ? "#f0fdf4"
                : message.includes("❌")
                ? "#fef2f2"
                : "#eff6ff",
              border: `1px solid ${
                message.includes("✅")
                  ? "#bbf7d0"
                  : message.includes("❌")
                  ? "#fecaca"
                  : "#bfdbfe"
              }`,
              borderRadius: "8px",
              color: message.includes("✅")
                ? "#16a34a"
                : message.includes("❌")
                ? "#dc2626"
                : "#2563eb",
              textAlign: "center",
              fontSize: "15px",
              fontWeight: 500,
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
