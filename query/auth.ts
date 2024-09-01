import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/hono-client";
import { toast } from "sonner";
import { setCookie } from "cookies-next";
import { useMutation } from "@tanstack/react-query";

type SigninRequestType = InferRequestType<
  typeof client.api.auth.signin.$post
>["json"];
type SigninResponseType = InferResponseType<
  typeof client.api.auth.signin.$post
>;

type GenerateOTPResponseType = InferResponseType<
  typeof client.api.auth.otp.$post
>;
type GenerateOTPRequestType = InferRequestType<
  typeof client.api.auth.otp.$post
>["json"];

type SigninOTPResponseType = InferResponseType<
  typeof client.api.auth.signin.otp.$post
>;
type SigninOTPRequestType = InferRequestType<
  typeof client.api.auth.signin.otp.$post
>["json"];

type RecoverResponseType = InferResponseType<
  typeof client.api.auth.recover.$post
>;
type RecoverRequestType = InferRequestType<
  typeof client.api.auth.recover.$post
>["json"];

type ResetResponseType = InferResponseType<typeof client.api.auth.reset.$post>;
type ResetRequestType = InferRequestType<
  typeof client.api.auth.reset.$post
>["json"];

export const useSignin = () => {
  return useMutation<SigninResponseType, Error, SigninRequestType>({
    mutationFn: async (json) => {
      const response = await client.api.auth.signin.$post({ json });

      const jsonResponse = await response.json();

      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: ({ data }) => {
      toast.success(`Signed in successfully`);
      setCookie("token", data.token);
    },
    onError: (error) => toast.error(error.message),
  });
};

export const useGenerateOTP = () => {
  return useMutation<GenerateOTPResponseType, Error, GenerateOTPRequestType>({
    mutationFn: async (json) => {
      const response = await client.api.auth.otp.$post({ json });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: ({ data }) => toast.success(`OTP sent to ${data.email}`),
    onError: (error) => toast.error(error.message),
  });
};

export const useSigninOTP = () => {
  return useMutation<SigninOTPResponseType, Error, SigninOTPRequestType>({
    mutationFn: async (json) => {
      const response = await client.api.auth.signin.otp.$post({ json });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: ({ data }) => {
      toast.success(`Signed in successfully`);
      setCookie("token", data.token);
    },
    onError: (error) => toast.error(error.message),
  });
};

export const useRecoverPassword = () => {
  return useMutation<RecoverResponseType, Error, RecoverRequestType>({
    mutationFn: async (json) => {
      const response = await client.api.auth.recover.$post({ json });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onError: (error) => toast.error(error.message),
  });
};

export const useResetPassword = () => {
  return useMutation<ResetResponseType, Error, ResetRequestType>({
    mutationFn: async (json) => {
      const response = await client.api.auth.reset.$post({ json });

      const jsonResponse = await response.json();
      if (!jsonResponse.success) throw jsonResponse;
      return jsonResponse;
    },
    onSuccess: () => toast.success(`Passowrd changed successfully`),
    onError: (error) => toast.error(error.message),
  });
};
