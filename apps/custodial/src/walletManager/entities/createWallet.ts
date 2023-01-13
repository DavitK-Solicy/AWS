import { ethers } from "ethers"
import { Wallet } from "../../models/Wallet";

const createWallet = () => {
  try {
    const wallet = ethers.Wallet.createRandom()

    return Wallet.create({
      address: wallet.address,
      mnemonic: wallet.mnemonic.phrase,
      privateKey: wallet.privateKey,
    });
  } catch (e) {
    console.error(e);
    return false;
  }
}

export default createWallet;
