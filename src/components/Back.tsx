import { ArrowBackIcon } from "@chakra-ui/icons";
import { Button, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";

const Back = () => {
  const router = useRouter();
  return (
    <>
      <Button
        backgroundColor={"background"}
        _hover={{ backgroundColor: "background" }}
        _active={{ backgroundColor: "background" }}
        marginTop="4"
        onClick={() => router.back()}
      >
        <ArrowBackIcon color={"text"} />
        <Text color="text" marginLeft={"2"}>
          back
        </Text>
      </Button>
    </>
  );
};

export default Back;
