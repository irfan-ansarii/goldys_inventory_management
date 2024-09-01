import { getSession } from "@/query/users";

import { redirect } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { AuthProvider } from "@/components/auth-provider";

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  let session = null;

  try {
    session = await getSession();
  } catch (error) {
    redirect("/auth/signin");
  }

  return (
    <AuthProvider>
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r lg:block bg-secondary">
          <Sidebar className="sticky top-0" />
        </div>
        <div className="flex flex-col relative">
          <div className="absolute h-64 bg-secondar left-0 top-0 inset-x-0 z-[-1]"></div>
          <Header />
          <main className="flex flex-1 flex-col container p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
};

export default AdminLayout;
