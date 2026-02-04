import { useState, useEffect } from "react";
import { getCertificate, revokeCertificate, getCertificatesOfStudent } from "../web3/certificate";
import { getCurrentAccount } from "../web3/wallet";
import { ethers } from "ethers";
import abi from "../abi/CertificateRegistry.json";
import { CONTRACTS } from "../config/contracts";

export default function Revoke() {
  const [studentId, setStudentId] = useState("");
  const [certificateId, setCertificateId] = useState("");
  const [certificateData, setCertificateData] = useState(null);
  const [availableCertificates, setAvailableCertificates] = useState([]); // Danh sách chứng chỉ hợp lệ
  const [studentName, setStudentName] = useState(""); // Tên sinh viên (lấy từ chứng chỉ đầu tiên)
  const [message, setMessage] = useState("");
  const [info, setInfo] = useState(""); // Thông báo nhẹ
  const [loadingCertificates, setLoadingCertificates] = useState(false); // Đang load danh sách chứng chỉ
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

  // Load danh sách chứng chỉ khi nhập MSSV
  const handleStudentIdChange = async (e) => {
    const newStudentId = e.target.value;
    setStudentId(newStudentId);
    setCertificateId("");
    setCertificateData(null);
    setAvailableCertificates([]);
    setStudentName("");
    setInfo("");
    setMessage("");

    if (!newStudentId.trim()) {
      return;
    }

    setLoadingCertificates(true);
    try {
      const certificateIds = await getCertificatesOfStudent(newStudentId);
      
      if (!certificateIds || certificateIds.length === 0) {
        setInfo("Sinh viên không có chứng chỉ hợp lệ để thu hồi");
        setLoadingCertificates(false);
        return;
      }

      // Load thông tin từng chứng chỉ và filter chỉ lấy chưa bị thu hồi
      const certificatePromises = certificateIds.map(async (certId) => {
        try {
          const cert = await getCertificate(certId);
          return {
            certificateId: cert[0].toString(),
            certificateName: cert[3],
            studentName: cert[2], // Lấy tên sinh viên
            revoked: cert[5],
          };
        } catch (err) {
          console.error(`Error loading certificate ${certId}:`, err);
          return null;
        }
      });

      const certificates = await Promise.all(certificatePromises);
      const validCertificates = certificates.filter(
        (cert) => cert !== null && !cert.revoked
      );

      if (validCertificates.length === 0) {
        setInfo("Sinh viên không có chứng chỉ hợp lệ để thu hồi");
        setStudentName("");
      } else {
        setAvailableCertificates(validCertificates);
        // Lấy tên sinh viên từ chứng chỉ đầu tiên (vì tên đã được chuẩn hóa)
        setStudentName(validCertificates[0].studentName);
        setInfo("");
      }
    } catch (err) {
      // Không hiển thị lỗi đỏ khi sai network lúc chỉ kiểm tra MSSV
      if (err.message && err.message.includes("Sai network")) {
        setInfo("Không thể kiểm tra thông tin. Vui lòng chuyển sang mạng Sepolia để kiểm tra tự động.");
      } else {
        console.error("Error loading certificates:", err);
        setInfo("Không thể tải danh sách chứng chỉ");
      }
      setStudentName("");
    } finally {
      setLoadingCertificates(false);
    }
  };

  // Load thông tin chứng chỉ khi chọn từ dropdown
  const handleCertificateSelect = async (e) => {
    const selectedId = e.target.value;
    setCertificateId(selectedId);
    setCertificateData(null);
    setMessage("");

    if (!selectedId.trim()) {
      return;
    }

    try {
      const idNumber = Number(selectedId);
      const res = await getCertificate(idNumber);

      // Display certificate info
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
    }
  };

  const handleRevoke = async () => {
    if (!certificateData) {
      setMessage("❌ Vui lòng chọn chứng chỉ cần thu hồi");
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

    if (!studentId.trim()) {
      setMessage("❌ Vui lòng nhập mã sinh viên");
      return;
    }

    if (!certificateId.trim()) {
      setMessage("❌ Vui lòng chọn chứng chỉ cần thu hồi");
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

      // Remove revoked certificate from available list
      const updatedCertificates = availableCertificates.filter(
        (cert) => cert.certificateId !== certificateData.certificateId
      );
      setAvailableCertificates(updatedCertificates);

      // Reset certificate selection
      setCertificateId("");

      // Nếu không còn chứng chỉ nào, reset studentName
      if (updatedCertificates.length === 0) {
        setStudentName("");
        setInfo("Sinh viên này hiện không còn chứng chỉ hợp lệ nào");
      }

      setMessage("✅ Đã thu hồi chứng chỉ thành công!");
    } catch (err) {
      console.error("Error revoking certificate:", err);
      setMessage("❌ Lỗi: chỉ admin (ví deploy) mới được thu hồi chứng chỉ");
    } finally {
      setRevoking(false);
    }
  };

  const canRevoke =
    certificateData &&
    !certificateData.revoked &&
    isAdmin &&
    !revoking &&
    studentId.trim() &&
    certificateId.trim() &&
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
          Thu hồi chứng chỉ
        </h2>

        {/* Input Section */}
        <div style={{ marginBottom: "16px" }}>
          <input
            placeholder="Nhập mã sinh viên (MSSV)"
            value={studentId}
            onChange={handleStudentIdChange}
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
          {loadingCertificates && (
            <div
              style={{
                marginTop: "8px",
                fontSize: "14px",
                color: "#b3b3b3",
                fontStyle: "italic",
              }}
            >
              Đang tải danh sách chứng chỉ...
            </div>
          )}
        </div>

        {/* Hiển thị tên sinh viên và tổng số chứng chỉ */}
        {studentName && availableCertificates.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <div
              style={{
                padding: "12px 16px",
                backgroundColor: "#1a1a1a",
                borderRadius: "8px",
                border: "1px solid rgba(212, 167, 58, 0.2)",
                fontSize: "15px",
                color: "#b3b3b3",
              }}
            >
              <div style={{ marginBottom: "8px" }}>
                <span style={{ fontWeight: 600, color: "#b3b3b3" }}>
                  Tên sinh viên:{" "}
                </span>
                <span style={{ color: "#d4a73a", fontWeight: 500 }}>
                  {studentName}
                </span>
              </div>
              <div>
                <span style={{ fontWeight: 600, color: "#b3b3b3" }}>
                  Tổng số chứng chỉ đang sở hữu:{" "}
                </span>
                <span style={{ color: "#d4a73a", fontWeight: 500 }}>
                  {availableCertificates.length}
                </span>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: "24px" }}>
          <select
            value={certificateId}
            onChange={handleCertificateSelect}
            disabled={loadingCertificates || availableCertificates.length === 0}
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: "16px",
              border: "2px solid rgba(212, 167, 58, 0.3)",
              borderRadius: "8px",
              outline: "none",
              transition: "border-color 0.2s",
              boxSizing: "border-box",
              backgroundColor:
                loadingCertificates || availableCertificates.length === 0
                  ? "#0b0b0b"
                  : "#1a1a1a",
              color: "#b3b3b3",
              cursor:
                loadingCertificates || availableCertificates.length === 0
                  ? "not-allowed"
                  : "pointer",
              appearance: "none",
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23d4a73a' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 16px center",
              paddingRight: "40px",
            }}
            onFocus={(e) => {
              if (!loadingCertificates && availableCertificates.length > 0) {
                e.target.style.borderColor = "#d4a73a";
              }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(212, 167, 58, 0.3)";
            }}
          >
            <option value="" disabled>
              Chọn chứng chỉ cần thu hồi
            </option>
            {availableCertificates.map((cert) => (
              <option key={cert.certificateId} value={cert.certificateId}>
                {cert.certificateName} (ID: {cert.certificateId})
              </option>
            ))}
          </select>
        </div>

        {info && (
          <div
            style={{
              marginBottom: "24px",
              padding: "16px",
              backgroundColor: "rgba(212, 167, 58, 0.1)",
              border: "1px solid rgba(212, 167, 58, 0.3)",
              borderRadius: "8px",
              color: "#f5c56b",
              textAlign: "center",
              fontSize: "15px",
              fontWeight: 500,
            }}
          >
            {info}
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div
            style={{
              marginBottom: "24px",
              padding: "16px",
              backgroundColor: message.includes("✅")
                ? "rgba(16, 185, 129, 0.1)"
                : message.includes("❌")
                ? "rgba(220, 38, 38, 0.1)"
                : message.includes("⚠️")
                ? "rgba(212, 167, 58, 0.1)"
                : "rgba(212, 167, 58, 0.1)",
              border: `1px solid ${
                message.includes("✅")
                  ? "rgba(16, 185, 129, 0.3)"
                  : message.includes("❌")
                  ? "rgba(220, 38, 38, 0.3)"
                  : message.includes("⚠️")
                  ? "rgba(212, 167, 58, 0.3)"
                  : "rgba(212, 167, 58, 0.3)"
              }`,
              borderRadius: "8px",
              color: message.includes("✅")
                ? "#10b981"
                : message.includes("❌")
                ? "#f87171"
                : message.includes("⚠️")
                ? "#f5c56b"
                : "#f5c56b",
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
              backgroundColor: "#1a1a1a",
              borderRadius: "8px",
              border: "1px solid rgba(212, 167, 58, 0.2)",
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
                  color: "#d4a73a",
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
                    ? "rgba(220, 38, 38, 0.2)"
                    : "rgba(16, 185, 129, 0.2)",
                  color: certificateData.revoked ? "#f87171" : "#10b981",
                  border: `1px solid ${certificateData.revoked ? "rgba(220, 38, 38, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
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
                  borderBottom: "1px solid rgba(212, 167, 58, 0.2)",
                }}
              >
                <span style={{ fontWeight: 600, color: "#b3b3b3" }}>
                  Mã chứng chỉ:
                </span>
                <span style={{ color: "#d4a73a", fontWeight: 500 }}>
                  {certificateData.certificateId}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: "12px",
                  borderBottom: "1px solid rgba(212, 167, 58, 0.2)",
                }}
              >
                <span style={{ fontWeight: 600, color: "#b3b3b3" }}>Mã SV:</span>
                <span style={{ color: "#b3b3b3" }}>
                  {certificateData.studentId}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: "12px",
                  borderBottom: "1px solid rgba(212, 167, 58, 0.2)",
                }}
              >
                <span style={{ fontWeight: 600, color: "#b3b3b3" }}>Tên:</span>
                <span style={{ color: "#b3b3b3" }}>
                  {certificateData.studentName}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: "12px",
                  borderBottom: "1px solid rgba(212, 167, 58, 0.2)",
                }}
              >
                <span style={{ fontWeight: 600, color: "#b3b3b3" }}>
                  Chứng chỉ:
                </span>
                <span style={{ color: "#d4a73a" }}>
                  {certificateData.certificateName}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: "12px",
                  borderBottom: "1px solid rgba(212, 167, 58, 0.2)",
                }}
              >
                <span style={{ fontWeight: 600, color: "#b3b3b3" }}>
                  Ngày cấp:
                </span>
                <span style={{ color: "#b3b3b3" }}>
                  {certificateData.issuedAt}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Section */}
        <button
          onClick={handleRevoke}
          disabled={
            !canRevoke ||
            !studentId.trim() ||
            !certificateId.trim() ||
            loadingCertificates
          }
          style={{
            width: "100%",
            padding: "14px 24px",
            fontSize: "16px",
            fontWeight: 600,
            color: "#0b0b0b",
            backgroundColor:
              !canRevoke ||
              !studentId.trim() ||
              !certificateId.trim() ||
              loadingCertificates
                ? "#9ca3af"
                : "#d4a73a",
            border: "none",
            borderRadius: "8px",
            cursor:
              !canRevoke ||
              !studentId.trim() ||
              !certificateId.trim() ||
              loadingCertificates
                ? "not-allowed"
                : "pointer",
            transition: "background-color 0.2s, transform 0.1s",
            boxShadow:
              !canRevoke ||
              !studentId.trim() ||
              !certificateId.trim() ||
              loadingCertificates
                ? "none"
                : "0 2px 4px rgba(212, 167, 58, 0.3)",
            opacity:
              !canRevoke ||
              !studentId.trim() ||
              !certificateId.trim() ||
              loadingCertificates
                ? 0.6
                : 1,
          }}
          onMouseEnter={(e) => {
            if (
              canRevoke &&
              studentId.trim() &&
              certificateId.trim() &&
              !loadingCertificates
            ) {
              e.target.style.backgroundColor = "#b8941f";
              e.target.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            if (
              canRevoke &&
              studentId.trim() &&
              certificateId.trim() &&
              !loadingCertificates
            ) {
              e.target.style.backgroundColor = "#d4a73a";
              e.target.style.transform = "translateY(0)";
            }
          }}
        >
          {revoking
            ? "Đang xử lý..."
            : !studentId.trim()
            ? "Vui lòng nhập mã sinh viên"
            : !certificateId.trim()
            ? "Vui lòng chọn chứng chỉ"
            : certificateData && certificateData.revoked
            ? "Chứng chỉ đã được thu hồi"
            : !isAdmin
            ? "Chỉ admin mới có quyền thu hồi"
            : "Thu hồi chứng chỉ"}
        </button>
      </div>
    </div>
  );
}
