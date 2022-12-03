import { useRouter } from "next/router";
import { RoomsService } from "../services";
import type { Session } from "../types/types";
import useHttp from "./useHttp";

const SHOULD_MOCK_AUTH = true;

const mockSession: Session = {
  user: {
    id: "clb4aw5a9000008mk9tsf4qcu",
    email: "test@test.com",
    username: "test user",
  },
};

const useSession = () => {
  const { data, loading, error } = useHttp<Session>(`${RoomsService}/session`);

  let sessionData;

  if (SHOULD_MOCK_AUTH) {
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
