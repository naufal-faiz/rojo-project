import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rojo Safety - Masuk Admin",
  description: "Login ke dashboard admin Rojo Safety Penyedia Jasa Kesehatan, Keselamatan Kerja di Bekasi",
};

export default function SignIn() {
  return <SignInForm />;
}
