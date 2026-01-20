import { useState, useEffect } from "react";
import { getCertificate, revokeCertificate } from "../web3/certificate";
import { getCurrentAccount } from "../web3/wallet";
import { ethers } from "ethers";
import abi from "../abi/CertificateRegistry.json";
import { CONTRACTS } from "../config/contracts";

export default function Revoke() {
  const [studentId, setStudentId] = useState("");
  const [certificateId, setCertificateId] = useState("");
  const [certificateData, setCertificateData] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Check if current wallet is admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        if (!window.ethereum) {
          setCheckingAdmin(false);
          return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        const address = CONTRACTS[Number(network.chainId)]?.CertificateRegistry;

        if (!address) {
          setCheckingAdmin(false);
          return;
        }

        const contract = new ethers.Contract(address, abi, provider);
        const owner = await contract.owner();
        const currentAccount = await getCurrentAccount();

        setIsAdmin(
          currentAccount &&
            owner.toLowerCase() === currentAccount.toLowerCase()
        );
      } catch (err) {
        console.error("Error checking admin:", err);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdmin();

    // Re-check when account changes
    if (window.ethereum) {
      const onAccountsChanged = () => {
        checkAdmin();
      };
      window.ethereum.on("accountsChanged", onAccountsChanged);
      return () => {
        window.ethereum.removeListener("accountsChanged", onAccountsChanged);
      };
    }
  }, []);

  const handleFetchCertificate = async () => {
    try {
      setMessage("");
      setCertificateData(null);
      setLoading(true);

      const trimmedId = certificateId.trim();
      if (!trimmedId) {
        setMessage("❌ Vui lòng nhập mã chứng chỉ");
        setLoading(false);
        return;
      }

      const trimmedStudentId = studentId.trim();
      if (!trimmedStudentId) {
        setMessage("❌ Vui lòng nhập mã sinh viên để xác nhận");
        setLoading(false);
        return;
      }

      const idNumber = Number(trimmedId);
      if (isNaN(idNumber) || idNumber <= 0) {
        setMessage("❌ Mã chứng chỉ phải là số hợp lệ");
        setLoading(false);
        return;
      }

      const res = await getCertificate(idNumber);
      const certificateStudentId = res[1];

      // Verify that certificate belongs to the entered studentId
      if (certificateStudentId !== trimmedStudentId) {
        setCertificateData(null);
        setMessage("❌ Mã chứng chỉ không thuộc sinh viên này");
        setLoading(false);
        return;
      }

      // StudentId matches - display certificate info
      setCertificateData({
        certificateId: res[0].toString(),
        studentId: res[1],
        studentName: res[2],
        certificateName: res[3],
        issuedAt: new Date(Number(res[4]) * 1000).toLocaleString("vi-VN"),
        revoked: res[5],
      });

      setMessage("✅ Đã tải thông tin chứng chỉ");
    } catch (err) {
      console.error("Error fetching certificate:", err);
      setCertificateData(null);
      setMessage("❌ Không tìm thấy chứng chỉ với mã này");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!certificateData) {
      setMessage("❌ Vui lòng tải thông tin chứng chỉ trước");
      return;
    }

    if (certificateData.revoked) {
      setMessage("⚠️ Chứng chỉ này đã được thu hồi");
      return;
    }

    if (!isAdmin) {
      setMessage("❌ Chỉ admin mới có quyền thu hồi chứng chỉ");
      return;
    }

    try {
      setMessage("🔄 Đang gửi giao dịch thu hồi chứng chỉ...");
      setRevoking(true);

      const idNumber = Number(certificateData.certificateId);
      const tx = await revokeCertificate(idNumber);
      await tx.wait();

      // Update certificate data to show revoked status
      setCertificateData({
        ...certificateData,
        revoked: true,
      });

      setMessage("✅ Đã thu hồi chứng chỉ thành công!");
    } catch (err) {
      console.error("Error revoking certificate:", err);
      setMessage("❌ Lỗi: chỉ admin (ví deploy) mới được thu hồi chứng chỉ");
    } finally {
      setRevoking(false);
    }
  };

  // Clear certificate data if studentId changes after loading (force re-verification)
  useEffect(() => {
    if (certificateData) {
      const trimmedStudentId = studentId.trim();
      if (trimmedStudentId && certificateData.studentId !== trimmedStudentId) {
        setCertificateData(null);
        setMessage("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const canRevoke =
    certificateData &&
    !certificateData.revoked &&
    isAdmin &&
    !revoking &&
    certificateData.studentId === studentId.trim();

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
          maxWidth: 600,
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
          Thu hồi chứng chỉ
        </h2>

        {/* Input Section */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#374151",
            }}
          >
            Mã sinh viên
          </label>
          <input
            placeholder="Nhập mã sinh viên (để xác nhận)"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
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
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#374151",
            }}
          >
            Mã chứng chỉ
          </label>
          <input
            placeholder="Nhập mã chứng chỉ (số)"
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !loading) {
                handleFetchCertificate();
              }
            }}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: "16px",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              outline: "none",
              transition: "border-color 0.2s",
              boxSizing: "border-box",
              backgroundColor: loading ? "#f3f4f6" : "#ffffff",
              cursor: loading ? "not-allowed" : "text",
            }}
            onFocus={(e) => {
              if (!loading) {
                e.target.style.borderColor = "#3b82f6";
              }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e5e7eb";
            }}
          />
        </div>

        <button
          onClick={handleFetchCertificate}
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
            marginBottom: "24px",
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
          {loading ? "Đang tải..." : "Tải thông tin chứng chỉ"}
        </button>

        {/* Admin Status Message */}
        {!checkingAdmin && !isAdmin && (
          <div
            style={{
              marginBottom: "24px",
              padding: "16px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              color: "#dc2626",
              textAlign: "center",
              fontSize: "15px",
              fontWeight: 500,
            }}
          >
            ⚠️ Chỉ admin mới có quyền thu hồi chứng chỉ
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div
            style={{
              marginBottom: "24px",
              padding: "16px",
              backgroundColor: message.includes("✅")
                ? "#f0fdf4"
                : message.includes("❌")
                ? "#fef2f2"
                : message.includes("⚠️")
                ? "#fffbeb"
                : "#eff6ff",
              border: `1px solid ${
                message.includes("✅")
                  ? "#bbf7d0"
                  : message.includes("❌")
                  ? "#fecaca"
                  : message.includes("⚠️")
                  ? "#fde68a"
                  : "#bfdbfe"
              }`,
              borderRadius: "8px",
              color: message.includes("✅")
                ? "#16a34a"
                : message.includes("❌")
                ? "#dc2626"
                : message.includes("⚠️")
                ? "#d97706"
                : "#2563eb",
              textAlign: "center",
              fontSize: "15px",
              fontWeight: 500,
            }}
          >
            {message}
          </div>
        )}

        {/* Certificate Info Section */}
        {certificateData && (
          <div
            style={{
              marginBottom: "24px",
              padding: "24px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#1f2937",
                }}
              >
                Thông tin chứng chỉ
              </h3>
              <div
                style={{
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: 600,
                  backgroundColor: certificateData.revoked
                    ? "#fef2f2"
                    : "#f0fdf4",
                  color: certificateData.revoked ? "#dc2626" : "#16a34a",
                }}
              >
                {certificateData.revoked ? "❌ Đã thu hồi" : "✅ Hợp lệ"}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <span style={{ fontWeight: 600, color: "#6b7280" }}>
                  Mã chứng chỉ:
                </span>
                <span style={{ color: "#1f2937", fontWeight: 500 }}>
                  {certificateData.certificateId}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <span style={{ fontWeight: 600, color: "#6b7280" }}>Mã SV:</span>
                <span style={{ color: "#1f2937" }}>
                  {certificateData.studentId}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <span style={{ fontWeight: 600, color: "#6b7280" }}>Tên:</span>
                <span style={{ color: "#1f2937" }}>
                  {certificateData.studentName}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <span style={{ fontWeight: 600, color: "#6b7280" }}>
                  Chứng chỉ:
                </span>
                <span style={{ color: "#1f2937" }}>
                  {certificateData.certificateName}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <span style={{ fontWeight: 600, color: "#6b7280" }}>
                  Ngày cấp:
                </span>
                <span style={{ color: "#1f2937" }}>
                  {certificateData.issuedAt}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Section */}
        {certificateData && (
          <button
            onClick={handleRevoke}
            disabled={!canRevoke}
            style={{
              width: "100%",
              padding: "14px 24px",
              fontSize: "16px",
              fontWeight: 600,
              color: "#ffffff",
              backgroundColor: canRevoke ? "#dc2626" : "#9ca3af",
              border: "none",
              borderRadius: "8px",
              cursor: canRevoke ? "pointer" : "not-allowed",
              transition: "background-color 0.2s, transform 0.1s",
              boxShadow: canRevoke
                ? "0 2px 4px rgba(220, 38, 38, 0.3)"
                : "none",
            }}
            onMouseEnter={(e) => {
              if (canRevoke) {
                e.target.style.backgroundColor = "#b91c1c";
                e.target.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (canRevoke) {
                e.target.style.backgroundColor = "#dc2626";
                e.target.style.transform = "translateY(0)";
              }
            }}
          >
            {revoking
              ? "Đang xử lý..."
              : certificateData.revoked
              ? "Chứng chỉ đã được thu hồi"
              : !isAdmin
              ? "Chỉ admin mới có quyền thu hồi"
              : "Thu hồi chứng chỉ"}
          </button>
        )}
      </div>
    </div>
  );
}
