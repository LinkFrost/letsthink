import type { AppProps } from "next/app";
import MainLayout from "../components/layouts/MainLayout";

import "../styles/globals.tailwind.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MainLayout>
      <Component {...pageProps} />
    </MainLayout>
  );
}
