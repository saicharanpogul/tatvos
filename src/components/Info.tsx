import React from "react";
import { Flex, Text } from "@chakra-ui/react";

const Info = ({ title, value }: { title: string; value?: string }) => {
  return (
    <Flex
      flexDirection={"column"}
      padding={"2"}
      w="fit-content"
      color={"text"}
      backgroundColor="primary"
      border="1px"
      m={"1"}
      borderRadius="4"
    >
      <Text color="grey" fontSize={"14"} fontWeight={"medium"}>
        {title}
      </Text>
      <Text color="text" fontSize={"14"} fontWeight={"bold"}>
        {value}
      </Text>
    </Flex>
  );
};

export default Info;
