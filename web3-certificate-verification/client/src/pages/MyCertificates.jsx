import { useState, useEffect } from "react";
import { getAllCertificates, getContractOwner } from "../web3/certificate";
import { getCurrentAccount } from "../web3/wallet";

export default function MyCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [error, setError] = useState("");

  // Check if current wallet is admin and fetch certificates
  useEffect(() => {
    const checkAdminAndFetch = async () => {
      try {
        setLoading(true);
        setError("");

        if (!window.ethereum) {
          setError("Chưa cài MetaMask");
          setCheckingAdmin(false);
          setLoading(false);
          return;
        }

        const currentAccount = await getCurrentAccount();
        if (!currentAccount) {
          setError("Vui lòng kết nối ví MetaMask");
          setCheckingAdmin(false);
          setLoading(false);
          return;
        }

        // Check if current wallet is admin
        const owner = await getContractOwner();
        const adminStatus =
          owner.toLowerCase() === currentAccount.toLowerCase();
        setIsAdmin(adminStatus);
        setCheckingAdmin(false);

        if (!adminStatus) {
          setError("Chỉ admin mới có quyền xem danh sách tất cả chứng chỉ");
          setLoading(false);
          return;
        }

        // Admin: Fetch all certificates
        const allCerts = await getAllCertificates();
        setCertificates(allCerts);
      } catch (err) {
        console.error("Error checking admin or fetching certificates:", err);
        setError("Lỗi khi tải dữ liệu: " + (err.message || "Không thể kết nối"));
        setIsAdmin(false);
      } finally {
        setLoading(false);
        setCheckingAdmin(false);
      }
    };

    checkAdminAndFetch();

    // Re-check when account changes
    if (window.ethereum) {
      const onAccountsChanged = () => {
        checkAdminAndFetch();
      };
      window.ethereum.on("accountsChanged", onAccountsChanged);
      return () => {
        window.ethereum.removeListener("accountsChanged", onAccountsChanged);
      };
    }
  }, []);

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
          Danh sách chứng chỉ
        </h2>

        {loading || checkingAdmin ? (
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
              ⏳
            </div>
            <p
              style={{
                fontSize: "18px",
                fontWeight: 500,
                marginBottom: "8px",
                color: "#374151",
              }}
            >
              Đang tải dữ liệu...
            </p>
            <p style={{ fontSize: "15px", color: "#9ca3af" }}>
              Vui lòng đợi trong giây lát
            </p>
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#dc2626",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
              }}
            >
              {!isAdmin ? "🚫" : "❌"}
            </div>
            <p
              style={{
                fontSize: "18px",
                fontWeight: 500,
                marginBottom: "8px",
                color: "#dc2626",
              }}
            >
              {error}
            </p>
            {!isAdmin && (
              <p style={{ fontSize: "15px", color: "#9ca3af", marginTop: "8px" }}>
                Chỉ ví admin (ví deploy contract) mới có quyền truy cập trang này
              </p>
            )}
          </div>
        ) : !hasCertificates ? (
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
              Chưa có chứng chỉ nào được cấp trên hệ thống
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                marginBottom: "20px",
                padding: "12px 16px",
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "8px",
                fontSize: "14px",
                color: "#16a34a",
                textAlign: "center",
                fontWeight: 500,
              }}
            >
              ✅ <strong>Quyền admin:</strong> Đang hiển thị tất cả chứng chỉ đã được cấp
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
                  key={cert.certificateId || index}
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
