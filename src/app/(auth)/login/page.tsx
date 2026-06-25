import { LoginForm } from "@/components/auth/LoginForm";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-12 px-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-transparent overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full bg-accent-blue/5 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] rounded-full bg-accent-gold/5 blur-[120px] mix-blend-screen" />
      </div>

      <div className="w-full relative z-10">
        <Suspense fallback={<div className="text-center text-foreground dark:text-white">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
