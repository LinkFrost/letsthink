import Head from "next/head";
import { useRouter } from "next/router";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../utils/auth/auth";
import Spinner from "../../components/other/Spinner";
import { PollOptionType, PollOptionColor, SubmissionStatus, MessageType, RoomDataType } from "../../utils/types/types";
import { MessagesService, QueryService, VoteService } from "../../utils/services";
import Checkmark from "../../components/other/Checkmark";
import { pollOptionColors } from "../../utils/pollOptionColors";
import { HeartOutline, FilledHeart } from "../../components/other/Hearts";

function relativeTimeSince(date: string) {
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

const PollOption = (props: { id: string; title: string; votes: number; position: number; pollVote: string; votePoll: (id: string) => void }) => {
  const { color, hover, selected } = pollOptionColors[props.position];

  let bgColor;
  let hoverColor;

  if (!props.pollVote) {
    bgColor = color;
    hoverColor = hover;
  } else {
    bgColor = "bg-gray-300";
    hoverColor = "";
  }

  if (props.pollVote === props.id) bgColor = selected;

  return (
    <button
      onClick={() => props.votePoll(props.id)}
      disabled={props.pollVote !== ""}
      className={`mb-2 box-border w-full max-w-3xl rounded-2xl ${bgColor} ${hoverColor} p-4`}
    >
      <div className="box-border flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <h1 className="text-3xl font-semibold text-black">{props.title}</h1>
          {props.pollVote === props.id && <Checkmark></Checkmark>}
        </div>
        {props.pollVote && <h1 className="text-xl text-black">{props.votes} votes</h1>}
      </div>
    </button>
  );
};

const Message = (props: { id: string; content: string; create_date: string; votes: number; handleLike: (id: string) => void }) => {
  const liked = window.sessionStorage.getItem(props.id);

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border-[1px] border-neutral-700 bg-neutral-800 p-6 shadow-lg shadow-neutral-900">
      <p className="pb-6">{props.content}</p>
      <div className="flex items-center justify-between border-t-[1px] border-neutral-700 pt-6">
        <button
          disabled={Boolean(liked)}
          onClick={(e) => props.handleLike(props.id)}
          className={`flex items-center gap-2 rounded-lg p-2 ${!liked && "hover:bg-pink-300"} hover:bg-opacity-30`}
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

  useEffect(() => {
    const fetchRoom = async (id: string) => {
      if (id) {
        const res = await fetch(`${QueryService}/query/${id}`, {
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
        }
      }
    };

    fetchRoom(room_id);

    setInterval(() => {
      if (document.hasFocus()) {
        fetchRoom(room_id);
      }
    }, 2000);
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
    <div className="p-8">
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
            <div className="max-w-screen-md text-center">
              <h1 className="mb-3 break-normal text-6xl text-yellow-500">{roomData.title}</h1>
              <p className="mb-3 px-3 text-center text-lg text-white">{roomData.about}</p>
              <p className={"text-center text-xs text-red-500"}>{error.message}</p>
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
                  />
                ))}
              {roomData.room_type === "message" && (
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
                  />
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
