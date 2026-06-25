import { Suspense } from "react";
import AccountContent from "./AccountContent";
import { Skeleton } from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";

export default function AccountPage() {
  return (
    <PageContainer maxWidth="lg">
      <h1 className="text-4xl font-heading font-bold text-foreground dark:text-foreground dark:text-white mb-8">My Account</h1>

      <Suspense
        fallback={
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-4">
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        }
      >
        <AccountContent />
      </Suspense>
    </PageContainer>
  );
}
