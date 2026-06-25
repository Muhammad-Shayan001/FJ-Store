"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBrowserClient } from "@/lib/supabase/client";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function UpdatePasswordPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    // Check if the user reached here via a recovery link (requires a session to be established via URL hash)
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        // Not strictly redirecting just in case Supabase takes a moment to process the hash
      }
    };
    checkSession();
  }, [supabase.auth]);

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

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
    } else {
      router.push("/login?message=Password updated successfully");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center flex flex-col items-center">
          <BrandLogo width={140} height={36} className="mb-4 justify-center" />
          <CardTitle>Set New Password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {status === "error" && (
              <div className="p-3 bg-error/10 border border-error/20 text-error rounded flex items-center gap-2 text-sm">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground dark:text-foreground dark:text-white">
                New Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                {...register("password")}
                className={errors.password ? "border-error focus-visible:ring-error" : ""}
              />
              {errors.password && <p className="text-error text-xs">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground dark:text-foreground dark:text-white">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="********"
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "border-error focus-visible:ring-error" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-error text-xs">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="luxury"
              className="w-full"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
