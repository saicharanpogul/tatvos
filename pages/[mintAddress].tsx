import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tooltip,
  Text,
  useDisclosure,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Grid,
  GridItem,
  Popover,
} from "@chakra-ui/react";
import {
  Metaplex,
  Nft,
  NftWithToken,
  Sft,
  SftWithToken,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from "@solana/web3.js";
import _ from "lodash";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Back, Info, PageMeta } from "../src/components";
import { useWorkSpace } from "../src/components/WorkplaceProvider";
import { PROGRAM_ID, STAKE_MINT } from "../src/constants";
import useLimit from "../src/hooks/useLimit";
import { getBlock, getBlockAtomicNumbers } from "../src/utils";
import { PROGRAM_ID as METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { AnchorNftStaking } from "../src/utils/anchor_nft_staking";
import { Program, web3 } from "@project-serum/anchor";
import { getAssociatedTokenAddress } from "@solana/spl-token";

const getStakeAccount = async (
  user: PublicKey,
  tokenAccount: PublicKey,
  program: Program<AnchorNftStaking>
): Promise<any> => {
  try {
    const [accountPubkey] = PublicKey.findProgramAddressSync(
      [user.toBuffer(), tokenAccount.toBuffer()],
      program.programId
    );
    const account = await program.account.userStakeInfo.fetch(accountPubkey);
    return account;
  } catch (error) {
    throw error;
  }
};

const NewMint = () => {
  const { connection } = useConnection();
  const [metadata, setMetadata] = useState<Metadata>();
  const router = useRouter();
  const { checkIsDisabled } = useLimit();
  const [isStaked, setIsStaked] = useState(false);
  const [stakingDays, setStakingDays] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [claimable, setClaimable] = useState("0");
  const [staking, setStaking] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [unstaking, setUnstaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nftData, setNftData] = useState<
    Sft | SftWithToken | Nft | NftWithToken
  >();
  const metaplex = useMemo(() => Metaplex.make(connection), [connection]);
  const { mintAddress } = router.query;
  const mint = useMemo(
    () => (mintAddress && new PublicKey(mintAddress)) as PublicKey,
    [mintAddress]
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const workspace = useWorkSpace();
  const walletAdapter = useWallet();
  const [nftTokenAccount, setNftTokenAccount] = useState<PublicKey>();

  useEffect(() => {
    if (!mint) return;
    metaplex
      .nfts()
      .findByMint({ mintAddress: new PublicKey(mint) })
      .then(async (nft) => {
        const res = await fetch(nft.uri);
        const json = await res.json();
        const atomicNumber = parseInt(json.attributes[0].value);
        setMetadata(json);
        const numbers = getBlockAtomicNumbers(atomicNumber);
        const max = Math.max(...numbers);
        const block = getBlock(atomicNumber);
        setClaimable((10 * (max / block)).toFixed(2));
      })
      .catch((error) => console.error(error));
  }, [metaplex, mint]);

  const getNftData = async () => {
    setLoading(true);
    if (!mint) {
      return;
    }
    const mx = Metaplex.make(connection).use(
      walletAdapterIdentity(walletAdapter)
    );
    try {
      mx.nfts()
        .findByMint({ mintAddress: mint as PublicKey })
        .then((nft) => {
          console.log("nft data on stake page:", nft);
          setNftData(nft);
          console.log("Data", nft.json);
        });
    } catch (error) {
      console.log("error getting nft:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkStakingStatus = useCallback(async () => {
    if (
      !walletAdapter.connected ||
      !walletAdapter.publicKey ||
      !nftTokenAccount ||
      !workspace.program
    ) {
      console.log(
        "Not checking status...",
        walletAdapter.publicKey,
        nftTokenAccount
      );
      return;
    }
    try {
      console.log("Checking status...");
      const account = await getStakeAccount(
        walletAdapter.publicKey,
        nftTokenAccount,
        workspace.program
      );
      const days = Math.floor(
        (new Date().getTime() -
          new Date(account.lastStakeRedeem.toNumber() * 1000).getTime()) /
          86400000
      );
      setStakingDays(days);
      setTotalEarned(account.totalEarned.toNumber());
      // console.log("total earned:", account.totalEarned.toNumber());
      // console.log("days:", days);
      // console.log("stake account:", account);
      // console.log("stakeState:", account.stakeState);
      // console.log(
      //   "lastStakeRedeem:",
      //   new Date(account.lastStakeRedeem.toNumber() * 1000)
      // );
      // console.log(
      //   "stakeStartTime:",
      //   new Date(account.stakeStartTime.toNumber() * 1000)
      // );
      // console.log("tokenAccount:", account.tokenAccount?.toBase58());
      // console.log("userPubkey:", account.userPubkey?.toBase58());
      // console.log("isInitialized:", account.isInitialized);
      setIsStaked(account.stakeState.staked);
    } catch (error) {
      console.log("error:", error);
    }
  }, [connection, nftTokenAccount, walletAdapter]);

  useEffect(() => {}, [isStaked]);

  useEffect(() => {
    checkStakingStatus();
    if (nftData) {
      connection
        .getTokenLargestAccounts(nftData.mint.address)
        .then((accounts) => setNftTokenAccount(accounts.value[0].address));
    }
  }, [walletAdapter, connection, nftData, staking, claiming, unstaking]);

  useEffect(() => {
    getNftData();
  }, []);

  const sendAndConfirmTransaction = useCallback(
    async (transaction: Transaction) => {
      try {
        const signature = await walletAdapter.sendTransaction(
          transaction,
          connection
        );
        const latestBlockhash = await connection.getLatestBlockhash();
        await connection.confirmTransaction(
          {
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            signature,
          },
          "finalized"
        );
        await checkStakingStatus();
      } catch (error) {
        console.log(error);
      }
    },
    [walletAdapter, connection]
  );

  const handleStake = useCallback(async () => {
    try {
      setStaking(true);
      if (
        !walletAdapter.connected ||
        !walletAdapter.publicKey ||
        !nftTokenAccount ||
        !workspace.program
      ) {
        alert("Please connect your wallet");
        return;
      }

      const [stakeAccount] = PublicKey.findProgramAddressSync(
        [walletAdapter.publicKey.toBuffer(), nftTokenAccount.toBuffer()],
        PROGRAM_ID
      );

      const [delegateAuthPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("authority")],
        PROGRAM_ID
      );

      const tx = new Transaction();
      tx.add(
        await workspace.program.methods
          .stake()
          .accounts({
            nftTokenAccount: nftTokenAccount,
            nftMint: nftData!.mint.address,
            nftEdition: nftData!.edition.address,
            metadataProgram: METADATA_PROGRAM_ID,
            stakeState: stakeAccount,
            user: walletAdapter.publicKey,
            programAuthority: delegateAuthPda,
          })
          .instruction()
      );
      await sendAndConfirmTransaction(tx);
    } catch (error) {
      console.log("staking error:", error);
    } finally {
      setStaking(false);
    }
  }, [walletAdapter, connection, nftData, nftTokenAccount]);

  const handleClaim = useCallback(async () => {
    try {
      setClaiming(true);
      if (
        !walletAdapter.connected ||
        !walletAdapter.publicKey ||
        !nftTokenAccount ||
        !workspace.program
      ) {
        alert("Please connect your wallet");
        return;
      }

      const [stakeAccount] = PublicKey.findProgramAddressSync(
        [walletAdapter.publicKey.toBuffer(), nftTokenAccount.toBuffer()],
        PROGRAM_ID
      );

      const userStakeATA = await getAssociatedTokenAddress(
        STAKE_MINT,
        walletAdapter.publicKey
      );

      const [mintAuth] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("mint")],
        PROGRAM_ID
      );

      const tx = new Transaction();
      tx.add(
        await workspace.program.methods
          .redeem()
          .accounts({
            nftTokenAccount: nftTokenAccount,
            stakeMint: STAKE_MINT,
            userStakeAta: userStakeATA,
            stakeState: stakeAccount,
            stakeAuthority: mintAuth,
            user: walletAdapter.publicKey,
            mintMetadata: nftData!.metadataAddress,
          })
          .instruction()
      );

      await sendAndConfirmTransaction(tx);
    } catch (error) {
      console.log("claim error:", error);
    } finally {
      setClaiming(false);
    }
  }, [walletAdapter, connection, nftData, nftTokenAccount]);

  const handleUnstake = useCallback(async () => {
    try {
      setUnstaking(true);
      if (
        !walletAdapter.connected ||
        !walletAdapter.publicKey ||
        !nftTokenAccount ||
        !workspace.program
      ) {
        alert("Please connect your wallet");
        return;
      }

      const [stakeAccount] = PublicKey.findProgramAddressSync(
        [walletAdapter.publicKey.toBuffer(), nftTokenAccount.toBuffer()],
        PROGRAM_ID
      );

      const userStakeATA = await getAssociatedTokenAddress(
        STAKE_MINT,
        walletAdapter.publicKey
      );

      const [mintAuth] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("mint")],
        PROGRAM_ID
      );

      const [delegateAuthPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("authority")],
        PROGRAM_ID
      );

      const tx = new Transaction();
      tx.add(
        await workspace.program.methods
          .unstake()
          .accounts({
            nftTokenAccount: nftTokenAccount,
            nftMint: nftData!.mint.address,
            nftEdition: nftData!.edition.address,
            metadataProgram: METADATA_PROGRAM_ID,
            stakeMint: STAKE_MINT,
            userStakeAta: userStakeATA,
            user: walletAdapter.publicKey,
            stakeAuthority: mintAuth,
            stakeState: stakeAccount,
            programAuthority: delegateAuthPda,
            mintMetadata: nftData!.metadataAddress,
          })
          .instruction()
      );
      await sendAndConfirmTransaction(tx);
    } catch (error) {
      console.log("unstake error:", error);
    } finally {
      setUnstaking(false);
    }
  }, [walletAdapter, connection, nftData, nftTokenAccount]);

  return (
    <Container maxW={"xl"}>
      <PageMeta title={metadata?.name.toLowerCase()} />
      <Flex
        justifyContent={"center"}
        flexDirection="column"
        alignItems={"center"}
        marginTop="2"
      >
        <Heading color={"text"}>{metadata?.name.toLowerCase()}</Heading>
        <Image
          marginTop="2"
          alignSelf="center"
          src={metadata?.image}
          fallbackSrc="/Element.png"
          // _hover={{
          //   height: ["270px", "340px"],
          //   width: ["270px", "340px"],
          //   transition: "ease-in-out",
          //   transitionDuration: "300ms",
          // }}
          width={["256px", "320px"]}
          height={["256px", "320px"]}
          alt="image"
          onClick={onOpen}
          cursor="pointer"
        />
        <Box width={["256px", "320px"]} marginTop="4">
          <Accordion allowToggle borderColor={"background"}>
            <AccordionItem>
              <Text>
                <AccordionButton>
                  <Box flex="1" textAlign="center">
                    <Text color={"text"} fontWeight="600">
                      rewards calculation
                    </Text>
                  </Box>
                  <AccordionIcon color={"text"} />
                </AccordionButton>
              </Text>
              <AccordionPanel pb={4}>
                <Text color="text" textAlign="center">
                  {"Reward are calculated as follow:"}
                </Text>
                <Text color="text" textAlign="center">
                  {"100 x N x B = $TOS / day"}
                </Text>
                <Text color="text" mt="2" textAlign="center" fontSize={"12"}>
                  {"\n B: Block Number of the element above"}
                  <br />
                  {"\n N: Atomic Number of Block B randomly selected"}
                </Text>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Box>
        <Flex marginTop={"1"} flexDirection="column">
          <Text
            color="text"
            fontSize={"lg"}
            fontWeight="bold"
            textAlign={"center"}
            backgroundColor="gray.700"
            padding={"2"}
            borderRadius="lg"
            maxW="40"
            alignSelf={"center"}
          >
            {isStaked ? `staking ${stakingDays} days` : "ready to stake"}
          </Text>
          <Text
            color="text"
            fontSize={"4xl"}
            fontWeight="extrabold"
            textAlign={"center"}
            marginTop="4"
          >
            {`${totalEarned} $TOS`}
          </Text>
          <Text
            color="grey"
            fontSize={"md"}
            fontWeight="semibold"
            textAlign={"center"}
            marginTop="2"
          >
            {`upto ${claimable} $TOS claimable / day`}
          </Text>
        </Flex>
        {isStaked ? (
          <>
            <Button
              marginTop={"4"}
              color={"text"}
              backgroundColor="primary"
              border="1px"
              _hover={{ backgroundColor: "primary" }}
              _active={{ backgroundColor: "primary" }}
              isLoading={unstaking || loading}
              loadingText={loading ? "loading..." : "unstaking..."}
              onClick={async () => {
                try {
                  // await checkIsDisabled();
                  await handleUnstake();
                } catch (error) {}
              }}
              w="36"
            >
              unstake
            </Button>
            <Button
              marginTop={"4"}
              color={"text"}
              backgroundColor="primary"
              border="1px"
              _hover={{ backgroundColor: "primary" }}
              _active={{ backgroundColor: "primary" }}
              isLoading={claiming || loading}
              loadingText={loading ? "loading..." : "claiming..."}
              onClick={async () => {
                try {
                  // await checkIsDisabled();
                  await handleClaim();
                } catch (error) {}
              }}
              w="36"
            >
              claim
            </Button>
          </>
        ) : (
          <Button
            marginTop={"4"}
            color={"text"}
            backgroundColor="primary"
            border="1px"
            _hover={{ backgroundColor: "primary" }}
            _active={{ backgroundColor: "primary" }}
            isLoading={staking || loading}
            loadingText={loading ? "loading..." : "staking..."}
            onClick={handleStake}
            w="36"
          >
            stake
          </Button>
        )}
        <Back />
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent backgroundColor="background">
          <ModalHeader textAlign={"center"} color="text">
            Metadata
          </ModalHeader>
          <ModalCloseButton color={"text"} />
          <ModalBody display="flex" flexDirection={"row"} flexWrap="wrap">
            <Info title="Name" value={metadata?.name} />
            <Info title="Symbol" value={metadata?.symbol} />
            {metadata?.attributes?.map((attribute) => {
              if (attribute.trait_type === "electronConfiguration") return;
              return (
                <Info
                  key={attribute.trait_type}
                  title={_.startCase(attribute.trait_type)}
                  value={attribute.value}
                />
              );
            })}
          </ModalBody>
          <ModalFooter>
            <Button
              backgroundColor={"primary"}
              color="text"
              border={"1px"}
              borderColor={"text"}
              _hover={{ backgroundColor: "primary" }}
              _active={{ backgroundColor: "primary" }}
              mr={3}
              onClick={onClose}
              width="100%"
              alignSelf={"center"}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default NewMint;
