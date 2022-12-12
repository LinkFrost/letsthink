import Head from "next/head";
import { ChangeEvent, FormEvent, useContext, useRef, useState } from "react";
import { AuthContext } from "../../utils/auth/auth";
import Spinner from "../../components/other/Spinner";
import { SubmissionStatus } from "../../utils/types/types";
import { PollsService, RoomsService } from "../../utils/services";
import Router from "next/router";

type FormFields = "title" | "about" | "type" | "duration" | "poll_options";
type FormType = Record<FormFields, string | number>;

const defaultForm: FormType = {
  title: "",
  about: "",
  type: "",
  duration: "",
  poll_options: "",
};

export default function Create() {
  const session = useContext(AuthContext);

  const title = useRef() as React.MutableRefObject<HTMLInputElement>;
  const [about, setAbout] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [duration, setDuration] = useState<number>(0);
  const [pollOptions, setPollOptions] = useState<{ title: string }[]>([{ title: "" }, { title: "" }]);

  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>({ color: "", message: "", status: "" });
  const [formErrors, setFormErrors] = useState({ ...defaultForm });
  const [createLoading, setCreateLoading] = useState(false);

  const validateForm = () => {
    const errors = { ...defaultForm };

    if (!title.current.value) {
      errors["title"] = "Need to set room title!";
    }

    if (!about) {
      errors["about"] = "Need to set about information!";
    }

    if (!type) {
      errors["about"] = "Need to select a room type!";
    }

    if (!duration) {
      errors["duration"] = "Need to enter a duration!";
    }

    if (type === "poll") {
      for (const pollOption of pollOptions) {
        if (!pollOption.title) {
          errors["poll_options"] = "Poll options cannot be blank!";
          break;
        }
      }
    }

    if (JSON.stringify(errors) !== JSON.stringify(defaultForm)) return errors;
  };

  const newPollOption = () => {
    setPollOptions([...pollOptions, { title: "" }]);
  };

  const removePollOption = (index: number) => {
    const options = [...pollOptions];
    options.splice(index, 1);
    setPollOptions(options);
  };

  const changePollOption = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const options = [...pollOptions];
    options[index].title = e.target.value;
    setPollOptions(options);
  };

  const createRoom = async (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const errors = validateForm();

    if (errors) {
      setFormErrors({ ...defaultForm, ...errors });
      return;
    }

    const room = {
      user_id: (session.userData as any).id,
      title: title.current.value,
      about: about,
      room_type: type,
      duration: duration,
    };

    setCreateLoading(true);
    const roomRes = await fetch(`${RoomsService}/rooms`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: session.token,
      },
      body: JSON.stringify(room),
    });

    const roomResData = await roomRes.json();

    if (roomResData.error) {
      setSubmissionStatus({ status: "error", color: "red", message: "Error creating room, please try again later." });
      setCreateLoading(false);
    }

    if (roomRes.ok) {
      const room_id = roomResData.id;

      if (type === "poll") {
        const poll = {
          room_id: room_id,
          poll_options: pollOptions.map((pollOption, index) => {
            return { ...pollOption, position: index + 1 };
          }),
        };

        const pollRes = await fetch(`${PollsService}/polls`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: session.token,
          },
          body: JSON.stringify(poll),
        });

        const pollResData = await pollRes.json();

        if (pollResData.error) {
          setSubmissionStatus({ status: "error", color: "red", message: "Error creating room, please try again later." });
          setCreateLoading(false);
        }

        if (pollResData.success) {
          setTimeout(() => {
            setCreateLoading(false);
            // window.location.href = `/rooms/${room_id}`;
            Router.push(`/rooms/${room_id}`);
          }, 2500);
        }
      } else {
        setTimeout(() => {
          setCreateLoading(false);
          // window.location.href = `/rooms/${room_id}`;
          Router.push(`/rooms/${room_id}`);
        }, 2500);
      }
    }
  };

  return (
    <div className="p-8">
      <Head>
        <title>Create Room - letsthink</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col items-center justify-center">
        <div className="flex  max-w-2xl flex-col justify-center text-white">
          <h1 className="mb-3 text-4xl text-yellow-500">Create Room</h1>

          <form className="flex flex-col items-start gap-1" autoComplete="off">
            <label htmlFor="title">
              <p className="text-lg">Title:</p>
            </label>
            <input id="name" className="rounded-md px-2 py-[0.125rem] text-black" ref={title} type="text" placeholder="Name of the room"></input>
            <p className="text-xs text-red-400">{formErrors.title}</p>

            <label htmlFor="about">
              <p className="text-lg ">About:</p>
            </label>
            <textarea
              onChange={(e) => setAbout(e.target.value)}
              id="about"
              rows={4}
              className="w-96 rounded-md px-2 py-[0.125rem] text-black"
              placeholder="What the room is all about"
              value={about}
            ></textarea>
            <p className="text-xs text-red-400">{formErrors.about}</p>

            <label htmlFor="duration">
              <p className="text-lg">Duration (min):</p>
            </label>
            <input
              onChange={(e) => setDuration(parseInt(e.target.value))}
              id="duration"
              className="w-16 rounded-md px-2 py-[0.125rem] text-black"
              value={duration}
              type="number"
            ></input>
            <p className="text-xs text-red-400">{formErrors.duration}</p>

            <div className="flex items-center gap-2">
              <label>
                <p className="text-lg ">Type:</p>
              </label>
              <div className="flex gap-4">
                <div className="flex gap-2">
                  <input onChange={(e) => setType(e.target.value)} type="radio" id="messages" name="type" value="message"></input>
                  <label htmlFor="messages">
                    <p className="text-md">Messages</p>
                  </label>
                </div>
                <div className="flex gap-2">
                  <input onChange={(e) => setType(e.target.value)} type="radio" id="polls" name="type" value="poll"></input>
                  <label htmlFor="polls">
                    <p className="text-md">Poll</p>
                  </label>
                </div>
              </div>
              <p className="text-xs text-red-400">{formErrors.type}</p>
            </div>

            {type == "poll" && (
              <div className="mt-5 flex flex-col gap-2">
                {pollOptions.map((pollOption, index) => {
                  const placeholder = `Option ${index + 1}`;

                  return (
                    <div key={index}>
                      <div className="flex gap-2">
                        <input
                          onChange={(e) => changePollOption(e, index)}
                          id="index"
                          className="w-40 rounded-md px-2 py-[0.125rem] text-black"
                          type="text"
                          placeholder={placeholder}
                          value={pollOption.title}
                        ></input>
                        {index > 1 && (
                          <button
                            onClick={() => removePollOption(index)}
                            className="flex justify-center rounded-full bg-red-400 px-4 font-bold text-white hover:bg-red-300"
                            type="button"
                          >
                            -
                          </button>
                        )}
                      </div>
                      {pollOptions.length < 10 && index == pollOptions.length - 1 && (
                        <div className="mt-2">
                          <button onClick={newPollOption} className="flex rounded-full bg-blue-400 px-4 font-bold text-white hover:bg-blue-300">
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                <p className="text-xs text-red-400">{formErrors.poll_options}</p>
              </div>
            )}
          </form>

          <button
            disabled={createLoading}
            onClick={(e) => createRoom(e)}
            className="w-30 mt-5 flex justify-center rounded-xl bg-yellow-400 p-2 text-lg text-black hover:bg-yellow-200"
          >
            {createLoading ? <Spinner shade={900} size={6} /> : "Create"}
          </button>
          <p className={"text-center text-xs text-red-500"}>{submissionStatus.message}</p>
        </div>
      </main>
    </div>
  );
}
