import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CANDY_MACHINE_ID } from "../constants";

const useWalletNfts = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [doesOwnCmdNft, setDoesOwnCmdNft] = useState(false);
  const [isLoadingNfts, setIsLoadingNfts] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const metaplex = useMemo(
    () => Metaplex.make(connection).use(walletAdapterIdentity(wallet)),
    [connection, wallet]
  );

  const getNfts = useCallback(async () => {
    if (wallet.connected) {
      console.log("fetching...");
      setIsLoadingNfts(true);
      metaplex
        .nfts()
        .findAllByOwner({ owner: wallet.publicKey as PublicKey })
        .then((_mintedByWallet) => {
          console.log("Minted By Wallet", _mintedByWallet);
          metaplex
            .candyMachinesV2()
            .findMintedNfts({ candyMachine: new PublicKey(CANDY_MACHINE_ID) })
            .then((_mintedByCmd) => {
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
                setDoesOwnCmdNft(true);
                console.log("Wallet+CMD:", ownedByCmd);
                localStorage.setItem(
                  "walletCmdNfts",
                  JSON.stringify(ownedByCmd)
                );
              }
              setIsLoadingNfts(false);
            })
            .catch((error) => {
              setIsLoadingNfts(false);
              console.log(error);
            });
        })
        .catch((error) => {
          setIsLoadingNfts(false);
          console.log(error);
        });
    }
  }, [wallet.connected]);
  useEffect(() => {
    const nfts = localStorage.getItem("walletCmdNfts");
    if (wallet.connected) {
      if (!nfts || refresh) {
        getNfts().then(() => {
          setRefresh(false);
        });
      } else {
        setDoesOwnCmdNft(true);
        console.log("Wallet+CMD", JSON.parse(nfts));
      }
    }
  }, [getNfts, metaplex, refresh, wallet.connected]);
  return {
    isCmdNftMinted: doesOwnCmdNft,
    isLoading: isLoadingNfts,
    getNfts,
  };
};

export default useWalletNfts;
