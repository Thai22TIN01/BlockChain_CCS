import { useState } from "react";
import { getCertificate } from "../web3/certificate";

export default function Verify() {
  const [studentId, setStudentId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    try {
      setError("");
      const res = await getCertificate(studentId);

      setResult({
        studentId: res[0],
        studentName: res[1],
        certificateName: res[2],
        issuedAt: new Date(Number(res[3]) * 1000).toLocaleString(),
        revoked: res[4],
      });
    } catch {
      setResult(null);
      setError("❌ Không tìm thấy chứng chỉ");
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600 }}>
      <h2>Xác thực chứng chỉ</h2>

      <input
        placeholder="Nhập mã sinh viên"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <button onClick={handleVerify}>Xác thực chứng chỉ</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 20 }}>
          <p><b>Mã SV:</b> {result.studentId}</p>
          <p><b>Tên:</b> {result.studentName}</p>
          <p><b>Chứng chỉ:</b> {result.certificateName}</p>
          <p><b>Ngày cấp:</b> {result.issuedAt}</p>
          <p>
            <b>Trạng thái:</b>{" "}
            {result.revoked ? "❌ Đã thu hồi" : "✅ Hợp lệ"}
          </p>
        </div>
      )}
    </div>
  );
}
