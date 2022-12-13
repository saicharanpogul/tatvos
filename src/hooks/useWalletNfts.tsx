import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CANDY_MACHINE_ID } from "../constants";

const useWalletNfts = (canFetch: boolean) => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [isLoadingNfts, setIsLoadingNfts] = useState(false);
  const [nfts, setNfts] = useState<any>();
  const metaplex = useMemo(
    () => Metaplex.make(connection).use(walletAdapterIdentity(wallet)),
    [connection, wallet]
  );

  const getNfts = useCallback(async () => {
    if (!wallet.connected || !metaplex || !wallet.publicKey) {
      return;
    }
    if (isLoadingNfts) return;
    setIsLoadingNfts(true);
    console.log("fetching...");
    try {
      const _mintedByWallet = await metaplex
        .nfts()
        .findAllByOwner({ owner: wallet.publicKey as PublicKey });
      console.log("Minted By Wallet", _mintedByWallet);
      const _mintedByCmd = await metaplex
        .candyMachinesV2()
        .findMintedNfts({ candyMachine: new PublicKey(CANDY_MACHINE_ID) });
      console.log("Minted By CMD", _mintedByCmd);
      const ownedByCmd = _mintedByWallet.filter((_nft) =>
        _mintedByCmd.find(
          (__nft) =>
            // @ts-ignore
            __nft?.mintAddress.toBase58() ===
            // @ts-ignore
            _nft?.mintAddress.toBase58()
        )
      );
      if (ownedByCmd.length > 0) {
        console.log("Wallet+CMD:", ownedByCmd);
        localStorage.setItem("walletCmdNfts", JSON.stringify(ownedByCmd));
        setNfts(ownedByCmd);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingNfts(false);
    }
  }, [metaplex, wallet.connected, wallet.publicKey]);

  useEffect(() => {
    if (canFetch) {
      const nfts = localStorage.getItem("walletCmdNfts");
      console.log(!nfts, isLoadingNfts);
      if (!nfts && isLoadingNfts === false) {
        getNfts();
      } else {
        console.log("Wallet+CMD", JSON.parse(nfts as string));
        setNfts(JSON.parse(nfts as string));
      }
    }
  }, [canFetch, getNfts]);
  return {
    isLoading: isLoadingNfts,
    getNfts,
    nfts,
  };
};

export default useWalletNfts;
