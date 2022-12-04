import { useEffect, useState } from "react";

import Head from "next/head";
import Suspend from "../components/utils/Suspend";
import useSession from "../utils/hooks/useSession";
import useIsAuth from "../utils/hooks/useIsAuth";

export default function Home() {
  const { session, loading, error } = useIsAuth();

  return (
    <div className="p-10">
      <Head>
        <title>Lets Think</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Suspend loading={loading} errored={error}>
        <h1 className="text-4xl font-bold">Welcome {session?.user?.username}</h1>
      </Suspend>
    </div>
  );
}
