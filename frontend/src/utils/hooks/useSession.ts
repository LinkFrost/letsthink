import { useRouter } from "next/router";
import { AuthService } from "../services";
import type { Session } from "../types/types";
import useHttp from "./useHttp";
import { useState } from "react";

// const SHOULD_MOCK_AUTH = false;

// const mockSession: Session = {
//   user: {
//     id: "clb4aw5a9000008mk9tsf4qcu",
//     email: "test@test.com",
//     username: "test user",
//   },
// };

const useSession = () => {
  // const { data, loading, error } = useHttp<Session>(`${AuthService}/login`);
  // let sessionData;
  // // if (SHOULD_MOCK_AUTH) {
  // //   sessionData = { session: mockSession, loading: false, error: false };
  // // } else {
  // //   sessionData = { session: data, loading, error };
  // // }
  // const router = useRouter();
  // const signIn = async (email: string, password: string) => {
  //   await fetch(`${AuthService}/login`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application.json",
  //     },
  //     body: JSON.stringify({
  //       email: email,
  //       password: password,
  //     }),
  //   });
  //   router.push("/");
  // };
  // const signOut = () => {
  //   // signOutLogic()
  //   router.push("/login");
  // };
  // return { ...sessionData, signIn, signOut };
  const [token, setToken] = useState<string | null>("");

  const signIn = async (email: string, password: string) => {
    const res = await fetch(`${AuthService}/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setToken(res.headers.get("authorization"));
    }
  };

  const signOut = async () => {
    const res = await fetch(`${AuthService}/logout`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (data.success) {
      setToken(null);
    }
  };
};

export default useSession;
