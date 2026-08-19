import AuthLayout from "@/components/auth/AuthLayout";
import AuthBanner from "@/components/auth/AuthBanner";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthLayout>
      <AuthBanner />
      <RegisterForm />
    </AuthLayout>
  );
}