import { Hono } from "hono";
import { sign } from "hono/jwt";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { getUser, updateUser } from "@/drizzle/services/users";
import { sanitizeOutput } from "../utils";
import { HTTPException } from "hono/http-exception";
import { sendEmail } from "@/emails";
import OneTimePassEmail from "@/emails/one-time-password";
import { limiter } from "@/lib/utils";

import { getStore } from "@/drizzle/services/stores";

const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
};

// signin schema
const signinSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(1),
});

// login with otp
const otpLoginSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
});

// verify otp
const otpVerifySchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  otp: z.string().length(6),
});

// reset password schema
const resetSchema = z
  .object({
    email: z.string().email({ message: "Invalid email" }),
    otp: z.string().length(6),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmPassword"],
      });
    }
  });

const app = new Hono()

  /********************************************************************* */
  /**                           SIGNIN ROUTE                             */
  /********************************************************************* */

  .post("/signin", zValidator("json", signinSchema), async (c) => {
    const data = c.req.valid("json");
    const { email, password } = data;

    const userData = await getUser(undefined, { email });

    if (!userData || userData.password !== password) {
      throw new HTTPException(400, { message: "Invalid email or password" });
    }

    const payload = {
      id: userData.id,
      storeId: userData.storeId,
      role: userData.role,
      exp: Math.floor(Date.now() / 1000) + 86400 * 7 /** 7 days */,
    };

    const sanitized = sanitizeOutput(userData, ["otp", "password"]);

    const token = await sign(payload, "secret");

    return c.json({
      success: true,
      data: {
        token,
        ...sanitized,
      },
    });
  })

  /********************************************************************* */
  /**                            GENERATE OTP                            */
  /********************************************************************* */
  .post("/otp", zValidator("json", otpLoginSchema), async (c) => {
    const data = c.req.valid("json");
    const { email } = data;

    const userData = await getUser(undefined, { email });

    if (!userData) {
      throw new HTTPException(400, { message: "Invalid email" });
    }
    const isAllowed = userData.role == "admin" || userData.role == "user";
    if (!isAllowed)
      throw new HTTPException(403, { message: "Permisson denied" });

    const otp = generateOTP();

    await updateUser(userData.id, { otp });

    await sendEmail({
      subject: `One time password`,
      email,
      react: OneTimePassEmail({ username: userData.name!, email, otp }),
    });

    return c.json({
      success: true,
      data: {
        email,
      },
    });
  })

  /********************************************************************* */
  /**                          SIGNIN WITH OTP                           */
  /********************************************************************* */
  .post("/signin/otp", zValidator("json", otpVerifySchema), async (c) => {
    const data = c.req.valid("json");
    const { email, otp } = data;

    const userData = await getUser(undefined, { email });

    if (!userData) {
      throw new HTTPException(400, { message: "Invalid email" });
    }

    if (!userData.otp || userData.otp !== otp) {
      throw new HTTPException(400, { message: "Invalid otp" });
    }

    await updateUser(userData.id, { otp: "" });

    const payload = {
      id: userData.id,
      storeId: userData.storeId,
      role: userData.role,
      exp: Math.floor(Date.now() / 1000) + 86400 * 7 /** 7 days */,
    };

    const token = await sign(payload, "secret");

    const sanitized = sanitizeOutput(userData, ["otp", "password"]);

    return c.json({
      success: true,
      data: {
        token: token,
        ...sanitized,
      },
    });
  })

  /********************************************************************* */
  /**                         VERIFY RECOVER OTP                         */
  /********************************************************************* */
  .post("/recover", zValidator("json", otpVerifySchema), async (c) => {
    const data = c.req.valid("json");
    const { email, otp } = data;

    const userData = await getUser(undefined, { email });

    if (!userData || (userData.role !== "admin" && userData.role !== "user")) {
      throw new HTTPException(400, { message: "Invalid email" });
    }

    if (!userData.otp || userData.otp !== otp) {
      throw new HTTPException(400, { message: "Invalid otp" });
    }

    return c.json({
      success: true,
      data: {
        email,
      },
    });
  })
  /********************************************************************* */
  /**                              RESET ROUTE                           */
  /********************************************************************* */
  .post("/reset", zValidator("json", resetSchema), async (c) => {
    const data = c.req.valid("json");
    const { email, otp, password, confirmPassword } = data;

    const userData = await getUser(undefined, { email });

    if (!userData) {
      throw new HTTPException(400, { message: "Invalid email" });
    }
    if (password !== confirmPassword) {
      throw new HTTPException(400, { message: "Passwords do not match" });
    }

    if (!userData.otp || userData.otp !== otp) {
      throw new HTTPException(400, { message: "Invalid request" });
    }

    await updateUser(userData.id, { otp: "", password: confirmPassword });

    const sanitized = sanitizeOutput(userData, ["otp", "password"]);

    limiter.schedule(() =>
      sendEmail({
        subject: `Your Password Has Been Successfully Updated`,
        email,
        react: OneTimePassEmail({ username: userData.name!, email, otp }),
      })
    );

    return c.json({
      success: true,
      data: sanitized,
    });
  });

export default app;
