import { useState } from "react";
import { issueCertificate, getCertificatesOfStudent, getCertificate } from "../web3/certificate";

// Danh sách chứng chỉ cố định
const CERTIFICATE_TYPES = [
  "Anh Văn B1",
  "Anh Văn VSTEP",
  "Tin Học Nâng Cao",
  "Chứng Chỉ Nghề",
];

export default function Issue() {
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [certificateName, setCertificateName] = useState("");
  const [message, setMessage] = useState("");
  const [info, setInfo] = useState(""); // Thông báo nhẹ, không phải lỗi
  const [studentNameFromBlockchain, setStudentNameFromBlockchain] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isNewStudent, setIsNewStudent] = useState(false); // Track nếu MSSV mới
  const [studentCertificates, setStudentCertificates] = useState([]); // Danh sách chứng chỉ của sinh viên

  const handleStudentIdChange = async (e) => {
    const newStudentId = e.target.value;
    setStudentId(newStudentId);
    setInfo("");
    setMessage("");
    setStudentNameFromBlockchain("");
    setIsNewStudent(false);
    setStudentCertificates([]);
    setCertificateName(""); // Reset khi đổi MSSV

    if (!newStudentId.trim()) {
      // Reset tên sinh viên khi xóa MSSV
      setStudentName("");
      return;
    }

    // Luồng duy nhất: Luôn kiểm tra MSSV khi nhập xong
    setIsChecking(true);
    try {
      const certificateIds = await getCertificatesOfStudent(newStudentId);
      const hasCertificates = certificateIds && certificateIds.length > 0;

      if (hasCertificates) {
        // Load thông tin tất cả chứng chỉ để kiểm tra
        const certificatePromises = certificateIds.map(async (certId) => {
          try {
            const cert = await getCertificate(certId);
            return {
              certificateId: cert[0].toString(),
              studentId: cert[1],
              studentName: cert[2],
              certificateName: cert[3],
              issuedAt: cert[4],
              revoked: cert[5],
            };
          } catch (err) {
            console.error(`Error loading certificate ${certId}:`, err);
            return null;
          }
        });

        const certificates = await Promise.all(certificatePromises);
        const validCerts = certificates.filter((cert) => cert !== null);
        setStudentCertificates(validCerts);

        // MSSV ĐÃ TỒN TẠI: Lấy studentName từ chứng chỉ đầu tiên
        if (validCerts.length > 0) {
          setStudentNameFromBlockchain(validCerts[0].studentName);
          setStudentName(validCerts[0].studentName);
          setInfo("");
          setIsNewStudent(false);
        }
      } else {
        // MSSV CHƯA TỪNG có chứng chỉ: Cho phép nhập tay
        setStudentName("");
        setStudentNameFromBlockchain("");
        setIsNewStudent(true);
        setInfo("⚠️ Hãy kiểm tra thật kỹ tên sinh viên, vì sau khi cấp chứng chỉ sẽ không được phép sửa tên");
      }
    } catch (err) {
      // Không chặn chức năng nếu chỉ lỗi kiểm tra MSSV do sai network
      if (err.message && err.message.includes("Sai network")) {
        // Cho phép tiếp tục, chỉ hiển thị thông báo nhẹ
        setInfo("Không thể kiểm tra thông tin. Vui lòng chuyển sang mạng Sepolia để kiểm tra tự động.");
        setIsNewStudent(false); // Không xác định được, không hiển thị cảnh báo
      } else {
        console.error("Lỗi khi kiểm tra chứng chỉ:", err);
        // Cho phép tiếp tục nhập tay nếu lỗi khác
        setIsNewStudent(false);
      }
      setStudentName("");
      setStudentNameFromBlockchain("");
      setStudentCertificates([]);
    } finally {
      setIsChecking(false);
    }
  };

  const handleCertificateNameChange = (e) => {
    const selectedCertName = e.target.value;
    setCertificateName(selectedCertName);
    setMessage("");
    setInfo("");

    if (!selectedCertName.trim() || !studentId.trim()) {
      return;
    }

    // Kiểm tra xem sinh viên đã có chứng chỉ cùng loại chưa
    const hasSameCertificate = studentCertificates.some(
      (cert) =>
        cert.certificateName === selectedCertName && cert.revoked === false
    );

    if (hasSameCertificate) {
      setInfo(
        "Sinh viên đã được cấp chứng chỉ này trước đó. Mỗi loại chứng chỉ chỉ được cấp một lần."
      );
    } else {
      setInfo("");
    }
  };

  const handleIssue = async () => {
    // Kiểm tra điều kiện
    if (!studentId.trim()) {
      setMessage("❌ Vui lòng nhập mã sinh viên");
      return;
    }

    if (!certificateName.trim()) {
      setMessage("❌ Vui lòng chọn loại chứng chỉ");
      return;
    }

    // Kiểm tra xem sinh viên đã có chứng chỉ cùng loại chưa
    const hasSameCertificate = studentCertificates.some(
      (cert) =>
        cert.certificateName === certificateName && cert.revoked === false
    );

    if (hasSameCertificate) {
      setMessage(
        "❌ Sinh viên đã được cấp chứng chỉ này trước đó. Mỗi loại chứng chỉ chỉ được cấp một lần."
      );
      return;
    }

    // Nếu MSSV đã tồn tại: Bắt buộc dùng tên từ blockchain
    if (studentNameFromBlockchain) {
      if (!studentName.trim() || studentName !== studentNameFromBlockchain) {
        setMessage("❌ Vui lòng sử dụng tên sinh viên từ blockchain");
        return;
      }
    } else {
      // Nếu MSSV mới: Phải có tên nhập tay
      if (!studentName.trim()) {
        setMessage("❌ Vui lòng nhập tên sinh viên");
        return;
      }
    }

    try {
      setMessage("Đang gửi giao dịch...");
      
      // Chọn studentName: Ưu tiên từ blockchain, nếu không thì dùng tên nhập tay
      const finalStudentName = studentNameFromBlockchain || studentName;

      const tx = await issueCertificate(
        studentId,
        finalStudentName,
        certificateName
      );
      await tx.wait();
      setMessage("✅ Cấp chứng chỉ thành công!");
      
      // Reset form sau khi thành công
      setStudentId("");
      setStudentName("");
      setCertificateName("");
      setStudentNameFromBlockchain("");
      setStudentCertificates([]);
      setInfo("");
      setIsNewStudent(false);
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
          Cấp chứng chỉ
        </h2>

        <div style={{ marginBottom: "16px" }}>
          <input
            placeholder="Nhập mã sinh viên (MSSV)"
            value={studentId}
            onChange={handleStudentIdChange}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleIssue();
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

        <div style={{ marginBottom: "16px" }}>
          <input
            placeholder="Tên sinh viên (tự động nếu đã tồn tại)"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            disabled={!!studentNameFromBlockchain}
            readOnly={!!studentNameFromBlockchain}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleIssue();
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
              backgroundColor: studentNameFromBlockchain ? "#0b0b0b" : "#1a1a1a",
              color: "#b3b3b3",
              cursor: studentNameFromBlockchain ? "not-allowed" : "text",
            }}
            onFocus={(e) => {
              if (!studentNameFromBlockchain) {
                e.target.style.borderColor = "#d4a73a";
              }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(212, 167, 58, 0.3)";
            }}
          />
          {isChecking && (
            <div
              style={{
                marginTop: "8px",
                fontSize: "14px",
                color: "#b3b3b3",
                fontStyle: "italic",
              }}
            >
              Đang kiểm tra...
            </div>
          )}
        </div>

        <div style={{ marginBottom: "24px" }}>
          <select
            value={certificateName}
            onChange={handleCertificateNameChange}
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
              cursor: "pointer",
              appearance: "none",
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23d4a73a' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 16px center",
              paddingRight: "40px",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#d4a73a";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(212, 167, 58, 0.3)";
            }}
          >
            <option value="" disabled>
              Chọn loại chứng chỉ cần cấp
            </option>
            {CERTIFICATE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
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

        <button
          onClick={handleIssue}
          disabled={
            isChecking ||
            !studentId.trim() ||
            !studentName.trim() ||
            !certificateName.trim() ||
            (info &&
              info.includes("Sinh viên đã được cấp chứng chỉ này trước đó"))
          }
          style={{
            width: "100%",
            padding: "14px 24px",
            fontSize: "16px",
            fontWeight: 600,
            color: "#0b0b0b",
            backgroundColor:
              isChecking ||
              !studentId.trim() ||
              !studentName.trim() ||
              !certificateName.trim() ||
              (info &&
                info.includes("Sinh viên đã được cấp chứng chỉ này trước đó"))
                ? "#9ca3af"
                : "#d4a73a",
            border: "none",
            borderRadius: "8px",
            cursor:
              isChecking ||
              !studentId.trim() ||
              !studentName.trim() ||
              !certificateName.trim() ||
              (info &&
                info.includes("Sinh viên đã được cấp chứng chỉ này trước đó"))
                ? "not-allowed"
                : "pointer",
            transition: "background-color 0.2s, transform 0.1s",
            boxShadow:
              isChecking ||
              !studentId.trim() ||
              !studentName.trim() ||
              !certificateName.trim() ||
              (info &&
                info.includes("Sinh viên đã được cấp chứng chỉ này trước đó"))
                ? "none"
                : "0 2px 4px rgba(245, 158, 11, 0.3)",
            opacity:
              isChecking ||
              !studentId.trim() ||
              !studentName.trim() ||
              !certificateName.trim() ||
              (info &&
                info.includes("Sinh viên đã được cấp chứng chỉ này trước đó"))
                ? 0.6
                : 1,
          }}
          onMouseEnter={(e) => {
            if (
              !isChecking &&
              studentId.trim() &&
              studentName.trim() &&
              certificateName.trim() &&
              !(
                info &&
                info.includes("Sinh viên đã được cấp chứng chỉ này trước đó")
              )
            ) {
              e.target.style.backgroundColor = "#b8941f";
              e.target.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            if (
              !isChecking &&
              studentId.trim() &&
              studentName.trim() &&
              certificateName.trim() &&
              !(
                info &&
                info.includes("Sinh viên đã được cấp chứng chỉ này trước đó")
              )
            ) {
              e.target.style.backgroundColor = "#d4a73a";
              e.target.style.transform = "translateY(0)";
            }
          }}
          onMouseDown={(e) => {
            if (
              !isChecking &&
              studentId.trim() &&
              studentName.trim() &&
              certificateName.trim() &&
              !(
                info &&
                info.includes("Sinh viên đã được cấp chứng chỉ này trước đó")
              )
            ) {
              e.target.style.transform = "translateY(0)";
            }
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
                ? "rgba(16, 185, 129, 0.1)"
                : message.includes("❌")
                ? "rgba(220, 38, 38, 0.1)"
                : "rgba(212, 167, 58, 0.1)",
              border: `1px solid ${
                message.includes("✅")
                  ? "rgba(16, 185, 129, 0.3)"
                  : message.includes("❌")
                  ? "rgba(220, 38, 38, 0.3)"
                  : "rgba(212, 167, 58, 0.3)"
              }`,
              borderRadius: "8px",
              color: message.includes("✅")
                ? "#10b981"
                : message.includes("❌")
                ? "#f87171"
                : "#f5c56b",
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
