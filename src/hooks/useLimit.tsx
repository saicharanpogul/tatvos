import { useToast } from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";

const useLimit = () => {
  const [isDisabled, setIsDisabled] = useState(false);
  const toast = useToast();
  useEffect(() => {
    setIsDisabled(localStorage.getItem("isDisabled") === "true");
  }, []);

  function secondsToDaysHoursMinsSecsStr(seconds: number) {
    var days = Math.floor(seconds / (24 * 60 * 60));
    seconds -= days * (24 * 60 * 60);
    var hours = Math.floor(seconds / (60 * 60));
    seconds -= hours * (60 * 60);
    var minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    return (0 < days ? days + " day, " : "") + hours + "h, " + minutes + "m";
  }

  const checkIsDisabled = useCallback(async () => {
    const isDisabled = localStorage.getItem("isDisabled");
    const date = localStorage.getItem("enableDate");
    const count = localStorage.getItem("limitCount");
    const enableDate = new Date(parseInt(date as string));
    const now = new Date();
    const hours = (enableDate.getTime() - now.getTime()) / 1000;
    if (enableDate && enableDate.getTime() < now.getTime()) {
      localStorage.setItem("isDisabled", "");
      localStorage.setItem("enableDate", "");
      localStorage.setItem("limitCount", "");
      console.log("RESET");
    }
    const timeDiff = secondsToDaysHoursMinsSecsStr(hours);
    if (!isDisabled && !date && !count) {
      localStorage.setItem("limitCount", "1");
      console.log("INCREMENT COUNT 1");
    }
    if (
      count &&
      parseInt(count as string) < 3 &&
      !isDisabled &&
      isDisabled !== "undefined"
    ) {
      localStorage.setItem(
        "limitCount",
        (parseInt(count as string) + 1).toString()
      );
      console.log("INCREMENT COUNT");
    }
    // console.log(
    //   parseInt(count as string) >= 2 &&
    //     (!isDisabled || isDisabled === "undefined")
    // );
    if (
      parseInt(count as string) >= 2 &&
      (!isDisabled || isDisabled === "undefined")
    ) {
      localStorage.setItem("isDisabled", "true");
      localStorage.setItem(
        "enableDate",
        now.setDate(now.getDate() + 1).toString()
      );
      console.log("DISABLED");
    }
    if (isDisabled === "true" && now.getTime() < enableDate.getTime()) {
      toast({
        title: "claim/unstake is disabled.",
        description: `try after ${timeDiff}.`,
        duration: 5000,
        status: "error",
        isClosable: true,
      });
      throw new Error("claim/unstake is disabled.");
    }
  }, [toast]);
  return {
    isDisabled,
    checkIsDisabled,
  };
};

export default useLimit;
