import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Image,
  Text,
} from "@chakra-ui/react";
import React, {
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Metaplex,
  walletAdapterIdentity,
  CandyMachineV2,
} from "@metaplex-foundation/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { CANDY_MACHINE_ID } from "../src/constants";
import { useRouter } from "next/router";
import { Back, PageMeta } from "../src/components";
import useWalletNfts from "../src/hooks/useWalletNfts";

const Mint = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [candyMachine, setCandyMachine] = useState<CandyMachineV2>();
  const [isMinting, setIsMinting] = useState(false);
  const router = useRouter();
  const { getNfts } = useWalletNfts(false);

  const metaplex = useMemo(
    () => Metaplex.make(connection).use(walletAdapterIdentity(wallet)),
    [connection, wallet]
  );

  useEffect(() => {
    if (!metaplex) return;
    metaplex
      .candyMachinesV2()
      .findByAddress({
        address: new PublicKey(CANDY_MACHINE_ID),
      })
      .then((_candyMachine) => {
        // console.log(_candyMachine);
        setCandyMachine(_candyMachine);
      });
  }, [metaplex]);
  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    async (event) => {
      setIsMinting(true);
      if (event.defaultPrevented) return;
      if (!wallet.connected || !candyMachine) return;
      try {
        const nft = await metaplex.candyMachinesV2().mint({
          candyMachine: candyMachine,
        });
        console.log(nft);
        await getNfts();
        router.push(`/${nft.nft.address.toBase58()}`);
        // router.push(`/H9Mei7jM5KJZdWFB8kb8nS7V3GK9EVRb2TMjHERfScuq`);
      } catch (error) {
        console.error(error);
      } finally {
        setIsMinting(false);
      }
    },
    [metaplex, wallet, candyMachine]
  );
  return (
    <Container maxW="container.xl">
      <PageMeta title="mint" />
      <Flex
        justifyContent={"center"}
        flexDirection="column"
        alignItems={"center"}
        marginTop="16"
      >
        <Heading color={"text"} textAlign="center">
          Mint your Tatvos and earn $TOS everyday.
        </Heading>
        <Image
          marginTop="10"
          alignSelf="center"
          src="/Element.png"
          width={["256px", "320px"]}
          height={["256px", "320px"]}
          alt="image"
        />
        <Text
          color="text"
          marginTop={"10"}
          fontSize="2xl"
          fontWeight={"semibold"}
        >
          {candyMachine
            ? `${candyMachine?.itemsRemaining.toNumber()} / ${candyMachine?.itemsAvailable.toNumber()}`
            : "0/0"}
        </Text>
        <Text color="text" marginTop={"1"} fontSize="lg" fontWeight={"medium"}>
          {`Price: ${
            candyMachine
              ? candyMachine!.price!.basisPoints.toNumber() / LAMPORTS_PER_SOL
              : 0
          } SOL`}
        </Text>
        <Button
          marginTop={"4"}
          color={"text"}
          backgroundColor="primary"
          border="1px"
          _hover={{ backgroundColor: "primary" }}
          _active={{ backgroundColor: "primary" }}
          isLoading={isMinting}
          loadingText="Minting..."
          onClick={handleClick}
        >
          mint tatvos
        </Button>
        <Back />
      </Flex>
    </Container>
  );
};

export default Mint;
