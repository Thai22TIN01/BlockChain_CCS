import { ethers } from "ethers";
import abi from "../abi/CertificateRegistry.json";
import { CONTRACTS } from "../config/contracts";

// 🔹 CẤP CHỨNG CHỈ (admin)
export async function issueCertificate(studentId, studentName, certificateName) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const network = await provider.getNetwork();
  const contractAddress =
    CONTRACTS[Number(network.chainId)].CertificateRegistry;

  const contract = new ethers.Contract(contractAddress, abi, signer);

  return contract.issueCertificate(studentId, studentName, certificateName);
}

// 🔹 ĐỌC / XÁC THỰC CHỨNG CHỈ (ai cũng xem được)
export async function getCertificate(studentId) {
  const provider = new ethers.BrowserProvider(window.ethereum);

  const network = await provider.getNetwork();
  const contractAddress =
    CONTRACTS[Number(network.chainId)].CertificateRegistry;

  const contract = new ethers.Contract(contractAddress, abi, provider);

  return contract.getCertificate(studentId);
}
