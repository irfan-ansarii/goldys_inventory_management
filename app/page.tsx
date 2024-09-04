export default async function Home() {
  return (
    <>
      <div className="w-screen min-h-screen fixed flex justify-center px-6 py-28">
        <div
          className="h-full w-full absolute z-[2] top-0"
          style={{
            background:
              "radial-gradient(circle, rgba(2, 0, 36, 0) 0, #fafafa 100%)",

            content: "",
          }}
        ></div>

        <div
          className="absolute w-full h-full top-0 opacity-40 top-0 z-[1] invert dark:invert-0"
          style={{
            backgroundImage: "url(https://assets.dub.co/misc/grid.svg)",
            content: "",
          }}
        ></div>

        <div
          className="z-[3] w-full max-w-lg absolute h-full"
          style={{
            backgroundImage:
              "radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 1) 0px, transparent 0%),radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 1) 0px, transparent 50%),radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 1) 0px, transparent 50%),radial-gradient(at 10% 29%, hsla(256, 96%, 67%, 1) 0px, transparent 50%),radial-gradient(at 97% 96%, hsla(38, 60%, 74%, 1) 0px, transparent 50%),radial-gradient(at 33% 50%, hsla(222, 67%, 73%, 1) 0px, transparent 50%),radial-gradient(at 79% 53%, hsla(343, 68%, 79%, 1) 0px, transparent 50%)",
            filter: "blur(100px) saturate(150%)",
            opacity: "0.15",
          }}
        ></div>
      </div>
      <div className="relative z-10 py-28">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="mt-5 font-display font-extrabold text-6xl leading-tight">
            Welcome to Goldys Nestt
            <br />
            <span className="bg-gradient-to-r from-amber-500 via-orange-600 to-yellow-500 bg-clip-text text-transparent">
              Superpowers
            </span>
          </h1>
          <h2 className="mt-5 text-gray-600 sm:text-xl">
            Dub.co is the open-source link management infrastructure for modern
            marketing teams.
          </h2>
          <div className="mx-auto mt-5 flex max-w-fit space-x-4">
            <a
              target="_blank"
              className="rounded-full mx-auto max-w-fit border px-5 py-2 text-sm font-medium shadow-sm transition-all hover:ring-4 hover:ring-gray-200 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:ring-0 disabled:border-gray-200 border-black bg-black text-white hover:bg-gray-800"
              href="https://app.dub.co"
            >
              Start for Free
            </a>
            <a
              className="rounded-full mx-auto max-w-fit border px-5 py-2 text-sm font-medium shadow-sm transition-all hover:ring-4 hover:ring-gray-200 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:ring-0 disabled:border-gray-200 border-gray-200 bg-white hover:border-gray-400 hover:text-gray-800 text-gray-500"
              href="/enterprise"
            >
              Get a Demo
            </a>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3">
        <div className="relative break-inside-avoid rounded-3xl border border-gray-300 backdrop-blur-lg row-span-2 bg-gradient-to-tr from-transparent via-transparent to-[rgb(255,97,97,0.25)] bg-black">
          <img
            src="https://assets.dub.co/testimonials/card-dotted-grid-dark.png"
            alt="Dotted grid background"
            className="pointer-events-none absolute right-0 top-0"
          />
          <a
            className="flex h-full flex-col justify-between p-8"
            href="/customers/raycast"
          >
            <div className="relative h-36">
              <img
                src="https://assets.dub.co/testimonials/raycast.svg"
                alt="Raycast"
                className="absolute h-8 w-fit"
              />
            </div>
            <div className="text-gray-200">
              Dubs link infrastructure &amp; analytics has helped us gain
              valuable insights into the link-sharing use case of Ray.so. And
              all of it with just a few lines of code.
            </div>
            <div className="mt-8 flex items-center justify-between">
              <div className="flex flex-col space-y-0.5 invert">
                <div className="font-semibold text-gray-800">
                  Thomas Paul Mann
                </div>
                <div className="text-sm text-gray-500">CEO Raycast</div>
              </div>
              <img
                alt="Thomas Paul Mann"
                loading="lazy"
                width={300}
                height={300}
                decoding="async"
                data-nimg={1}
                className="blur-0 h-12 w-12 rounded-full border border-gray-800"
                src="https://assets.dub.co/testimonials/thomas-paul-mann.jpeg"
              />
            </div>
          </a>
        </div>
      </div>
    </>
  );
}
