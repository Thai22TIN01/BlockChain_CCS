import { ethers } from "ethers";
import abi from "../abi/CertificateRegistry.json";
import { CONTRACTS } from "../config/contracts";

async function getContract() {
  if (!window.ethereum) throw new Error("Chưa cài MetaMask");

  await window.ethereum.request({ method: "eth_requestAccounts" });

  await window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: "0xaa36a7" }],
  });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const network = await provider.getNetwork();
  const address =
    CONTRACTS[Number(network.chainId)]?.CertificateRegistry;

  if (!address) throw new Error("Sai network");

  return new ethers.Contract(address, abi, signer);
}

// ✅ CẤP
export async function issueCertificate(studentId, studentName, certName) {
  const contract = await getContract();
  return contract.issueCertificate(studentId, studentName, certName);
}

// ✅ THU HỒI (THEO ID)
export async function revokeCertificate(certificateId) {
  const contract = await getContract();
  return contract.revokeCertificate(certificateId);
}

// ✅ TRA CỨU THEO ID
export async function getCertificate(certificateId) {
  const contract = await getContract();
  return contract.getCertificate(certificateId);
}

// ✅ LẤY DANH SÁCH CHỨNG CHỈ CỦA SV (VIEW FUNCTION - DÙNG PROVIDER)
export async function getCertificatesOfStudent(studentId) {
  if (!window.ethereum) throw new Error("Chưa cài MetaMask");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  const address =
    CONTRACTS[Number(network.chainId)]?.CertificateRegistry;

  if (!address) throw new Error("Sai network");

  const contract = new ethers.Contract(address, abi, provider);
  return contract.getCertificatesOfStudent(studentId);
}

// ✅ LẤY OWNER CỦA CONTRACT (VIEW FUNCTION)
export async function getContractOwner() {
  if (!window.ethereum) throw new Error("Chưa cài MetaMask");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  const address =
    CONTRACTS[Number(network.chainId)]?.CertificateRegistry;

  if (!address) throw new Error("Sai network");

  const contract = new ethers.Contract(address, abi, provider);
  return contract.owner();
}

// ✅ LẤY NEXT CERTIFICATE ID (VIEW FUNCTION)
export async function getNextCertificateId() {
  if (!window.ethereum) throw new Error("Chưa cài MetaMask");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  const address =
    CONTRACTS[Number(network.chainId)]?.CertificateRegistry;

  if (!address) throw new Error("Sai network");

  const contract = new ethers.Contract(address, abi, provider);
  return contract.nextCertificateId();
}

// ✅ LẤY TẤT CẢ CHỨNG CHỈ (ADMIN ONLY)
export async function getAllCertificates() {
  if (!window.ethereum) throw new Error("Chưa cài MetaMask");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  const address =
    CONTRACTS[Number(network.chainId)]?.CertificateRegistry;

  if (!address) throw new Error("Sai network");

  const contract = new ethers.Contract(address, abi, provider);
  
  // Get nextCertificateId to know how many certificates exist
  const nextId = await contract.nextCertificateId();
  const totalCount = Number(nextId);
  
  if (totalCount === 0) {
    return [];
  }

  // Fetch all certificates from ID 1 to nextId - 1
  const certificatePromises = [];
  for (let id = 1; id < totalCount; id++) {
    certificatePromises.push(
      contract.getCertificate(id).catch(() => null) // Handle potential errors gracefully
    );
  }

  const results = await Promise.all(certificatePromises);
  
  // Filter out null results and format certificates
  return results
    .filter((cert) => cert !== null)
    .map((cert) => ({
      certificateId: cert[0].toString(),
      studentId: cert[1],
      studentName: cert[2],
      certificateName: cert[3],
      issuedAt: new Date(Number(cert[4]) * 1000).toLocaleString("vi-VN"),
      revoked: cert[5],
    }));
}
