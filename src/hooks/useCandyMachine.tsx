import {
  FindMintedNftsByCandyMachineV2Output,
  Metaplex,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CANDY_MACHINE_ID } from "../constants";

const useCandyMachine = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [candyMachineState, setCandyMachineState] =
    useState<FindMintedNftsByCandyMachineV2Output>();
  const metaplex = useMemo(
    () => Metaplex.make(connection).use(walletAdapterIdentity(wallet)),
    [connection, wallet]
  );
  const getData = useCallback(async () => {
    if (wallet.connected) {
      metaplex
        .candyMachinesV2()
        .findMintedNfts({ candyMachine: new PublicKey(CANDY_MACHINE_ID) })
        .then((_mintedByCmd) => {
          console.log("Minted By CMD", _mintedByCmd);
          setCandyMachineState(_mintedByCmd);
        })
        .then(() => {
          setIsLoading(false);
          setRefresh(false);
        });
    }
  }, []);
  useEffect(() => {
    getData();
  }, [refresh, wallet.connected]);
  const refreshCandyMachine = useCallback(async () => {
    setRefresh(true);
  }, []);
  return {
    isLoading,
    setIsLoading,
    candyMachineState,
    refreshCandyMachine,
  };
};

export default useCandyMachine;
