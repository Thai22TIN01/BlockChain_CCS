import { useState } from "react";
import { getCertificate, getCertificatesOfStudent } from "../web3/certificate";

export default function Verify() {
  const [studentId, setStudentId] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    try {
      setError("");
      setCertificates([]);
      setLoading(true);

      // Ensure studentId is treated strictly as a string
      const trimmedStudentId = studentId.trim();
      console.log("🔍 [DEBUG] Student ID being sent:", trimmedStudentId);
      console.log("🔍 [DEBUG] Student ID type:", typeof trimmedStudentId);
      console.log("🔍 [DEBUG] Student ID length:", trimmedStudentId.length);

      if (!trimmedStudentId) {
        throw new Error("Vui lòng nhập mã sinh viên");
      }

      // Call getCertificatesOfStudent with string studentId
      console.log("🔍 [DEBUG] Calling getCertificatesOfStudent with studentId:", trimmedStudentId);
      const certificateIds = await getCertificatesOfStudent(trimmedStudentId);
      console.log("🔍 [DEBUG] Certificate IDs returned:", certificateIds);
      console.log("🔍 [DEBUG] Certificate IDs length:", certificateIds?.length || 0);
      console.log("🔍 [DEBUG] Certificate IDs type:", Array.isArray(certificateIds));

      if (!certificateIds || certificateIds.length === 0) {
        setError("❌ Không tìm thấy chứng chỉ nào cho sinh viên này");
        setCertificates([]);
        return;
      }

      // Convert BigNumber array to number array and fetch each certificate
      const ids = certificateIds.map((id) => Number(id));
      console.log("🔍 [DEBUG] Converted certificate IDs:", ids);

      // Use Promise.all to fetch all certificates
      console.log("🔍 [DEBUG] Fetching certificates for IDs:", ids);
      const certPromises = ids.map(async (id) => {
        console.log("🔍 [DEBUG] Fetching certificate ID:", id);
        const cert = await getCertificate(id);
        console.log("🔍 [DEBUG] Certificate fetched for ID", id, ":", cert);
        return {
          certificateId: id.toString(),
          studentId: cert[1],
          studentName: cert[2],
          certificateName: cert[3],
          issuedAt: new Date(Number(cert[4]) * 1000).toLocaleString(),
          revoked: cert[5],
        };
      });

      const fetchedCertificates = await Promise.all(certPromises);
      console.log("🔍 [DEBUG] All certificates fetched:", fetchedCertificates);
      setCertificates(fetchedCertificates);
    } catch (err) {
      console.error("❌ [ERROR] Verify error:", err);
      setCertificates([]);
      setError("❌ Lỗi khi tải danh sách chứng chỉ: " + (err.message || "Không tìm thấy"));
    } finally {
      setLoading(false);
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
          Xác thực chứng chỉ
        </h2>

        <div style={{ marginBottom: "20px" }}>
          <input
            placeholder="Nhập mã sinh viên"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleVerify();
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
          onClick={handleVerify}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px 24px",
            fontSize: "16px",
            fontWeight: 600,
            color: "#ffffff",
            backgroundColor: loading ? "#9ca3af" : "#3b82f6",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background-color 0.2s, transform 0.1s",
            boxShadow: loading
              ? "none"
              : "0 2px 4px rgba(59, 130, 246, 0.3)",
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = "#2563eb";
              e.target.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = "#3b82f6";
              e.target.style.transform = "translateY(0)";
            }
          }}
        >
          {loading ? "Đang tải..." : "Xem danh sách chứng chỉ"}
        </button>

        {error && (
          <div
            style={{
              marginTop: "24px",
              padding: "16px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              color: "#dc2626",
              textAlign: "center",
              fontSize: "15px",
            }}
          >
            {error}
          </div>
        )}

        {certificates.length > 0 && (
          <div style={{ marginTop: "32px" }}>
            <h3
              style={{
                marginTop: 0,
                marginBottom: "20px",
                fontSize: "20px",
                fontWeight: 600,
                color: "#1f2937",
                textAlign: "center",
              }}
            >
              Danh sách chứng chỉ ({certificates.length})
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {certificates.map((cert, index) => (
                <div
                  key={index}
                  style={{
                    padding: "20px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "12px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#6b7280",
                          marginBottom: "4px",
                        }}
                      >
                        Mã chứng chỉ:{" "}
                        <span style={{ color: "#3b82f6" }}>
                          {cert.certificateId}
                        </span>
                      </div>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: "18px",
                          fontWeight: 600,
                          color: "#1f2937",
                        }}
                      >
                        {cert.certificateName}
                      </h4>
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
                      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: "12px",
                      paddingTop: "12px",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#6b7280",
                          marginBottom: "4px",
                        }}
                      >
                        Tên
                      </div>
                      <div style={{ fontSize: "14px", color: "#1f2937" }}>
                        {cert.studentName}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#6b7280",
                          marginBottom: "4px",
                        }}
                      >
                        Ngày cấp
                      </div>
                      <div style={{ fontSize: "14px", color: "#1f2937" }}>
                        {cert.issuedAt}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
