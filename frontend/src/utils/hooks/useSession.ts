import { useRouter } from "next/router";
import { AuthService } from "../services";
import type { Session } from "../types/types";
import useHttp from "./useHttp";
import { useEffect, useState } from "react";

const useSession = () => {
  const [token, setToken] = useState<string | null>("");
  const [isAuth, setIsAuth] = useState<boolean>(false);

  useEffect(() => {
    const getRefresh = async () => {
      const res = await fetch(`${AuthService}/refresh`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setToken(res.headers.get("Authorization"));
        setIsAuth(true);
      }
    };

    getRefresh();
  }, []);

  const sessionData = { token: token, isAuth: isAuth };

  return { sessionData };
};

export default useSession;
