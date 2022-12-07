import {
  Box,
  Button,
  Divider,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PhantomWalletName } from "@solana/wallet-adapter-wallets";
import React, { useCallback, useEffect, useState } from "react";
import { truncateAddress } from "../utils";

interface WithChildren {
  children: React.ReactNode;
  onChildClick: () => void;
  style?: {};
}

interface WithoutChildren {}

type Props = XOR<WithChildren, WithoutChildren>;

const ConnectWalletButton: React.FC<Props> = ({
  children,
  onChildClick,
  style,
}) => {
  const [isPhantom, setIsPhantom] = useState(false);
  const { connected, connect, select, disconnect, publicKey, wallet } =
    useWallet();
  const [base58, setBase58] = useState("");
  const toast = useToast();
  const { onClose, isOpen, onOpen } = useDisclosure();

  useEffect(() => {
    // @ts-ignore
    if (window!.solana) {
      setIsPhantom(true);
    }
    wallet?.adapter.addListener("error", (error) => {
      toast({
        title: error.name,
        description: error.message,
        duration: 5000,
        status: "error",
        isClosable: true,
      });
    });
    return () => {
      wallet?.adapter.removeListener("error");
    };
  }, [wallet]);
  useEffect(() => {
    if (connected && publicKey) {
      setBase58(publicKey.toBase58());
    }
  }, [connected]);
  const connectWallet = useCallback(async () => {
    if (!connected) {
      try {
        select(PhantomWalletName);
        await connect().catch(() => {});
        onClose();
      } catch (error) {}
    } else {
      onChildClick && onChildClick();
    }
  }, [connected]);
  const disconnectWallet = useCallback(async () => {
    if (connected) {
      await disconnect();
      onClose();
      localStorage.removeItem("walletCmdNfts");
    }
  }, [connected]);
  const copyAddress = useCallback(async () => {
    if (connected) {
      await navigator.clipboard.writeText(base58);
      toast({
        title: "Copied Address",
        description: "Address copied to clipboard",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      onClose();
    }
  }, [base58, connected, onClose, toast]);
  return (
    <Box {...style}>
      <Popover
        placement="bottom-end"
        onClose={onClose}
        isOpen={isOpen}
        onOpen={onOpen}
      >
        <PopoverTrigger>
          <Button
            color={"text"}
            backgroundColor="primary"
            border="1px"
            _hover={{ backgroundColor: "primary" }}
            _active={{ backgroundColor: "primary" }}
            onClick={
              isPhantom
                ? connectWallet
                : () => window.open("https://phantom.app")
            }
          >
            {children
              ? children
              : isPhantom
              ? connected
                ? truncateAddress(base58)
                : "Connect Wallet"
              : "Install Phantom"}
          </Button>
        </PopoverTrigger>
        {isPhantom && connected && !children && (
          <PopoverContent background={"primary"} maxWidth={150}>
            <PopoverBody
              display={"flex"}
              justifyContent={"center"}
              flexDirection="column"
            >
              <Button
                width={"full"}
                variant="unstyled"
                color={"text"}
                onClick={disconnectWallet}
              >
                Disconnect
              </Button>
              <Divider color="primary" />
              <Button
                width={"full"}
                variant="unstyled"
                color={"text"}
                onClick={copyAddress}
              >
                Copy Address
              </Button>
            </PopoverBody>
          </PopoverContent>
        )}
      </Popover>
    </Box>
  );
};

export default ConnectWalletButton;
