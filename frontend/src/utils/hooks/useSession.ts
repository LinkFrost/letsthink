import { useRouter } from "next/router";
import { AuthService } from "../services";
import type { Session } from "../types/types";
import useHttp from "./useHttp";
import { useEffect, useState } from "react";

// const SHOULD_MOCK_AUTH = false;

// const mockSession: Session = {
//   user: {
//     id: "clb4aw5a9000008mk9tsf4qcu",
//     email: "test@test.com",
//     username: "test user",
//   },
// };

const useSession = () => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>("");
  const { data, loading, error } = useHttp<Session>(`${AuthService}/refresh`);
  console.log(data);

  let sessionData;
  sessionData = { token: data, loading, error };

  // return { signIn, signOut };
};

export const signIn = async (email: string, password: string) => {
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
    console.log("success");
    // router.replace("/");
    // window.location.pathname = "/";
    // setToken(res.headers.get("authorization"));
  }
};

export const signOut = async () => {
  const res = await fetch(`${AuthService}/logout`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  if (data.success) {
    // setToken(null);
    window.location.pathname = "/login";
  }
};

export default useSession;
