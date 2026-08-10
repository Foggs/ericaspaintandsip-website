import { SignUp } from "@clerk/react";

export function SignUpPage() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-sidebar to-sidebar-accent px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}
