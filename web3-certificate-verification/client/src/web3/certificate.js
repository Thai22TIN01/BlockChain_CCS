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
