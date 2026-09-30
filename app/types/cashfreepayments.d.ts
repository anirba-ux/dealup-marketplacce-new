declare module "@cashfreepayments/cashfree-js" {
  interface CashfreeCheckoutOptions {
    paymentSessionId: string;
    redirectTarget?: "_self" | "_blank" | "_modal";
  }

  interface CashfreeCheckoutResult {
    error?: {
      code?: string;
      message?: string;
      type?: string;
    };
    redirect?: boolean;
  }

  interface CashfreeInstance {
    checkout(
      options: CashfreeCheckoutOptions,
    ): Promise<CashfreeCheckoutResult>;
  }

  interface CashfreeLoadOptions {
    mode: "sandbox" | "production";
  }

  export function load(
    options: CashfreeLoadOptions,
  ): Promise<CashfreeInstance>;
}