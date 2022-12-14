import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import { AuthContext } from "../auth/auth";

const useProtectedPageSession = () => {
  const router = useRouter();
  const session = useContext(AuthContext);
  useEffect(() => {
    if (!session.loading && !session.isAuth) {
      // redirect to login
      router.push("/");
    }
  }, [session?.token, router, session?.loading]);

  return session;
};

export { useProtectedPageSession };
