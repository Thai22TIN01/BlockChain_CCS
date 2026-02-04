import { useState, useEffect } from "react";
import { getAllCertificates, getContractOwner } from "../web3/certificate";
import { getCurrentAccount } from "../web3/wallet";

export default function MyCertificates() {
  const [allCertificates, setAllCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [error, setError] = useState("");

  // Hàm fetch tất cả chứng chỉ (chỉ fetch, không check admin)
  const fetchAllCertificates = async () => {
    try {
      setError("");
      const allCerts = await getAllCertificates();
      setAllCertificates(allCerts);
      setFilteredCertificates(allCerts); // mặc định hiển thị tất cả
      return allCerts;
    } catch (err) {
      // Xử lý riêng lỗi "Sai network" khi fetch certificates
      if (err.message && err.message.includes("Sai network")) {
        setError("Vui lòng chuyển sang mạng Sepolia trong MetaMask để xem dữ liệu");
        throw err;
      }
      // Nếu là lỗi khác, throw lại để xử lý ở catch bên ngoài
      throw err;
    }
  };

  // Hàm làm mới: reset filter và reload danh sách
  const handleRefresh = async () => {
    // Reset giá trị Từ ngày và Đến ngày về rỗng
    setFromDate("");
    setToDate("");
    
    // Gọi lại hàm load danh sách chứng chỉ
    try {
      setLoading(true);
      await fetchAllCertificates();
    } catch (err) {
      // Error đã được xử lý trong fetchAllCertificates
      if (!err.message || !err.message.includes("Sai network")) {
        console.error("Error refreshing certificates:", err);
        setError("Lỗi khi tải dữ liệu: " + (err.message || "Không thể kết nối"));
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if current wallet is admin and fetch certificates
  useEffect(() => {
    let isMounted = true;

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
        let owner;
        try {
          owner = await getContractOwner();
        } catch (err) {
          // Xử lý riêng lỗi "Sai network"
          if (err.message && err.message.includes("Sai network")) {
            setError("Vui lòng chuyển sang mạng Sepolia trong MetaMask để xem dữ liệu");
            setIsAdmin(false);
            setCheckingAdmin(false);
            setLoading(false);
            return;
          }
          // Nếu là lỗi khác, throw lại để xử lý ở catch bên ngoài
          throw err;
        }

        if (!isMounted) return;

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
        if (isMounted) {
          await fetchAllCertificates();
        }
      } catch (err) {
        // Chỉ log error một lần và không log lỗi "Sai network" vì đã xử lý ở trên
        if (!err.message || !err.message.includes("Sai network")) {
          console.error("Error checking admin or fetching certificates:", err);
        }
        if (isMounted) {
          setError("Lỗi khi tải dữ liệu: " + (err.message || "Không thể kết nối"));
          setIsAdmin(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setCheckingAdmin(false);
        }
      }
    };

    checkAdminAndFetch();

    // Re-check when account or chain changes
    if (window.ethereum) {
      const onAccountsChanged = () => {
        if (isMounted) {
          checkAdminAndFetch();
        }
      };
      const onChainChanged = () => {
        if (isMounted) {
          checkAdminAndFetch();
        }
      };
      window.ethereum.on("accountsChanged", onAccountsChanged);
      window.ethereum.on("chainChanged", onChainChanged);
      return () => {
        isMounted = false;
        window.ethereum.removeListener("accountsChanged", onAccountsChanged);
        window.ethereum.removeListener("chainChanged", onChainChanged);
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFilter = () => {
    // Nếu fromDate hoặc toDate trống → hiển thị tất cả
    if (!fromDate || !toDate) {
      setFilteredCertificates(allCertificates);
      return;
    }

    // Chuyển đổi fromDate và toDate sang Date objects (start of day và end of day)
    const from = new Date(fromDate);
    from.setHours(0, 0, 0, 0);
    const fromTimestamp = Math.floor(from.getTime() / 1000); // Convert to seconds

    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);
    const toTimestamp = Math.floor(to.getTime() / 1000); // Convert to seconds

    // Lọc các chứng chỉ có ngày cấp nằm trong khoảng từ fromDate đến toDate (bao gồm cả 2 ngày)
    const filtered = allCertificates.filter((cert) => {
      const issuedTimestamp = cert.issuedAtTimestamp;
      return issuedTimestamp >= fromTimestamp && issuedTimestamp <= toTimestamp;
    });

    setFilteredCertificates(filtered);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const hasCertificates = filteredCertificates && filteredCertificates.length > 0;

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
          borderRadius: "16px",
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
          Danh sách chứng chỉ
        </h2>

        {loading || checkingAdmin ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#b3b3b3",
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
                color: "#d4a73a",
              }}
            >
              Đang tải dữ liệu...
            </p>
            <p style={{ fontSize: "15px", color: "#b3b3b3" }}>
              Vui lòng đợi trong giây lát
            </p>
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#f87171",
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
                color: "#f87171",
              }}
            >
              {error}
            </p>
            {!isAdmin && (
              <p style={{ fontSize: "15px", color: "#b3b3b3", marginTop: "8px" }}>
                Chỉ ví admin (ví deploy contract) mới có quyền truy cập trang này
              </p>
            )}
          </div>
        ) : !hasCertificates ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#b3b3b3",
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
                color: "#d4a73a",
              }}
            >
              Chưa có chứng chỉ nào
            </p>
            <p style={{ fontSize: "15px", color: "#b3b3b3" }}>
              Chưa có chứng chỉ nào được cấp trên hệ thống
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                marginBottom: "20px",
                padding: "12px 16px",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                borderRadius: "8px",
                fontSize: "14px",
                color: "#10b981",
                textAlign: "center",
                fontWeight: 500,
              }}
            >
              ✅ <strong>Quyền admin:</strong> Đang hiển thị tất cả chứng chỉ đã được cấp
            </div>

            {/* Bộ lọc theo ngày */}
            <div
              style={{
                marginBottom: "24px",
                padding: "20px",
                backgroundColor: "#1a1a1a",
                borderRadius: "8px",
                border: "1px solid rgba(212, 167, 58, 0.2)",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: "16px",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#d4a73a",
                }}
              >
                Lọc theo ngày cấp
              </h3>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
                  alignItems: "flex-end",
                }}
              >
                <div style={{ flex: "1", minWidth: "150px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#b3b3b3",
                      marginBottom: "6px",
                    }}
                  >
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      fontSize: "14px",
                      border: "1px solid rgba(212, 167, 58, 0.3)",
                      borderRadius: "6px",
                      color: "#b3b3b3",
                      backgroundColor: "#0b0b0b",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#d4a73a";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(212, 167, 58, 0.3)";
                    }}
                  />
                </div>
                <div style={{ flex: "1", minWidth: "150px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#b3b3b3",
                      marginBottom: "6px",
                    }}
                  >
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      fontSize: "14px",
                      border: "1px solid rgba(212, 167, 58, 0.3)",
                      borderRadius: "6px",
                      color: "#b3b3b3",
                      backgroundColor: "#0b0b0b",
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
                  onClick={handleFilter}
                  style={{
                    padding: "8px 24px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#ffffff",
                    backgroundColor: "#F9C74F",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    height: "38px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F7B731";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#F9C74F";
                  }}
                >
                  Lọc
                </button>
                <button
                  onClick={handleRefresh}
                  style={{
                    padding: "8px 24px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#ffffff",
                    backgroundColor: "#F9C74F",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    height: "38px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F7B731";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#F9C74F";
                  }}
                >
                  Làm mới
                </button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              {filteredCertificates.map((cert, index) => (
                <div
                  key={cert.certificateId || index}
                  style={{
                    padding: "24px",
                    backgroundColor: "#1a1a1a",
                    borderRadius: "8px",
                    border: "1px solid rgba(212, 167, 58, 0.2)",
                    transition: "box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 2px 4px rgba(212, 167, 58, 0.2)";
                    e.currentTarget.style.borderColor = "rgba(212, 167, 58, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = "rgba(212, 167, 58, 0.2)";
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
                          color: "#b3b3b3",
                          marginBottom: "4px",
                        }}
                      >
                        Mã chứng chỉ:{" "}
                        <span style={{ color: "#d4a73a" }}>
                          {cert.certificateId}
                        </span>
                      </div>
                      <h3
                        style={{
                          margin: 0,
                          marginBottom: "8px",
                          fontSize: "20px",
                          fontWeight: 600,
                          color: "#d4a73a",
                        }}
                      >
                        {cert.certificateName}
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "16px",
                          color: "#b3b3b3",
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
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "16px",
                      paddingTop: "16px",
                      borderTop: "1px solid rgba(212, 167, 58, 0.2)",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#b3b3b3",
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
                          color: "#b3b3b3",
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
                          color: "#b3b3b3",
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
                          color: "#b3b3b3",
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
                backgroundColor: "#1a1a1a",
                borderRadius: "8px",
                border: "1px solid rgba(212, 167, 58, 0.2)",
                textAlign: "center",
                fontSize: "14px",
                color: "#b3b3b3",
              }}
            >
              Đang hiển thị: <strong style={{ color: "#d4a73a" }}>{filteredCertificates.length}</strong> /{" "}
              <strong style={{ color: "#d4a73a" }}>{allCertificates.length}</strong> chứng chỉ
            </div>
          </>
        )}
      </div>

      {/* Nút cuộn trang */}
      <div
        style={{
          position: "fixed",
          right: "24px",
          bottom: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          zIndex: 1000,
        }}
      >
        {/* Nút lên đầu trang */}
        <button
          onClick={scrollToTop}
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "#F9C74F",
            color: "#ffffff",
            border: "none",
            fontSize: "24px",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 6px rgba(249, 199, 79, 0.3), 0 2px 4px rgba(0, 0, 0, 0.06)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#F7B731";
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 6px 8px rgba(249, 199, 79, 0.4), 0 4px 6px rgba(0, 0, 0, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#F9C74F";
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 6px rgba(249, 199, 79, 0.3), 0 2px 4px rgba(0, 0, 0, 0.06)";
          }}
          title="Lên đầu trang"
        >
          ↑
        </button>

        {/* Nút xuống cuối trang */}
        <button
          onClick={scrollToBottom}
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "#F9C74F",
            color: "#ffffff",
            border: "none",
            fontSize: "24px",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 6px rgba(249, 199, 79, 0.3), 0 2px 4px rgba(0, 0, 0, 0.06)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#F7B731";
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 6px 8px rgba(249, 199, 79, 0.4), 0 4px 6px rgba(0, 0, 0, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#F9C74F";
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 6px rgba(249, 199, 79, 0.3), 0 2px 4px rgba(0, 0, 0, 0.06)";
          }}
          title="Xuống cuối trang"
        >
          ↓
        </button>
      </div>
    </div>
  );
}
