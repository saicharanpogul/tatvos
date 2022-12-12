import { createContext, useContext } from "react";
import {
  AnchorProvider,
  Idl,
  Program,
  setProvider,
} from "@project-serum/anchor";
import { AnchorNftStaking, IDL } from "../utils/anchor_nft_staking";
import { PROGRAM_ID } from "../constants";
import { Connection, Keypair, Transaction } from "@solana/web3.js";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";

const WorkspaceContext = createContext({});
const programId = PROGRAM_ID;

interface Workspace {
  connection?: Connection;
  provider?: AnchorProvider;
  program?: Program<AnchorNftStaking>;
}

const MockWallet = {
  publicKey: Keypair.generate().publicKey,
  signTransaction: (transaction: Transaction) => Promise.resolve(transaction),
  signAllTransactions: (transactions: Transaction[]) =>
    Promise.resolve(transactions),
};

const WorkspaceProvider = ({ children }: any) => {
  const wallet = useAnchorWallet() || MockWallet;
  const { connection } = useConnection();
  const provider = new AnchorProvider(connection, wallet, {});
  setProvider(provider);
  const program = new Program(IDL as Idl, programId);
  const workspace = {
    connection,
    provider,
    program,
  };

  return (
    <WorkspaceContext.Provider value={workspace}>
      {children}
    </WorkspaceContext.Provider>
  );
};

const useWorkSpace = (): Workspace => {
  return useContext(WorkspaceContext);
};

export { WorkspaceProvider, useWorkSpace };
