import { useEffect, useState, useContext } from "react";
import Head from "next/head";
import Suspend from "../components/utils/Suspend";
import { RoomsService } from "../utils/services";
import { AuthContext } from "../utils/auth/auth";
import Link from "next/link";

export default function Home() {
  const session = useContext(AuthContext);

  return (
    <div className="p-8">
      <Head>
        <title>letsthink</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col items-center justify-center">
        <div className="flex w-full max-w-2xl flex-col justify-center ">
          <div className="mb-5">
            <h1 className="mb-3 text-4xl text-white">
              Welcome to <span className="font-bold text-yellow-500">letsthink</span>
              {session.isAuth && `, ${(session.userData as any).username}`}
            </h1>
            <p className="text-lg text-white">
              Need to guage feedback from your audience? Create an anonymous message board or poll and watch the results in real time.
            </p>
          </div>

          {session.isAuth && (
            <Link className="mt-5 flex w-full  justify-center rounded-xl bg-yellow-400 p-2 text-2xl hover:bg-yellow-200" href="/rooms/create">
              Create Room
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
