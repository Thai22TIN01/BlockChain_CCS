import { BrowserProvider } from "ethers";

export async function getBrowserProvider() {
  if (!window.ethereum) throw new Error("Chưa cài MetaMask");
  return new BrowserProvider(window.ethereum);
}

export async function connectWallet() {
  const provider = await getBrowserProvider();
  // yêu cầu kết nối
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();
  return { provider, signer, address, chainId: Number(network.chainId) };
}
