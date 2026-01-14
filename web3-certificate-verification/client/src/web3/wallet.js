import { ethers } from "ethers";

// bấm connect -> MetaMask popup -> trả về account + signer
export async function connectWallet() {
  if (!window.ethereum) {
    alert("Chưa thấy MetaMask. Cài extension hoặc bật MetaMask lên nha.");
    return null;
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  const account = accounts?.[0];

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return { account, provider, signer };
}

// lấy account hiện tại (không bật popup)
export async function getCurrentAccount() {
  if (!window.ethereum) return null;

  const accounts = await window.ethereum.request({
    method: "eth_accounts",
  });

  return accounts?.[0] || null;
}
