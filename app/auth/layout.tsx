import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/query/users";

const src = `https://api.dicebear.com/8.x/shapes/svg?seed=1`;
async function AuthLayout({ children }: { children: React.ReactNode }) {
  let session;
  try {
    session = await getSession();
  } catch (error) {}
  if (session) redirect("/dashboard");

  return (
    <div className="w-full lg:grid h-screen lg:grid-cols-2">
      <div className="h-full flex items-center justify-center py-12 container">
        <div className="w-full max-w-lg">{children}</div>
      </div>
      <div className="hidden lg:block relative bg-secondary">
        <Image
          src={src}
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

export default AuthLayout;
