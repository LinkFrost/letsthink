import { AuthService } from "../services";
import { createContext, useEffect, useState } from "react";
import { User } from "../types/types";
import jwt, { JwtPayload } from "jsonwebtoken";

export const AuthContext = createContext({ token: "", isAuth: false, userData: {}, resetContext: () => {} });

const login = async (email: string, password: string) => {
  const res = await fetch(`${AuthService}/auth/login`, {
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
    window.location.href = "/";
  }
};

const logout = async () => {
  const res = await fetch(`${AuthService}/auth/logout`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  if (data.success) {
    window.location.href = "/";
  }
};

const useSession = () => {
  const [token, setToken] = useState<string>("");
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [user, setUser] = useState<User | {}>({});

  const resetContext = () => {
    setToken("");
    setIsAuth(false);
    setUser({});
  };

  useEffect(() => {
    const refreshToken = async () => {
      const res = await fetch(`${AuthService}/auth/refresh/`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        const authToken = res.headers.get("Authorization");

        if (authToken !== null) {
          const tokenUserData = jwt.decode(authToken.split(" ")[1], { complete: true })?.payload as JwtPayload;

          if (tokenUserData) {
            const userData = {
              id: tokenUserData.id,
              email: tokenUserData.email,
              username: tokenUserData.username,
            };

            setUser(userData);
            setIsAuth(true);
            setToken(authToken);
          }
        }
      } else {
        setToken("");
        setIsAuth(false);
        setUser({});
      }
    };

    refreshToken();

    if (isAuth) {
      const interval = setInterval(async () => {
        await refreshToken();
      }, 1296000000);

      return () => clearInterval(interval);
    }
  }, [isAuth]);

  return { token: token, isAuth: isAuth, userData: user, resetContext: resetContext };
};

export { useSession, login, logout };
