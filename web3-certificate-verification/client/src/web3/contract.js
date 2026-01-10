import { Contract } from "ethers";
import { CONTRACTS } from "../config/contracts";

// import ABI (tạm thời bạn để file json rỗng hoặc copy ABI sau)
import registryAbi from "../abi/CertificateRegistry.json";

export function getRegistryContract({ providerOrSigner, chainId }) {
  const address = CONTRACTS?.[chainId]?.CertificateRegistry;
  if (!address || address.includes("YOUR_")) {
    throw new Error("Chưa cấu hình contract address cho mạng hiện tại");
  }
  return new Contract(address, registryAbi.abi ?? registryAbi, providerOrSigner);
}
