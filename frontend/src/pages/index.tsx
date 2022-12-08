import { useEffect, useState, useContext } from "react";
import Head from "next/head";
import Suspend from "../components/utils/Suspend";
import { RoomsService } from "../utils/services";
import { AuthContext } from "../utils/auth/auth";

export default function Home() {
  const session = useContext(AuthContext);

  const handleRoomSubmit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    const res = await fetch(`${RoomsService}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": "true",
        Authorization: session.token,
      },
      credentials: "include",
      body: JSON.stringify({
        user_id: (session.userData as any).id,
        title: "HIIIIIII",
        about: "This is my room",
        duration: 15,
        room_type: "poll",
        expired: false,
      }),
    });
  };

  return (
    <div className="p-10">
      <Head>
        <title>Lets Think</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {session.isAuth && (
        <div>
          <p className="text-3xl text-white">Hi, {(session.userData as any).username}</p>
          <button onClick={(e) => handleRoomSubmit(e)} className="mt-5 rounded-xl bg-white p-2 hover:bg-gray-300">
            Create Room
          </button>
        </div>
      )}
    </div>
  );
}
