import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect, useMemo } from "react";
import Suspend from "../../components/utils/Suspend";
import { AuthContext } from "../../utils/auth/auth";
import useHttps from "../../utils/hooks/useHttp";
import { useProtectedPageSession } from "../../utils/hooks/useProtectedPageSession";
import { QueryService } from "../../utils/services";
import { relativeTimeSince } from "./[room_id]";

type Message = { votes: number; id: string; room_id: string; content: string };

export interface PollOptions {
  id: string;
  title: string;
}

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

export function relativeTime(date: string, expired: boolean) {
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

  const unitsShrink = () => {
    if (Math.floor(diff / (1000 * 60)) < 1) {
      return formatter.format(Math.floor(diff / 1000), "seconds");
    } else if (Math.floor(diff / (1000 * 60)) < 60) {
      return formatter.format(Math.floor(diff / (1000 * 60)), "minutes");
    } else if (Math.floor(diff / (1000 * 60 * 60)) < 24) {
      return formatter.format(Math.floor(diff / (1000 * 60 * 60)), "hours");
    } else {
      return formatter.format(Math.floor(diff / (1000 * 60 * 60 * 24)), "days");
    }
  };

  return expired ? unitsGrow() : unitsShrink();
}

const sortData = (data: Room[]) => {
  const getDiff = (exp_date: string) => new Date(exp_date).valueOf() - new Date().valueOf();
  // sort data by create_date, and then by create_date, newest rooms first
  return data.sort((a, b) => {
    if (a.expired !== b.expired) {
      return a.expired ? 1 : -1;
    } else {
      if (a.expired) {
        if (a.create_date > b.create_date) {
          return -1;
        } else if (a.create_date < b.create_date) {
          return 1;
        } else {
          return 0;
        }
      } else {
        if (getDiff(a.create_date) < getDiff(b.create_date)) {
          return -1;
        } else if (getDiff(a.create_date) > getDiff(b.create_date)) {
          return 1;
        } else {
          return 0;
        }
      }
    }
  });
};

const condense = (msg: string) => {
  const SIZE = 140;
  if (msg.length > SIZE) {
    return msg.slice(0, SIZE) + "...";
  }
  return msg;
};

type Room = RoomBase & ({ messages: Message[] } | { polls_options: PollOptions[] });

const RoomCard = ({ room }: { room: Room }) => {
  // add ... to 10th char if greater than lenght 10
  // UPDATE ONCE WE ADD CAPS
  const expiredFlagColor = room.expired ? "bg-red-500" : "bg-green-500";
  // ADD LINK BUTTON WITH ICON LATER

  const created = new Date(room.create_date);
  const expire = new Date(room.expire_date);
  const diff = new Date(expire.getTime() - created.getTime()).getTime();

  const date_prefix = room.expired ? "Ended" : "Ending";
  return (
    <Link href={`/rooms/${room.id}`}>
      <div className="flex h-full flex-col justify-start gap-1 rounded-xl border-[1px] border-neutral-700 bg-neutral-800 p-6 shadow-lg shadow-neutral-900 transition-colors duration-75 hover:bg-neutral-700">
        <div className="flex w-full items-start justify-between">
          <p className={`mb-1 text-sm capitalize`}>{room.room_type} Room</p>
          <p className={`text-sm ${expiredFlagColor} mb-1 rounded-lg px-2 py-[0.125rem] font-medium text-neutral-900`}>{room.expired ? "expired" : "active"}</p>
        </div>
        <p className="text-xl font-bold">{room.title}</p>
        <p className="pb-2 text-xs font-medium text-neutral-400">{`${date_prefix} ${relativeTime(room.expire_date, room.expired)}`}</p>
        <p className="text-base text-neutral-400">{condense(room.about)}</p>
        {/* <div className="flex items-center justify-between  border-neutral-700 pt-6"></div> */}
      </div>
    </Link>
  );
};

export default function Me() {
  // redirects if not logged in
  // Get Session
  const session = useProtectedPageSession();

  // Fetch Data
  // /query/rooms/user/:user_id
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
          {data?.length ? (
            <div className="grid w-full max-w-screen-xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sortData(data ?? []).map((room: Room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          ) : (
            <p>
              {"You don't have any rooms yet."}{" "}
              <Link className="hover:underline" href="/rooms/create">
                Create one here
              </Link>
              .
            </p>
          )}
        </div>
      </Suspend>
    </>
  );
}
