import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect, useMemo } from "react";
import Suspend from "../../components/utils/Suspend";
import { AuthContext } from "../../utils/auth/auth";
import useHttps from "../../utils/hooks/useHttp";
import { useProtectedPageSession } from "../../utils/hooks/useProtectedPageSession";
import { QueryService } from "../../utils/services";
import { relativeTimeSince } from "./[room_id]";

// CONSTANTS
const ROOM_DESCRIPTION_PREVIEW_SIZE = 75;

// TYPES
type Message = { votes: number; id: string; room_id: string; content: string };

type PollOptions = {
  id: string;
  title: string;
};

type RoomBase = {
  _id: string;
  expire_date: string;
  id: string;
  user_id: string;
  title: string;
  about: string;
  room_type: string;
  duration: number;
  create_date: string;
  expired: boolean;
};

type Room = RoomBase & ({ messages: Message[] } | { polls_options: PollOptions[] });

// HELPER FUNCTIONS
export function relativeTime(date: string) {
  const formatter = new Intl.RelativeTimeFormat("en");
  const diff = new Date(date).valueOf() - new Date().valueOf();

  const unitsGrow = () => {
    if (Math.floor(diff / (1000 * 60) / 60) > 24) {
      return formatter.format(Math.floor(diff / (1000 * 60 * 60 * 24)), "days");
    } else if (-Math.floor(diff / (1000 * 60)) > 60) {
      return formatter.format(Math.floor(diff / (1000 * 60) / 60), "hours");
    } else if (-Math.floor(diff / 1000) > 60) {
      return formatter.format(Math.floor(diff / (1000 * 60)), "minutes");
    } else {
      return formatter.format(Math.floor(diff / 1000), "seconds");
    }
  };

  return unitsGrow();
}

const sortData = (data: Room[]) => {
  // const getDiff = (exp_date: string) => new Date(exp_date).valueOf() - new Date().valueOf();
  // sort data by create_date, and then by create_date, newest rooms first
  return data.sort((a, b) => {
    const [adate, bdate] = [new Date(a.expire_date), new Date(b.expire_date)];

    if (a.expired !== b.expired) {
      return a.expired ? 1 : -1;
    }
    return bdate.valueOf() - adate.valueOf() > 1 ? 1 : -1;
  });
};

const condense = (msg: string) => {
  if (msg.length > ROOM_DESCRIPTION_PREVIEW_SIZE) {
    return msg.slice(0, ROOM_DESCRIPTION_PREVIEW_SIZE) + "...";
  }
  return msg;
};

// MISC COMPONENTS
const RoomCard = ({ room }: { room: Room }) => {
  const expiredFlagColor = room.expired ? "bg-red-500" : "bg-green-500";

  return (
    <Link href={`/rooms/${room.id}`}>
      <div className="flex h-full flex-col justify-start gap-1 rounded-xl border-[1px] border-neutral-700 bg-neutral-800 p-6 shadow-lg shadow-neutral-900 transition-colors duration-75 hover:bg-neutral-700">
        <div className="flex w-full items-start justify-between">
          <p className={`mb-1 text-sm capitalize`}>{room.room_type} Room</p>
          <p className={`text-sm ${expiredFlagColor} mb-1 rounded-lg px-2 py-[0.125rem] font-medium text-neutral-900`}>{room.expired ? "expired" : "active"}</p>
        </div>
        <p className="text-xl font-bold">{room.title}</p>
        {room.expired && <p className="pb-2 text-xs font-medium text-neutral-400">{`Ended ${relativeTime(room.expire_date)}`}</p>}
        <p className="text-base text-neutral-400">{condense(room.about)}</p>
      </div>
    </Link>
  );
};

const NoRoomsFound = () => (
  <p>
    {"You don't have any rooms yet."}{" "}
    <Link className="hover:underline" href="/rooms/create">
      Create one here
    </Link>
  </p>
);

const MyRoomsList = ({ data }: { data: Room[] }) => {
  return (
    <div className="grid w-full max-w-screen-xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((room: Room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  );
};

// PAGE
export default function Me() {
  // Get Session
  const session = useProtectedPageSession();

  // Fetch Server State
  const url = `${QueryService}/query/rooms/user/${session.userData?.id}`;
  const options = useMemo<RequestInit>(
    () => ({
      method: "GET",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        authorization: session.token,
      },
    }),
    [session.token]
  );
  const { data, loading, error } = useHttps<Room[]>(url, options);

  return (
    <>
      <Suspend loading={loading || session.loading} errored={!session || error}>
        <div className="flex w-full flex-col items-center justify-center gap-6 pt-4 text-white">
          <h1 className="mb-3 text-4xl text-white">
            Welcome, <span className="font-bold text-yellow-500">{session.userData?.username}</span>. Here are your rooms:
          </h1>
          {data?.length ? <MyRoomsList data={sortData(data)} /> : <NoRoomsFound />}
        </div>
      </Suspend>
    </>
  );
}
