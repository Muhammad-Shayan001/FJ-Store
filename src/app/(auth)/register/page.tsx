import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-12 px-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-transparent overflow-hidden z-0">
        <div className="absolute top-1/2 left-0 w-[40vw] h-[40vw] rounded-full bg-accent-gold/5 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-0 right-0 w-[40vw] h-[40vw] rounded-full bg-accent-blue/5 blur-[120px] mix-blend-screen" />
      </div>

      <div className="w-full relative z-10">
        <SignupForm />
      </div>
    </div>
  );
}
