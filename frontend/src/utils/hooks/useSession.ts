import { useRouter } from "next/router";
import { QueryService } from "../services";
import type { Session } from "../types/types";
import useHttp from "./useHttp";

const mockSession: Session = {
  session: {
    user: {
      id: "clb4aw5a9000008mk9tsf4qcu",
      username: "test user",
    },
  },
};

const useSession = () => {
  const { data, loading, error } = useHttp<Session>(`${QueryService}/session`);

  let sessionData;
  if (process?.env?.NEXT_PUBLIC_USE_MOCK_AUTH === "dev") {
    sessionData = { session: mockSession, loading: false, error: false };
  } else {
    sessionData = { session: data, loading, error };
  }

  const router = useRouter();

  const signIn = () => {
    // signInLogic()
    router.push("/");
  };

  const signOut = () => {
    // signOutLogic()
    router.push("/login");
  };

  return { ...sessionData, signIn, signOut };
};

export default useSession;
