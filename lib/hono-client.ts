import { hc } from "hono/client";
import { AppType } from "@/app/api/[[...route]]/route";
import { getCookie } from "cookies-next";

const token = getCookie("token");

export const client = hc<AppType>(process.env.NEXT_PUBLIC_APP_URL!, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
