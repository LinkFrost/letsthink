import Link from "next/link";
import { Inter } from "@next/font/google";
import { useContext } from "react";
import { NextRouter, useRouter } from "next/router";
import { AuthService } from "../../utils/services";
import { AuthContext, logout } from "../../utils/auth/auth";

const inter = Inter();

const Header = (props: { router: NextRouter }) => {
  const session = useContext(AuthContext);

  return (
    <header className="flex items-center justify-between bg-slate-100 p-3 px-4">
      <Link href="/">
        <div className="flex items-center justify-center gap-1">
          <img src="./favicon.ico" height="50" width="50"></img>
          <h1 className="text-2xl font-bold">letsthink</h1>
        </div>
      </Link>
      {!session.isAuth ? (
        <Link className="text-lg hover:underline" href="login">
          Login
        </Link>
      ) : (
        <div className="flex gap-6">
          <Link className="text-lg hover:underline" href="/">
            Hi, {(session.userData as any).username}
          </Link>
          <Link className="text-lg hover:underline" href="">
            <button onClick={logout}>Logout</button>
          </Link>
        </div>
      )}
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
    <li className="py-1">
      <Link target={target} href={href} className="text-sm transition duration-75 ease-out hover:text-neutral-50 hover:underline">
        {children}
      </Link>
    </li>
  );
};

const Footer = () => {
  return (
    <footer className="mt-auto bg-black">
      <hr className="border-[1px] border-neutral-700"></hr>
      <div className="item mx-auto grid max-w-screen-lg grid-cols-2 justify-center gap-2 py-1 px-6 text-neutral-500 sm:grid-cols-4">
        <div>
          <h2 className="my-3 text-lg text-neutral-50">Links</h2>
          <ul>
            <FooterLink href="/">Home</FooterLink>
            <FooterLink href="">My Rooms</FooterLink>
          </ul>
        </div>
        <div>
          <h2 className="my-3 text-lg text-neutral-50">Project</h2>
          <ul>
            <FooterLink target="_blank" href="">
              About
            </FooterLink>
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
