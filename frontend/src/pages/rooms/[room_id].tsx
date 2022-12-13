import Head from "next/head";
import { useRouter } from "next/router";
import { useContext, useState, useEffect, useRef, useMemo } from "react";
import { AuthContext } from "../../utils/auth/auth";
import Spinner from "../../components/other/Spinner";
import { PollOptionType, PollOptionColor, SubmissionStatus, MessageType, RoomDataType } from "../../utils/types/types";
import { MessagesService, QueryService, VoteService } from "../../utils/services";
import Checkmark from "../../components/other/Checkmark";
import { pollOptionColors } from "../../utils/pollOptionColors";
import { HeartOutline, FilledHeart } from "../../components/other/Hearts";

export function relativeTimeSince(date: string) {
  const formatter = new Intl.RelativeTimeFormat("en");
  const diff = new Date().valueOf() - new Date(date).valueOf();

  if (Math.floor(diff / (1000 * 60) / 60) > 24) {
    return formatter.format(-Math.floor(diff / (1000 * 60 * 60 * 24)), "days");
  } else if (Math.floor(diff / (1000 * 60)) > 60) {
    return formatter.format(-Math.floor(diff / (1000 * 60) / 60), "hours");
  } else if (Math.floor(diff / 1000) > 60) {
    return formatter.format(-Math.floor(diff / (1000 * 60)), "minutes");
  } else {
    return formatter.format(-Math.floor(diff / 1000), "seconds");
  }
}

const PollOption = (props: {
  id: string;
  title: string;
  votes: number;
  position: number;
  pollVote: string;
  votePoll: (id: string) => void;
  roomExpired: boolean;
}) => {
  let { color, hover, selected } = pollOptionColors[props.position];

  if (props.roomExpired) {
    hover = "";
  }

  let bgColor;
  let hoverColor;

  if (!props.pollVote || props.roomExpired) {
    bgColor = color;
    hoverColor = hover;
  } else {
    bgColor = "bg-gray-300";
    hoverColor = "";
  }

  if (props.pollVote === props.id && !props.roomExpired) bgColor = selected;

  return (
    <button
      onClick={() => props.votePoll(props.id)}
      disabled={props.roomExpired || props.pollVote !== ""}
      className={`mb-2 box-border w-full max-w-3xl rounded-2xl ${bgColor} ${hoverColor} p-4`}
    >
      <div className="box-border flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <h1 className="text-2xl font-semibold text-black">{props.title}</h1>
          {props.pollVote === props.id && !props.roomExpired && <Checkmark></Checkmark>}
        </div>
        {(props.pollVote || props.roomExpired) && <h1 className="text-xl text-black">{props.votes} votes</h1>}
      </div>
    </button>
  );
};

const Message = (props: { id: string; content: string; create_date: string; votes: number; handleLike: (id: string) => void; roomExpired: boolean }) => {
  const liked = window.sessionStorage.getItem(props.id);

  return (
    <div className="flex flex-col justify-between rounded-xl border-[1px] border-neutral-700 bg-neutral-800 p-6 shadow-lg shadow-neutral-900">
      <p className="pb-6">{props.content}</p>
      <div className="flex items-center justify-between border-t-[1px] border-neutral-700 pt-6">
        <button
          disabled={Boolean(liked) || props.roomExpired}
          onClick={(e) => props.handleLike(props.id)}
          className={`flex items-center gap-2 rounded-lg p-2 ${!liked && !props.roomExpired && "hover:bg-pink-300"} hover:bg-opacity-30`}
        >
          {liked ? <FilledHeart /> : <HeartOutline />}
          <span className="text-neutral-400">{props.votes}</span>
        </button>
        <span className="text-neutral-400">{relativeTimeSince(props.create_date)}</span>
      </div>
    </div>
  );
};

