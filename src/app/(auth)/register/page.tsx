import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf6ec] px-6 py-12">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[#3d2f1f]">Chitthiya</h1>
          <p className="mt-1 text-sm text-[#8a7a63]">Create your shared journal</p>
        </div>
        <RegisterForm />
        <div className="text-center text-sm text-[#8a7a63]">
          Already have a journal?{" "}
          <Link href="/login" className="font-medium text-[#3d2f1f] hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
