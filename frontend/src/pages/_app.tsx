import type { AppProps } from "next/app";
import MainLayout from "../components/layouts/MainLayout";
import React, { createContext, useContext } from "react";

import "../styles/globals.tailwind.css";
import { AuthProvider } from "../utils/auth/Provider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    </AuthProvider>
  );
}
