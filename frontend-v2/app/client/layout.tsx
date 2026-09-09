import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyTpaSessionToken } from "../../lib/session/TpaSessionToken";

export default async function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const secret = process.env.TPA_SESSION_SECRET;

  if (!secret) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("tpa_session")?.value;

  if (!token) {
    redirect("/login");
  }

  const session = verifyTpaSessionToken(token, secret);

  if (!session) {
    redirect("/login");
  }

  switch (session.accessRole) {
    case "client":
      break;

    case "seller":
      redirect("/comptoir");

    case "wholesaler_admin":
      redirect("/grossiste");

    case "super_admin":
      redirect("/super-admin");

    default:
      redirect("/login");
  }

  return children;
}