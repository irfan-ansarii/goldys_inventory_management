import Image from "next/image";

function AuthLayout({ children }: { children: React.ReactNode }) {
  const src = `https://api.dicebear.com/8.x/shapes/svg?seed=1`;

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
          className="h-full w-full object-cover  dark:grayscale"
        />
      </div>
    </div>
  );
}

export default AuthLayout;
