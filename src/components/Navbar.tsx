import { Flex, Heading } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import ConnectWalletButton from "./ConnectWalletButton";

const Navbar = () => {
  const router = useRouter();
  return (
    <div>
      <Flex flexDirection={"row"} justifyContent="space-between" paddingY={6}>
        <Heading
          fontSize={["2xl", "3xl"]}
          color="text"
          cursor={"pointer"}
          onClick={() => router.replace("/")}
        >
          Tatvos
        </Heading>
        <ConnectWalletButton />
      </Flex>
    </div>
  );
};

export default Navbar;
