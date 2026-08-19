// import AuthBanner from "@/components/auth/AuthBanner";
// import AuthLayout from "@/components/auth/AuthLayout";
// import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

// export default function ForgotPasswordPage() {
//   return (
//     <AuthLayout banner={<AuthBanner />}>
//       <ForgotPasswordForm />
//     </AuthLayout>
//   );
// }

import AuthBanner from "@/components/auth/AuthBanner";
import AuthLayout from "@/components/auth/AuthLayout";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <AuthBanner />

      <ForgotPasswordForm />
    </AuthLayout>
  );
}