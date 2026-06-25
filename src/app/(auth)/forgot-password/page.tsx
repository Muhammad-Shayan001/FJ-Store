"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "rate_limited">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setStatus("loading");
    setErrorMessage("");
    setRetryAfter(null);

    try {
      console.log("[FORGOT PASSWORD] Sending reset request for:", data.email);
      
      // First check if server is responding
      console.log("[FORGOT PASSWORD] Checking server connectivity...");
      try {
        const healthResponse = await fetch("/api/health", { cache: "no-store" });
        if (!healthResponse.ok) {
          throw new Error("Server health check failed");
        }
        console.log("[FORGOT PASSWORD] ✓ Server is responding");
      } catch (healthError) {
        console.error("[FORGOT PASSWORD] Server connectivity issue:", healthError);
        throw new Error(
          "Cannot connect to server. Please make sure the dev server is running: npm run dev"
        );
      }

      // Use custom password reset endpoint that sends via Gmail
      let response;
      try {
        response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email }),
          cache: "no-store",
        });
      } catch (fetchError) {
        console.error("[FORGOT PASSWORD] Network error:", fetchError);
        throw new Error(
          "Network connection failed. Please check if the server is running and try again. " +
          (fetchError instanceof Error ? `(${fetchError.message})` : "")
        );
      }

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error("[FORGOT PASSWORD] Failed to parse response:", jsonError);
        throw new Error("Invalid response from server. The server may have crashed.");
      }

      // Handle rate limit (429 status)
      if (response.status === 429) {
        console.warn("[FORGOT PASSWORD] Rate limit hit");
        const retryAfterSeconds = parseInt(response.headers.get("Retry-After") || "900");
        setRetryAfter(retryAfterSeconds);
        setStatus("rate_limited");
        setErrorMessage(result.error || "Too many requests. Please try again later.");
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to send reset email");
      }

      console.log("[FORGOT PASSWORD] ✓ Reset email sent");
      setStatus("success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      console.error("[FORGOT PASSWORD] Error:", message);
      setErrorMessage(message);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center flex flex-col items-center">
          <BrandLogo width={140} height={36} className="mb-4 justify-center" />
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "success" ? (
            <div className="space-y-4">
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="text-success mt-0.5" size={20} />
                <div>
                  <h4 className="text-success font-medium">Email Sent!</h4>
                  <p className="text-sm text-success/80 mt-1">
                    Check your inbox for a password reset link. It may take a few minutes to arrive.
                  </p>
                  <p className="text-xs text-success/60 mt-2">
                    Don't see it? Check your spam or junk folder.
                  </p>
                </div>
              </div>
              
              <div className="p-3 bg-muted/50 border border-muted/30 rounded text-xs text-muted">
                <p>If you don't receive the email within 5 minutes, try:</p>
                <ul className="mt-2 space-y-1 ml-4 list-disc">
                  <li>Checking your spam/junk folder</li>
                  <li>Requesting another reset link</li>
                </ul>
              </div>
            </div>
          ) : status === "rate_limited" ? (
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-warning mt-0.5" size={20} />
              <div>
                <h4 className="text-warning font-medium">Too Many Requests</h4>
                <p className="text-sm text-warning/80 mt-1">
                  {errorMessage}
                </p>
                {retryAfter && (
                  <p className="text-sm text-warning/70 mt-2">
                    Please wait approximately {Math.ceil(retryAfter / 60)} minutes before trying again.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {status === "error" && (
                <div className="p-3 bg-error/10 border border-error/20 text-error rounded text-sm space-y-1">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{errorMessage}</p>
                      {errorMessage.includes("server") && (
                        <p className="text-xs text-error/70 mt-1">
                          Try refreshing the page or check if the development server is running in your terminal.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground dark:text-foreground dark:text-white">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  className={errors.email ? "border-error focus-visible:ring-error" : ""}
                />
                {errors.email && <p className="text-error text-xs">{errors.email.message}</p>}
              </div>

              <Button
                type="submit"
                variant="luxury"
                className="w-full"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="text-center text-sm text-muted mt-4">
                Remember your password?{" "}
                <Link href="/login" className="text-accent-gold hover:underline">
                  Log in
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
