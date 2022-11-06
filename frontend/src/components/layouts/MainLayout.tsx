import Link from "next/link";
import { Inter } from "@next/font/google";
const inter = Inter();

const Header = () => {
  return (
    <header className="flex justify-between bg-slate-300 p-10 text-2xl">
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
        className="text-sm transition duration-75 ease-out hover:text-neutral-50 hover:underline"
      >
        {children}
      </Link>
    </li>
  );
};

const Footer = () => {
  return (
    <footer className="mt-auto bg-black">
      <hr className="border-[1px] border-neutral-700"></hr>
      <div className="mx-auto grid max-w-screen-lg grid-cols-2 justify-center gap-2 py-12 px-6 text-neutral-500 sm:grid-cols-4">
        <div>
          <h2 className="my-3 text-lg text-neutral-50">Links</h2>
          <ul>
            <FooterLink href="/">Home</FooterLink>
            <FooterLink href="">My Profile</FooterLink>
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
              Roadmap
            </FooterLink>
            <FooterLink target="_blank" href="">
              Contribute
            </FooterLink>
            <FooterLink target="_blank" href="">
              Careers
            </FooterLink>
          </ul>
        </div>
        <div>
          <h2 className="my-3 text-lg text-neutral-50">Connect</h2>
          <ul>
            <FooterLink target="_blank" href="">
              Twitter
            </FooterLink>
            <FooterLink target="_blank" href="">
              Discord
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
  return (
    <div
      className={`flex min-h-screen flex-col justify-start bg-neutral-900 ${inter.className}`}
    >
      <Header />
      {children}
      <Footer />
    </div>
  );
};
export default MainLayout;
