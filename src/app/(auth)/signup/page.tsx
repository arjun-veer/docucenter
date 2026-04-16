import { SignupForm } from "@/features/auth/components/signup-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignupPage() {
  return <SignupForm />;
}
