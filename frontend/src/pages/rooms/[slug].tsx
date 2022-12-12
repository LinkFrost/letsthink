import Head from "next/head";
import { useRouter } from "next/router";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../utils/auth/auth";
import Spinner from "../../components/other/Spinner";
import { PollOptionType, PollOptionColor, SubmissionStatus, MessageType } from "../../utils/types/types";
import { VoteService } from "../../utils/services";
import Checkmark from "../../components/other/Checkmark";
import { pollOptionColors } from "../../utils/pollOptionColors";

export default function RoomPage() {
  const session = useContext(AuthContext);
  const router = useRouter();
  const room_id = router.query.slug;

  const [roomData, setRoomData] = useState<any>({});
  const [messages, setMessages] = useState<any>([]);
  const [pollOptions, setPollOptions] = useState<any>([]);
  const [roomLoading, setRoomLoading] = useState(false);
  const [pollVote, setPollVote] = useState<string>("");
  const [pollVoteStatus, pollVoteStatusStatus] = useState<SubmissionStatus>({ color: "", message: "", status: "" });

  useEffect(() => {
    setRoomLoading(true);
    // const room = {
    //   id: room_id,
    //   user_id: "fa74787c-352a-4956-8ef2-06513c651ecd",
    //   title: "My Room",
    //   about: "Just doing a quick little test poll",
    //   duration: 5,
    //   room_type: "poll",
    //   expired: false,
    //   poll_options: [
    //     {
    //       id: "05810ea1-2949-400c-b9a3-dc3667079ab2",
    //       title: "Option A",
    //       position: 1,
    //       votes: 3,
    //       room_id: "1678f74b-74d8-410c-8c91-4a029fad721f",
    //     },
    //     {
    //       id: "05810ea1-2949-400c-b9a3-dc3667079ab3",
    //       title: "Option B",
    //       position: 2,
    //       votes: 7,
    //       room_id: "1678f74b-74d8-410c-8c91-4a029fad721f",
    //     },
    //     {
    //       id: "05810ea1-2949-400c-b9a3-dc3667079ab4",
    //       title: "Option C",
    //       position: 3,
    //       votes: 17,
    //       room_id: "1678f74b-74d8-410c-8c91-4a029fad721f",
    //     },
    //     {
    //       id: "05810ea1-2949-400c-b9a3-dc3667079ab5",
    //       title: "Option D",
    //       position: 4,
    //       votes: 0,
    //       room_id: "1678f74b-74d8-410c-8c91-4a029fad721f",
    //     },
    //     {
    //       id: "05810ea1-2949-400c-b9a3-dc3667079ab6",
    //       title: "Option E",
    //       position: 5,
    //       votes: 9,
    //       room_id: "1678f74b-74d8-410c-8c91-4a029fad721f",
    //     },
    //   ],
    // };

    const room = {
      id: room_id,
      user_id: "fa74787c-352a-4956-8ef2-06513c651ecd",
      title: "My Room",
      about: "Just doing a quick little test poll",
      duration: 5,
      room_type: "message",
      expired: false,
      messages: [
        {
          id: "86a34c3e-3391-4e67-9025-0834de6a7a5f",
          content: "This is my comment about the room",
          room_id: room_id,
          votes: 6,
          create_date: "15",
        },
        {
          id: "86a34c3e-3391-4e67-9025-0834de6a7a5a",
          content: "This is also my comment about the room",
          room_id: room_id,
          votes: 3,
          create_date: "51",
        },
        {
          id: "86a34c3e-3391-4e67-9025-0834de6a7a5i",
          content: "lol",
          room_id: room_id,
          votes: 7,
          create_date: "26",
        },
        {
          id: "86a34c3e-3391-4e67-9025-0834de6a7a5d",
          content: "This is my comment about the room This is my comment about the room This is my comment about the room This is my comment about the room ",
          room_id: room_id,
          votes: 2,
          create_date: "11",
        },
      ],
    };
    setRoomData(room);
    // const d = new Date("2022-12-11 12:04:05.322899+00");
    // console.log(d.g - Date.now());

    // if (room.room_type == "poll") {
    //   setPollOptions(room.poll_options.sort((a, b) => a.position - b.position));

    //   if (window.sessionStorage.getItem(roomData.id)) {
    //     setPollVote(window.sessionStorage.getItem(roomData.id) as string);
    //   }
    // }

    if (room.room_type == "message") {
      setMessages(room.messages.sort((a, b) => parseInt(a.create_date) - parseInt(b.create_date)));

      // if (window.sessionStorage.getItem(roomData.id)) {
      //   setPollVote(window.sessionStorage.getItem(roomData.id) as string);
      // }
    }

    setRoomLoading(false);
  }, [room_id, roomData.id]);

  const votePoll = async (id: string) => {
    const res = await fetch(`${VoteService}/polls}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        room_id: roomData.id,
      }),
    });

    const data = await res.json();

    if (data.error) {
      pollVoteStatusStatus({ status: "error", color: "red", message: "Error voting, please try again later." });
    }

    if (res.ok) {
      const { votes } = data;
      let currPollOptions = [...pollOptions];

      currPollOptions = currPollOptions.map((cur) => (cur.id === id ? { ...cur, votes: votes } : cur));

      setPollOptions(currPollOptions);
      setPollVote(id);

      window.sessionStorage.setItem(roomData.id, id);
    }
  };

  const PollOption = (props: { id: string; title: string; votes: number; position: number }) => {
    const { color, hover, selected } = pollOptionColors[props.position];

    let bgColor;
    let hoverColor;

    if (!pollVote) {
      bgColor = color;
      hoverColor = hover;
    } else {
      bgColor = "bg-gray-300";
      hoverColor = "";
    }

    if (pollVote === props.id) bgColor = selected;

    return (
      <button
        onClick={() => votePoll(props.id)}
        disabled={pollVote !== ""}
        className={`mb-2 box-border w-full max-w-3xl rounded-2xl ${bgColor} ${hoverColor} p-4`}
      >
        <div className="box-border flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-2">
            <h1 className="text-3xl font-semibold text-black">{props.title}</h1>
            {pollVote === props.id && <Checkmark></Checkmark>}
          </div>
          {pollVote && <h1 className="text-xl text-black">{props.votes} votes</h1>}
        </div>
      </button>
    );
  };

  const Message = (props: { id: string; content: string; create_date: string }) => {
    return (
      <div>
        <h1>{props.content}</h1>
      </div>
    );
  };

  return (
    <div className="p-8">
      <Head>
        <title>{roomData.title} - letsthink</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col items-center justify-center">
        {roomLoading ? (
          <Spinner shade={900} size={6} />
        ) : (
          <div className="flex w-full max-w-2xl flex-col items-center justify-center text-white">
            <h1 className="mb-3 text-6xl text-yellow-500">{roomData.title}</h1>
            <h2 className="mb-3 text-3xl text-white">{roomData.about}</h2>
            <p className={"text-center text-xs text-red-500"}>{pollVoteStatus.message}</p>
            <div className="mt-5 w-full max-w-lg">
              {roomData.room_type == "poll" &&
                pollOptions.map((pollOption: PollOptionType) => (
                  <PollOption
                    key={pollOption.id}
                    id={pollOption.id}
                    title={pollOption.title}
                    votes={pollOption.votes}
                    position={pollOption.position}
                  ></PollOption>
                ))}
              {roomData.room_type == "message" &&
                messages.map((message: MessageType) => (
                  <Message key={message.id} id={message.id} content={message.content} create_date={message.create_date}></Message>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
