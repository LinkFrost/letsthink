import Link from "next/link";
import { Inter } from "@next/font/google";
const inter = Inter();

const Header = () => {
  return (
    <header className="p-10 text-2xl bg-slate-300 flex justify-between">
      <h1 className="font-bold">letsthink</h1>
      <Link className="hover:underline" href="/">
        Login
      </Link>
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
      <Link
        target={target}
        href={href}
        className="hover:text-zinc-50 transition ease-in duration-75"
      >
        {children}
      </Link>
    </li>
  );
};

const Footer = () => {
  return (
    <footer className="mt-auto bg-black border-">
      <hr className="border-neutral-700 border-[1px]"></hr>
      <div className="flex justify-between max-w-sm mx-auto text-neutral-500 p-10">
        <div>
          <h2 className="text-lg mb-3 text-neutral-50">Links</h2>
          <ul>
            <FooterLink href="/">Home</FooterLink>
            <FooterLink href="/me">My Profile</FooterLink>
            <FooterLink href="/about">About Us</FooterLink>
            <FooterLink href="">Repository</FooterLink>
          </ul>
        </div>
        <div>
          <h2 className="text-lg mb-3 text-neutral-50">Team</h2>
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
  return (
    <div
      className={`bg-neutral-900 min-h-screen flex flex-col justify-start ${inter.className}`}
    >
      <Header />
      {children}
      <Footer />
    </div>
  );
};
export default MainLayout;
