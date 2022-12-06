import { AuthService } from "../services";
import useHttp from "./useHttp";
import { useEffect, useState } from "react";

const useSession = () => {
  const [token, setToken] = useState<string>("");
  const [isAuth, setIsAuth] = useState<boolean>(false);

  useEffect(() => {
    const refreshToken = async () => {
      const res = await fetch(`${AuthService}/refresh/`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        const authToken = res.headers.get("Authorization");

        if (authToken !== null) {
          setIsAuth(true);
          setToken(authToken);
        }
      } else {
        setToken("");
        setIsAuth(false);
      }
    };

    refreshToken();

    if (isAuth) {
      setInterval(async () => {
        await refreshToken();
        console.log("Refreshed auth token");
      }, 15000);
    }

    // return () => clearInterval(refresh);
  }, [isAuth]);

  return { token: token, isAuth: isAuth };
};

export default useSession;
