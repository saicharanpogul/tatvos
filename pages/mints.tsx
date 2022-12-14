import {
  Box,
  CircularProgress,
  Container,
  Flex,
  Grid,
  GridItem,
  Image,
  Text,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import _ from "lodash";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  RepeatIcon,
} from "@chakra-ui/icons";
import { Back, PageMeta } from "../src/components";
import useWalletNfts from "../src/hooks/useWalletNfts";
import styles from "../styles/View.module.css";
import { useRouter } from "next/router";

const Mints = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [page, setPage] = useState(1);
  const [pageItems, setPageItems] = useState<Metadata[]>();
  const [isLoading, setLoading] = useState(false);
  const { getNfts, isLoading: isNftLoading } = useWalletNfts(false);
  const [data, setData] = useState<{ offChain: Metadata; onChain: NFT }[]>();
  const router = useRouter();

  const getPage = useCallback(
    async (page: number, perPage: number) => {
      try {
        setLoading(true);
        const pageItems = nfts.slice((page - 1) * perPage, page * perPage);
        let nftData: Metadata[] = [];
        let _data: { offChain: Metadata; onChain: NFT }[] = [];
        for (let i = 0; i < pageItems.length; i++) {
          let result = await fetch(pageItems[i].uri);
          const data = await result.json();
          nftData.push(data);
          _data.push({ onChain: pageItems[i], offChain: data });
        }
        setPageItems(nftData);
        setData(_data);
        // console.log("data", _data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    },
    [nfts]
  );

  const getNftsAndMetadata = async () => {
    try {
      const _nfts = localStorage.getItem("walletCmdNfts");
      setNfts(JSON.parse(_nfts as string));
    } catch (error) {
      console.log(error);
    }
  };

  const prev = async () => {
    if (page - 1 < 1) {
      setPage(1);
    } else {
      setPage(page - 1);
    }
  };

  const next = async () => {
    setPage(page + 1);
  };

  useEffect(() => {
    getNftsAndMetadata();
  }, [isNftLoading]);

  useEffect(() => {
    if (!nfts) {
      return;
    }
    getPage(page, 6);
  }, [nfts, page, isNftLoading]);
  return (
    <Container maxW="xl">
      <PageMeta title="mints" />
      <Flex
        flexDirection="column"
        alignItems={"center"}
        justifyContent="center"
      >
        <Flex width={"100%"} marginBottom={"10"} justifyContent="space-between">
          <Flex>
            <RepeatIcon
              alignSelf={"flex-end"}
              height={"6"}
              width="6"
              color={"text"}
              cursor="pointer"
              onClick={
                !isNftLoading
                  ? async () => {
                      await getNfts();
                      await getPage(page, 6);
                    }
                  : () => {}
              }
              className={isNftLoading ? styles.rotate : undefined}
            />
            {isNftLoading && (
              <Text ml="2" color="text">
                Syncing Nfts...
              </Text>
            )}
          </Flex>
          <Box>
            <ChevronLeftIcon
              height="6"
              width="6"
              color={nfts!.length > 6 && page !== 1 ? "text" : "grey"}
              cursor={
                nfts!.length > 6 && page !== 1 ? "pointer" : "not-allowed"
              }
              onClick={nfts!.length > 6 && page !== 1 ? prev : () => {}}
            />
            <ChevronRightIcon
              height="6"
              width="6"
              color={
                nfts!.length > 6 &&
                page * 6 !== nfts!.length &&
                pageItems!.length === 6
                  ? "text"
                  : "grey"
              }
              cursor={
                nfts!.length > 6 &&
                page * 6 !== nfts!.length &&
                pageItems!.length === 6
                  ? "pointer"
                  : "not-allowed"
              }
              onClick={
                nfts!.length > 6 &&
                page * 6 !== nfts!.length &&
                pageItems!.length === 6
                  ? next
                  : () => {}
              }
            />
          </Box>
        </Flex>
        <Grid templateColumns={["repeat(2, 1fr)", "repeat(3, 1fr)"]} gap={2}>
          {data &&
            data?.map((item, index) => (
              <GridItem
                onClick={() => {
                  // setModalData(item);
                  // onOpen();
                  router.push(`/${item.onChain.mintAddress}`);
                }}
                maxW={["180px", "220px"]}
                maxH={["180px", "220px"]}
                key={item.offChain.name + "_" + index}
                cursor="pointer"
              >
                <Flex
                  justifyContent="center"
                  alignItems={"center"}
                  flexDirection="column"
                >
                  <Image
                    src={item.offChain.image}
                    alt={item.offChain.name}
                    objectFit="cover"
                    fallbackSrc={"/Element.png"}
                    borderRadius="12px"
                  />
                </Flex>
              </GridItem>
            ))}
        </Grid>
      </Flex>
      <Flex justifyContent={"center"}>
        <Back />
      </Flex>
      {/* <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent backgroundColor="background">
          <ModalHeader textAlign={"center"} color="text">
            Metadata
          </ModalHeader>
          <ModalCloseButton color={"text"} />
          <ModalBody>
            <Info title="Name" value={modalData?.name} />
            <Info title="Symbol" value={modalData?.symbol} />
            {modalData?.attributes?.map((attribute) => {
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
      </Modal> */}
    </Container>
  );
};

export default Mints;
