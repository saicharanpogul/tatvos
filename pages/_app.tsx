import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Box, Button, ChakraProvider, Container, Flex } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";
import { Navbar, WalletContextProvider } from "../src/components";
import { colors } from "../src/theme";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { WorkspaceProvider } from "../src/components/WorkplaceProvider";

const theme = extendTheme({
  colors,
  styles: {
    global: () => ({
      "html, body": {
        background: colors.background,
      },
    }),
    fonts: {
      heading: "Poppins",
      body: "Poppins",
    },
  },
});

const MyApp = () => {
  const { connected } = useWallet();
  const router = useRouter();
  useEffect(() => {
    if (!connected) {
      router.replace("/");
    }
  }, [connected]);
  return (
    <Container maxW="container.xl">
      <Navbar />
    </Container>
  );
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <WalletContextProvider>
        <WorkspaceProvider>
          <Box height={"100vh"}>
            <MyApp />
            <Component {...pageProps} />
            <Flex
              justifyContent="center"
              flexDirection="column"
              alignItems="center"
            >
              <Button variant={"link"} marginTop="10" marginBottom="10">
                <a
                  href="https://twitter.com/_buildspace?s=20&t=fAnBQXcDi_fmO7e9TzptTQ"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  built with @buildspace
                </a>
              </Button>
            </Flex>
          </Box>
        </WorkspaceProvider>
      </WalletContextProvider>
    </ChakraProvider>
  );
}
