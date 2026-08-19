export {};

declare global {
  interface Window {
    initSendOTP: (configuration: {
      widgetId: string;
      tokenAuth: string;
      identifier?: string;
      exposeMethods?: boolean;
      captchaRenderId?: string;

      success?: (data: unknown) => void;

      failure?: (error: unknown) => void;
    }) => void;

    sendOtp: (
      identifier: string,
      success?: (data: unknown) => void,
      failure?: (error: unknown) => void,
    ) => void;

    verifyOtp: (
      otp: string | number,
      success?: (data: unknown) => void,
      failure?: (error: unknown) => void,
      reqId?: string,
    ) => void;

    retryOtp: (
      channel: string | null,
      success?: (data: unknown) => void,
      failure?: (error: unknown) => void,
      reqId?: string,
    ) => void;
  }
}