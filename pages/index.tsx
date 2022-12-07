import { Box, Button, Container, Flex } from "@chakra-ui/react";
import styled from "styled-components";
import { Navbar, PageMeta } from "../src/components";
import { colors } from "../src/theme";
import { Home as HomeView } from "../src/views";

export default function Home() {
  return (
    <Box>
      <PageMeta />
      <Container maxW="container.xl">
        <HomeView />
      </Container>
    </Box>
  );
}
