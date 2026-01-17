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
    <div style={{ padding: 20, maxWidth: 500 }}>
      <h2>Cấp chứng chỉ</h2>

      <input
        placeholder="Mã sinh viên"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <input
        placeholder="Tên sinh viên"
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <input
        placeholder="Tên chứng chỉ"
        value={certificateName}
        onChange={(e) => setCertificateName(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <button onClick={handleIssue}>Cấp chứng chỉ</button>

      <p>{message}</p>
    </div>
  );
}
