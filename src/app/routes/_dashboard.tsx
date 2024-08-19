import NavBar from "@/components/NavBar";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  const cookies = request.headers.get("Cookie");

  const cookie = cookies ? cookies : "";

  const authCookieExists = cookie.startsWith("auth=");

  if (!authCookieExists) {
    return redirect("/login");
  }

  return null;
}

export default function DashboardLayout() {
  return (
    <>
      <main className="flex h-screen bg-gradient-to-r from-indigo-100 to-violet-100">
        <NavBar />
        <Outlet />
      </main>
    </>
  );
}
