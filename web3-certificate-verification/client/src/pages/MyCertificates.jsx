import { useState } from "react";

export default function MyCertificates() {
  // Mock data for frontend UI demonstration
  // In real implementation, this would fetch from blockchain based on connected wallet
  const [certificates] = useState([
    // Sample certificates - replace with actual blockchain data
    {
      studentId: "SV001",
      studentName: "Nguyễn Văn A",
      certificateName: "Chứng chỉ Blockchain Developer",
      issuedAt: new Date("2024-01-15").toLocaleString("vi-VN"),
      revoked: false,
    },
    {
      studentId: "SV001",
      studentName: "Nguyễn Văn A",
      certificateName: "Chứng chỉ Web3 Fundamentals",
      issuedAt: new Date("2024-02-20").toLocaleString("vi-VN"),
      revoked: false,
    },
  ]);

  const hasCertificates = certificates && certificates.length > 0;

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
          maxWidth: 800,
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
          Chứng chỉ của tôi
        </h2>

        {!hasCertificates ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#6b7280",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
              }}
            >
              📜
            </div>
            <p
              style={{
                fontSize: "18px",
                fontWeight: 500,
                marginBottom: "8px",
                color: "#374151",
              }}
            >
              Chưa có chứng chỉ nào
            </p>
            <p style={{ fontSize: "15px", color: "#9ca3af" }}>
              Các chứng chỉ của bạn sẽ được hiển thị tại đây khi được cấp
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                marginBottom: "20px",
                padding: "12px 16px",
                backgroundColor: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "8px",
                fontSize: "14px",
                color: "#1e40af",
                textAlign: "center",
              }}
            >
              💡 <strong>Chế độ xem:</strong> Đây là giao diện frontend mẫu.
              Dữ liệu thực sẽ được lấy từ blockchain khi tích hợp.
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              {certificates.map((cert, index) => (
                <div
                  key={index}
                  style={{
                    padding: "24px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    transition: "box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 2px 4px rgba(0, 0, 0, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "16px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          margin: 0,
                          marginBottom: "8px",
                          fontSize: "20px",
                          fontWeight: 600,
                          color: "#1f2937",
                        }}
                      >
                        {cert.certificateName}
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "16px",
                          color: "#4b5563",
                          fontWeight: 500,
                        }}
                      >
                        {cert.studentName}
                      </p>
                    </div>
                    <div
                      style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: 600,
                        backgroundColor: cert.revoked
                          ? "#fef2f2"
                          : "#f0fdf4",
                        color: cert.revoked ? "#dc2626" : "#16a34a",
                      }}
                    >
                      {cert.revoked ? "❌ Đã thu hồi" : "✅ Hợp lệ"}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "16px",
                      paddingTop: "16px",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#6b7280",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          marginBottom: "4px",
                        }}
                      >
                        Mã sinh viên
                      </div>
                      <div
                        style={{
                          fontSize: "15px",
                          color: "#1f2937",
                          fontWeight: 500,
                        }}
                      >
                        {cert.studentId}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#6b7280",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          marginBottom: "4px",
                        }}
                      >
                        Ngày cấp
                      </div>
                      <div
                        style={{
                          fontSize: "15px",
                          color: "#1f2937",
                          fontWeight: 500,
                        }}
                      >
                        {cert.issuedAt}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "24px",
                padding: "16px",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                textAlign: "center",
                fontSize: "14px",
                color: "#6b7280",
              }}
            >
              Tổng số: <strong>{certificates.length}</strong> chứng chỉ
            </div>
          </>
        )}
      </div>
    </div>
  );
}
