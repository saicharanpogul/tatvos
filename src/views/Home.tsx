import { ArrowForwardIcon, RepeatIcon } from "@chakra-ui/icons";
import {
  Button,
  CircularProgress,
  Flex,
  Heading,
  HStack,
  Image,
  Text,
} from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/router";
import React from "react";
import { ConnectWalletButton } from "../components";
import useWalletNfts from "../hooks/useWalletNfts";
import styles from "../../styles/View.module.css";

const Home = () => {
  const wallet = useWallet();
  const { connected } = wallet;
  const router = useRouter();
  const { isCmdNftMinted, isLoading, refreshNfts } = useWalletNfts();
  return (
    <Flex
      justifyContent="center"
      marginTop={"10"}
      flexDirection="column"
      alignItems="center"
    >
      <Heading
        color="text"
        textAlign="center"
        maxW={[300, 400]}
        fontSize={["xl", "3xl"]}
      >
        Mint your Tatvos. Stake it. Earn $TOS & Mint compounds using minted
        tatvos.
      </Heading>
      <Image
        marginTop="10"
        alignSelf="center"
        src="/Element.png"
        width={["256px", "320px"]}
        height={["256px", "320px"]}
        alt="image"
      />
      <ConnectWalletButton
        onChildClick={() => {
          router.push("/mint");
        }}
        style={{ marginTop: "10" }}
      >
        <HStack>
          {connected ? (
            <>
              <Text>get tatvos</Text>
              <ArrowForwardIcon />
            </>
          ) : (
            <>
              <Text>Connect Wallet</Text>
              <ArrowForwardIcon />
            </>
          )}
        </HStack>
      </ConnectWalletButton>
      {connected && isCmdNftMinted && (
        <>
          <Button
            variant={"outline"}
            _hover={{ backgroundColor: "background" }}
            _active={{ backgroundColor: "background" }}
            color={"text"}
            marginTop="10"
            onClick={() => router.push("/mints")}
            onDoubleClick={refreshNfts}
          >
            you already hold some tatvos!
          </Button>
        </>
      )}
      {connected && (
        <RepeatIcon
          height={"6"}
          width="6"
          color={"text"}
          cursor="pointer"
          marginTop={"4"}
          onClick={!isLoading ? refreshNfts : () => {}}
          className={isLoading ? styles.rotate : undefined}
        />
      )}
      {isLoading && (
        <Flex
          justifyContent={"center"}
          alignItems="center"
          flexDirection={"column"}
        >
          {/* <CircularProgress
            marginTop="10"
            size="8"
            isIndeterminate
            color="grey"
          /> */}
          <Text color="text" fontSize={"sm"}>
            Loading Nfts...
          </Text>
        </Flex>
      )}
    </Flex>
  );
};

export default Home;
