import { NextRouter, useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import useSession from "./useSession";

type ValidPages = "/login" | "/";

const useIsAuth = () => {
  // const { session, loading, error } = useSession();
  // // So our loading state makes sure the useEffect has run before we render anything
  // const [mounting, setMounting] = useState(true);
  // const router = useCallback(useRouter, [])();
  // useEffect(() => {
  //   if (!loading && !session) {
  //     router.replace("/login");
  //   } else {
  //     setMounting(false);
  //   }
  // }, [session, router, loading]);
  // return { session: session, loading: loading || mounting, error: error };
};

export default useIsAuth;
