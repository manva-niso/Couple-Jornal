import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf6ec] px-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[#3d2f1f]">Chitthiya</h1>
          <p className="mt-1 text-sm text-[#8a7a63]">Sign in to your shared journal</p>
        </div>
        <LoginForm />
        <div className="text-center text-sm text-[#8a7a63]">
          Don&apos;t have a journal yet?{" "}
          <Link href="/register" className="font-medium text-[#3d2f1f] hover:underline">
            Create one
          </Link>
        </div>
      </div>
    </main>
  );
}