import type { AppProps } from "next/app";
import MainLayout from "../components/layouts/MainLayout";
import React, { createContext, useContext } from "react";
import useSession from "../utils/hooks/useSession";

import "../styles/globals.tailwind.css";

export const AuthContext = createContext({});

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const auth = useSession();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthWrapper>
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    </AuthWrapper>
  );
}
