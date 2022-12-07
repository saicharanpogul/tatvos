import React from "react";
import { Flex, Text } from "@chakra-ui/react";

const Info = ({ title, value }: { title: string; value?: string }) => {
  return (
    <Flex justifyContent={"space-between"} marginTop={"2"}>
      <Text color="text" fontWeight={"medium"}>
        {title}
      </Text>
      <Text color="text" fontWeight={"bold"}>
        {value}
      </Text>
    </Flex>
  );
};

export default Info;
