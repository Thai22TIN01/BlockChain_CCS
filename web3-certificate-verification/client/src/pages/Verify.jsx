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
          backgroundColor: "#111111",
          borderRadius: "12px",
          border: "1px solid rgba(212, 167, 58, 0.2)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
          padding: "40px",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "30px",
            fontSize: "28px",
            fontWeight: 600,
            color: "#d4a73a",
            textAlign: "center",
          }}
        >
          Tra cứu chứng chỉ
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
              border: "2px solid rgba(212, 167, 58, 0.3)",
              borderRadius: "8px",
              outline: "none",
              transition: "border-color 0.2s",
              boxSizing: "border-box",
              backgroundColor: "#1a1a1a",
              color: "#b3b3b3",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#d4a73a";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(212, 167, 58, 0.3)";
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
            color: "#0b0b0b",
            backgroundColor: loading ? "#9ca3af" : "#d4a73a",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background-color 0.2s, transform 0.1s",
            boxShadow: loading
              ? "none"
              : "0 2px 4px rgba(212, 167, 58, 0.3)",
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = "#b8941f";
              e.target.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = "#d4a73a";
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
              backgroundColor: "rgba(220, 38, 38, 0.1)",
              border: "1px solid rgba(220, 38, 38, 0.3)",
              borderRadius: "8px",
              color: "#f87171",
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
                color: "#d4a73a",
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
                    backgroundColor: "#1a1a1a",
                    borderRadius: "8px",
                    border: "1px solid rgba(212, 167, 58, 0.2)",
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
                          color: "#b3b3b3",
                          marginBottom: "4px",
                        }}
                      >
                        Mã chứng chỉ:{" "}
                        <span style={{ color: "#d4a73a" }}>
                          {cert.certificateId}
                        </span>
                      </div>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: "18px",
                          fontWeight: 600,
                          color: "#d4a73a",
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
                          ? "rgba(220, 38, 38, 0.2)"
                          : "rgba(16, 185, 129, 0.2)",
                        color: cert.revoked ? "#f87171" : "#10b981",
                        border: `1px solid ${cert.revoked ? "rgba(220, 38, 38, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
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
                      borderTop: "1px solid rgba(212, 167, 58, 0.2)",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#b3b3b3",
                          marginBottom: "4px",
                        }}
                      >
                        Tên
                      </div>
                      <div style={{ fontSize: "14px", color: "#b3b3b3" }}>
                        {cert.studentName}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#b3b3b3",
                          marginBottom: "4px",
                        }}
                      >
                        Ngày cấp
                      </div>
                      <div style={{ fontSize: "14px", color: "#b3b3b3" }}>
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
