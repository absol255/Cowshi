import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BankLoginForm } from "@/components/bank-login";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-3xl font-semibold">Log in to bet</h1>
      <div className="rounded-2xl border border-line bg-surface p-5">
        <BankLoginForm
          onSuccess={() => {
            void navigate({ to: "/" });
          }}
        />
      </div>
    </div>
  );
}
