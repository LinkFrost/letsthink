/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Inter } from "@next/font/google";
import { useContext } from "react";
import { NextRouter, useRouter } from "next/router";
import { AuthContext, logout } from "../../utils/auth/auth";
import LogoutSVG from "../other/LogoutSVG";
import Image from "next/image";

const inter = Inter();

const Header = (props: { router: NextRouter }) => {
  const session = useContext(AuthContext);

  return (
    <header className="border-b-2 border-neutral-700 bg-black p-2 px-4">
      <div className="mx-auto flex max-w-screen-lg items-center justify-between">
        <Link href="/">
          <div className="flex items-center justify-center gap-1">
            <Image alt="logo" src="/favicon.ico" height="50" width="50" />
            <span className="text-2xl font-bold text-yellow-500">letsthink</span>
          </div>
        </Link>
        {!session.isAuth ? (
          <Link className="text-white hover:underline" href="login">
            Login
          </Link>
        ) : (
          <div className="flex gap-4">
            <Link className="text-white hover:underline" href="/rooms/me">
              My Rooms
            </Link>
            <button className="flex items-center justify-center gap-2 text-white hover:underline " onClick={logout}>
              Logout
              <LogoutSVG />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

type FooterLinkPropTypes = {
  children: React.ReactNode;
  href: string;
  target?: string;
};

const FooterLink = ({ href, children, target = "" }: FooterLinkPropTypes) => {
  return (
    <li className="py-2">
      <Link target={target} href={href} className="text-sm transition duration-75 ease-out hover:text-neutral-50 hover:underline">
        {children}
      </Link>
    </li>
  );
};

const Footer = () => {
  return (
    <footer className="mt-auto bg-black pb-2">
      <hr className="border-[1px] border-neutral-700"></hr>
      <div className="item mx-auto grid max-w-screen-md grid-cols-3 justify-center gap-2 py-1 px-6 text-neutral-500 sm:grid-cols-3">
        <div>
          <h2 className="my-3 text-lg text-neutral-50">Navigation</h2>
          <ul>
            <FooterLink href="/">Home</FooterLink>
            <FooterLink href="/rooms/me">My Rooms</FooterLink>
            <FooterLink href="/rooms/create">Create Room</FooterLink>
          </ul>
        </div>
        <div>
          <h2 className="my-3 text-lg text-neutral-50">Project</h2>
          <ul>
            <FooterLink href="/about">About</FooterLink>
            <FooterLink target="_blank" href="">
              GitHub
            </FooterLink>
          </ul>
        </div>
        <div>
          <h2 className="my-3 text-lg text-neutral-50">Team</h2>
          <ul>
            <FooterLink target="_blank" href="https://github.com/joepetrillo">
              Joseph Petrillo
            </FooterLink>
            <FooterLink target="_blank" href="https://github.com/LinkFrost">
              Ashir Imran
            </FooterLink>
            <FooterLink target="_blank" href="https://github.com/jackbisceglia">
              Jack Bisceglia
            </FooterLink>
            <FooterLink target="_blank" href="https://github.com/sid2023">
              Siddarth Raju
            </FooterLink>
          </ul>
        </div>
      </div>
    </footer>
  );
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  return (
    <div className={`flex min-h-screen flex-col justify-start bg-neutral-900 ${inter.className}`}>
      <Header router={router} />
      {children}
      <Footer />
    </div>
  );
};
export default MainLayout;
