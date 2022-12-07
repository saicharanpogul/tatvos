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
} from "@chakra-ui/react";
import { Metaplex } from "@metaplex-foundation/js";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import _ from "lodash";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { Back, Info, PageMeta } from "../src/components";

const NewMint = () => {
  const { connection } = useConnection();
  const [metadata, setMetadata] = useState<Metadata>();
  const router = useRouter();
  const [isStaked, setIsStaked] = useState(false);
  const [stakingDays, setStakingDays] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [claimable, setClaimable] = useState(0);
  const [isStaking, setIsStaking] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const metaplex = useMemo(() => Metaplex.make(connection), [connection]);
  const { mintAddress } = router.query;
  const mint = useMemo(
    () => (mintAddress && new PublicKey(mintAddress)) as PublicKey,
    [mintAddress]
  );
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (!mint) return;
    metaplex
      .nfts()
      .findByMint({ mintAddress: new PublicKey(mint) })
      .then(async (nft) => {
        const res = await fetch(nft.uri);
        const json = await res.json();
        setMetadata(json);
      })
      .catch((error) => console.error(error));
  }, [metaplex, mint]);
  return (
    <Container maxW={"xl"}>
      <PageMeta title="New Mint" />
      <Flex
        justifyContent={"center"}
        flexDirection="column"
        alignItems={"center"}
        marginTop="2"
      >
        <Heading color={"text"}>{metadata?.name}</Heading>
        <Image
          marginTop="10"
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
        <Box marginTop={"10"}>
          <Text
            color="text"
            fontSize={"lg"}
            fontWeight="bold"
            textAlign={"center"}
            backgroundColor="gray.700"
            padding={"2"}
            borderRadius="lg"
          >
            {isStaked ? `staking ${stakingDays} days` : "ready to stake"}
          </Text>
          <Text
            color="text"
            fontSize={"4xl"}
            fontWeight="extrabold"
            textAlign={"center"}
            marginTop="6"
          >
            {`${totalEarned} $TOS`}
          </Text>
          <Text
            color="text"
            fontSize={"lg"}
            fontWeight="semibold"
            textAlign={"center"}
            marginTop="2"
          >
            {`${claimable} $TOS claimable`}
          </Text>
        </Box>
        {isStaked ? (
          <>
            <Button
              marginTop={"4"}
              color={"text"}
              backgroundColor="primary"
              border="1px"
              _hover={{ backgroundColor: "primary" }}
              _active={{ backgroundColor: "primary" }}
              isLoading={isStaking}
              loadingText="unstaking..."
              onClick={() => {}}
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
              isLoading={isStaking}
              loadingText="claiming..."
              onClick={() => {}}
              w="36"
            >
              claim
            </Button>
          </>
        ) : (
          <Tooltip label="Earn 86,000 * rand(<shells>) / 1B = $TOS">
            <Button
              marginTop={"4"}
              color={"text"}
              backgroundColor="primary"
              border="1px"
              _hover={{ backgroundColor: "primary" }}
              _active={{ backgroundColor: "primary" }}
              isLoading={isStaking}
              loadingText="staking..."
              onClick={() => {}}
              w="36"
            >
              stake
            </Button>
          </Tooltip>
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
          <ModalBody>
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
