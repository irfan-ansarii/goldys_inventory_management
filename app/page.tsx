import Cart from "./components/cart";

const navs = [
  {
    label: "Just In",
    href: "https://www.goldysnestt.com/collections/all",
  },
  {
    label: "Women",
    href: "https://www.goldysnestt.com/collections/women",
  },
  {
    label: "Kids",
    href: "https://www.goldysnestt.com/collections/kids",
  },
  {
    label: "Sale",
    href: "https://www.goldysnestt.com/collections/sale",
  },
];
export default async function Home() {
  return (
    <>
      {/* backgroudn and gradient/grid */}
      <div className="w-full h-screen fixed flex justify-center px-6 py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-40 z-[1] invert dark:invert-0 bg-[url('/grid.svg')]"></div>
        <div
          className="z-[2] w-full max-w-lg absolute inset-y-0 blur-lg"
          style={{
            backgroundImage:
              "radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 1) 0px, transparent 0%),radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 1) 0px, transparent 50%),radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 1) 0px, transparent 50%),radial-gradient(at 10% 29%, hsla(256, 96%, 67%, 1) 0px, transparent 50%),radial-gradient(at 97% 96%, hsla(38, 60%, 74%, 1) 0px, transparent 50%),radial-gradient(at 33% 50%, hsla(222, 67%, 73%, 1) 0px, transparent 50%),radial-gradient(at 79% 53%, hsla(343, 68%, 79%, 1) 0px, transparent 50%)",
            filter: "blur(100px) saturate(150%)",
            opacity: "0.15",
          }}
        ></div>
      </div>
      <div className="relative z-10 py-10">
        {/* header */}
        <header>
          <div className="container">
            <div className="max-w-2xl mx-auto overflow-hidden">
              <div className="flex justify-center bg-background/30 backdrop-blur border rounded-full px-2 py-1 gap-2">
                {navs.map((nav, i) => (
                  <a
                    target="_blank"
                    href={nav.href}
                    key={i}
                    className="px-6 flex-1 text-center py-1.5 text-sm text-muted-foreground hover:bg-background hover:text-primary rounded-full"
                  >
                    {nav.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </header>
        {/* content */}
        <div className="container">
          <div className="space-y-20 pt-20">
            <div className="grid grid-cols-2 gap-6 md:gap-24">
              <div className="flex flex-col justify-center space-y-6 col-span-2 md:col-span-1">
                <h1 className="font-display font-extrabold text-5xl md:text-6xl leading-tight">
                  Welcome to
                  <br />
                  <span className="bg-gradient-to-r from-lime-500 via-orange-600 to-lime-500 bg-clip-text text-transparent">
                    Goldys Nestt
                  </span>
                </h1>
                <h2 className="text-muted-foreground sm:text-xl">
                  Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                  Numquam voluptatem ut quidem quos, voluptates beatae iste
                  commodi facilis sed! Perferendis magnam rem facilis minus fuga
                  cum obcaecati libero dolores nesciunt earum error consequuntur
                  odit eaque nihil vero porro, dignissimos fugiat, animi placeat
                  doloribus nemo. Beatae similique incidunt saepe eos ea!
                </h2>
                <div className="flex space-x-4">
                  <a
                    className="rounded-full border px-5 py-2 text-sm font-medium shadow-sm transition-all hover:ring-4 hover:ring-primary bg-primary text-primary-foreground "
                    href="/dashboard"
                  >
                    Contine to dashboard
                  </a>
                </div>
              </div>
              <div className="border rounded-lg bg-background/50 backdrop-blur col-span-2 md:col-span-1">
                <div className="p-6 flex flex-col gap-1 h-full">
                  <Cart />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="col-span-3 md:col-span-1 relative break-inside-avoid rounded-3xl border backdrop-blur-lg bg-gradient-to-tr from-transparent via-transparent to-black/60 bg-black"
                >
                  <img
                    src="https://assets.dub.co/testimonials/card-dotted-grid-dark.png"
                    alt="Dotted grid background"
                    className="pointer-events-none absolute right-0 top-0"
                  />
                  <a
                    className="flex h-full flex-col justify-between p-8"
                    href="/customers/raycast"
                  >
                    <div className="relative h-20">
                      <img
                        src="https://assets.dub.co/testimonials/raycast.svg"
                        alt="Raycast"
                        className="absolute h-8 w-fit"
                      />
                    </div>
                    <div className="text-gray-200">
                      Dubs link infrastructure &amp; analytics has helped us
                      gain valuable insights into the link-sharing use case of
                      Ray.so. And all of it with just a few lines of code.
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
