import { HamburgerIcon } from "@chakra-ui/icons";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  useDisclosure,
  useMediaQuery,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import ConnectWalletButton from "./ConnectWalletButton";

const Navbar = () => {
  const router = useRouter();
  const [isNotMobile] = useMediaQuery("(min-width: 600px)");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();
  return (
    <div>
      <Flex
        flexDirection={"row"}
        justifyContent="space-between"
        alignItems={"center"}
        paddingY={6}
      >
        {!isNotMobile && (
          <Flex mr={"4"}>
            <HamburgerIcon
              w="6"
              h="6"
              color={"text"}
              alignSelf="flex-start"
              // @ts-ignore
              ref={btnRef}
              onClick={onOpen}
            />
          </Flex>
        )}
        <Heading
          fontSize={["2xl", "3xl"]}
          color="text"
          cursor={"pointer"}
          onClick={() => router.replace("/")}
          mr="auto"
        >
          tatvos
        </Heading>
        {isNotMobile && (
          <Text color="text" mr="auto" fontWeight={"semibold"} cursor="pointer">
            {`collectibles (coming soon)`}
          </Text>
        )}
        <ConnectWalletButton />
        <Drawer
          isOpen={isOpen}
          placement="top"
          onClose={onClose}
          // @ts-ignore
          finalFocusRef={btnRef}
        >
          <DrawerOverlay />
          <DrawerContent backgroundColor={"primary"} h="10%">
            <DrawerBody>
              <Flex h="full" alignItems={"center"}>
                <Button
                  color={"text"}
                  w="full"
                  variant={"unstyled"}
                >{`collectibles (coming soon)`}</Button>
              </Flex>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Flex>
    </div>
  );
};

export default Navbar;
