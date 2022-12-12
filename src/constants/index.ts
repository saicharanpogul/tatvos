import { PublicKey } from "@solana/web3.js";

export const CANDY_MACHINE_ID = "9XvG2s8DNwkcTGNrSubLTqCwbxHJuxFW3SokXjk7jGLo";
// export const CANDY_MACHINE_ID = "6c3eVkmukPhBLt9FnQC1UbfB5r1e8YdopGLmmA1ZPYBK";
// export const NFT_STAKING_PROGRAM_ID =
//   "BXQuRiYccLrAmjJ5GduRk1EDGQ6HAYstQA7aNvxmdtRW";
export const NFT_STAKING_PROGRAM_ID =
  "EEtnT4dQAVRj4uKkBND9fszGr4e2UM9Sd6TKF45VPy4";
// export const STAKE_MINT_ID = "7u13Zgjn2ehsCMsK7B3cBtpKL8ktz4G8sYZjw4ZvxKJi";
export const STAKE_MINT_ID = "F3ztAGgGxSdF7e5YQSqgSYyp1ntBZhnKQ3XYcY9J2aCU";

export const PROGRAM_ID = new PublicKey(NFT_STAKING_PROGRAM_ID);
export const STAKE_MINT = new PublicKey(STAKE_MINT_ID);
