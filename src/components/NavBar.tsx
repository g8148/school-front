import { Link } from "@remix-run/react";
import { Home, Ticket, GraduationCapIcon } from "lucide-react";

export default function NavBar() {
  return (
    <div className="flex max-h-screen flex-col gap-2 bg-indigo-900/20 md:w-[220px] lg:w-[280px]">
      <div className="flex h-14 items-center border-b-2 border-indigo-900/40 px-4 lg:h-[60px] lg:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <GraduationCapIcon className="size-8" />
          <span>Administrativo</span>
        </Link>
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          <NavItens url="/">
            <Home className="size-6" />
            Início
          </NavItens>
          <NavItens url="/eventos">
            <Ticket className="size-6" />
            Eventos
          </NavItens>
        </nav>
      </div>
    </div>
  );
}

function NavItens({
  url,
  children,
}: {
  url: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 ease-in-out hover:bg-indigo-900/10"
      to={url}
    >
      {children}
    </Link>
  );
}
