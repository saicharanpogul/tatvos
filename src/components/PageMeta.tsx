import Head from "next/head";
import React from "react";

interface Props {
  title?: string;
  description?: string;
  ogImage?: string;
}

const PageMeta: React.FC<Props> = ({ title, description, ogImage }) => {
  return (
    <>
      <Head>
        <title>{title ? `${title} | tatvos` : "tatvos"}</title>
        <meta
          name="description"
          content={
            description
              ? description
              : "Mint your Tatvos. Stake it. Earn $TOS & Mint compounds using minted tatvos."
          }
        />
        <meta
          property="og:image"
          content={
            ogImage ? ogImage : "https://tatvos.saicharanpogul.xyz/ogImage.png"
          }
        />
        <link rel="icon" href="/tatvos.png" />
      </Head>
    </>
  );
};

export default PageMeta;
