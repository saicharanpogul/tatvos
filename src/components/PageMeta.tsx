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
        <title>{title ? `${title} | Tatvos` : "Tatvos"}</title>
        <meta
          name="description"
          content={description ? description : "List of all your social links."}
        />
        <meta property="og:image" content={ogImage} />
        <link rel="icon" href="/tatvos.png" />
      </Head>
    </>
  );
};

export default PageMeta;