export default function RoomPage() {
  const session = useContext(AuthContext);
  const router = useRouter();
  const room_id = router.query.room_id as string;

  const [error, setError] = useState<SubmissionStatus>({ color: "", message: "", status: "" });
  const [roomData, setRoomData] = useState<RoomDataType>();
  const [pollOptions, setPollOptions] = useState<PollOptionType[]>([]);
  const [pollVote, setPollVote] = useState<string>("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const isExpired = useMemo(() => roomData?.expired ?? false, [roomData?.expired]);
  const interval = useRef<NodeJS.Timer>();

  useEffect(() => {
    if (isExpired) {
      clearInterval(interval.current);
    }
  }, [isExpired]);

  useEffect(() => {
    (async () => {
      const fetchRoom = async (id: string) => {
        if (id) {
          const res = await fetch(`${QueryService}/query/rooms/${id}`, {
            method: "GET",
            credentials: "include",
          });
          const data = (await res.json()) as RoomDataType;

          if (res.ok) {
            setRoomData(data);

            if (data.poll_options) {
              setPollOptions(data.poll_options.sort((a, b) => a.position - b.position));

              if (window.sessionStorage.getItem(data.id)) {
                setPollVote(window.sessionStorage.getItem(data.id) as string);
              }
            }

            if (data.messages) {
              setMessages(data.messages.reverse());
            }

            return data;
          }
        }
      };

      const firstFetch = await fetchRoom(room_id);

      if (!firstFetch?.expired) {
        interval.current = setInterval(async () => {
          if (document.hasFocus()) {
            fetchRoom(room_id);
          }
        }, 2000);
      }
    })();

    return () => clearInterval(interval.current);
  }, [room_id]);

  const votePoll = async (id: string) => {
    const res = await fetch(`${VoteService}/polls`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        option_id: id,
        room_id: room_id,
      }),
    });

    const data = await res.json();

    if (data.error) {
      setError({ status: "error", color: "red", message: "Error voting, please try again." });
    }

    if (res.ok) {
      const { votes } = data;
      let currPollOptions = [...pollOptions];

      currPollOptions = currPollOptions.map((cur) => (cur.id === id ? { ...cur, votes: votes } : cur));

      setPollOptions(currPollOptions);
      setPollVote(id);

      window.sessionStorage.setItem(room_id, id);
    }
  };

  const createMessage = async () => {
    setMessageLoading(true);

    const res = await fetch(`${MessagesService}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: messageContent,
        room_id: room_id,
      }),
    });

    const data = await res.json();

    if (data.error) {
      setError({ status: "error", color: "red", message: "Error posting message, please try again." });
    }

    if (res.ok) {
      setMessages([{ ...data, votes: 0 }, ...messages]);
    }
    setMessageLoading(false);
    setMessageContent("");
  };

  const handleLike = async (id: string) => {
    const res = await fetch(`${VoteService}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message_id: id,
        room_id: room_id,
      }),
    });

    const data = await res.json();

    if (data.error) {
      setError({ status: "error", color: "red", message: "Error posting message, please try again." });
    }

    if (res.ok) {
      const newMessages = messages.map((cur) => (cur.id === id ? { ...cur, votes: data.votes } : cur));
      setMessages(newMessages);
      window.sessionStorage.setItem(id, "1");
    }
  };

  return (
    <>
      <Head>
        <title>letsthink</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col items-center justify-center">
        {!roomData ? (
          <Spinner shade={900} size={6} />
        ) : (
          <div className="flex w-full flex-col items-center justify-center text-white">
            <div className="mb-10 flex max-w-screen-md flex-col items-center gap-10 text-center">
              <h1 className="text-5xl text-yellow-400">{roomData.title}</h1>
              <p>{roomData.about}</p>
              {error.status === "error" && <p className="px-3 text-red-500">{error.message}</p>}
              {isExpired && (
                <p className="text-white-400 rounded-lg bg-red-400 px-4 py-1 text-center text-neutral-800">
                  This room is expired but you can still view the results
                </p>
              )}
            </div>
            <div className="mt-5 w-full max-w-lg">
              {roomData.room_type === "poll" &&
                pollOptions.map((pollOption: PollOptionType) => (
                  <PollOption
                    pollVote={pollVote}
                    votePoll={votePoll}
                    key={pollOption.id}
                    id={pollOption.id}
                    title={pollOption.title}
                    votes={pollOption.votes}
                    position={pollOption.position}
                    roomExpired={roomData.expired}
                  />
                ))}
              {!isExpired && roomData.room_type === "message" && (
                <div className="flex flex-col items-center justify-center">
                  <textarea
                    className="mt-3 block w-full rounded-lg p-2 text-black"
                    placeholder="Enter your message here"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                  />
                  <button
                    disabled={messageLoading || !messageContent.length}
                    onClick={createMessage}
                    className="w-30 mt-5 mb-12 flex w-full justify-center rounded-xl bg-yellow-400 p-2 text-lg text-black hover:bg-yellow-200 disabled:bg-neutral-400"
                  >
                    {messageLoading ? <Spinner shade={900} size={6} /> : "Post Message"}
                  </button>
                </div>
              )}
            </div>
            <div className="grid w-full max-w-screen-xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {roomData.room_type === "message" &&
                messages.map((message: MessageType) => (
                  <Message
                    handleLike={handleLike}
                    key={message.id}
                    id={message.id}
                    content={message.content}
                    create_date={message.create_date}
                    votes={message.votes}
                    roomExpired={roomData.expired}
                  />
                ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
