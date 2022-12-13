import { AuthService } from "../services";
import { createContext, useEffect, useState } from "react";
import { User } from "../types/types";
import jwt, { JwtPayload } from "jsonwebtoken";

type Context = {
  token: string;
  isAuth: boolean;
  userData: User | null;
  loading: boolean;
};

export const AuthContext = createContext<Context>({
  token: "",
  isAuth: false,
  userData: null,
  loading: true,
});

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
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string>("");
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setLoading(true);
    const refreshToken = async () => {
      const res = await fetch(`${AuthService}/auth/refresh/`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        const authToken = res.headers.get("Authorization");

        if (!authToken) return;

        let tokenUserData = jwt.decode(authToken.split(" ")[1], { complete: true })?.payload as JwtPayload;

        if (!tokenUserData) return;

        const userData = {
          id: tokenUserData.id,
          email: tokenUserData.email,
          username: tokenUserData.username,
        };

        setUser(userData);
        setIsAuth(true);
        setToken(authToken);
        setLoading(false);
      } else {
        setToken("");
        setIsAuth(false);
        setLoading(false);
        setUser(null);
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

  return { token: token, isAuth: isAuth, userData: user, loading: loading };
};

export { useSession, login, logout };
