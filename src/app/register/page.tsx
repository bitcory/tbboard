import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[rgb(var(--background))] px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-2xl font-black uppercase tracking-tight">
          TB Board
        </h1>
        <div className="rounded-xl border-[3px] border-[rgb(var(--foreground))] bg-[rgb(var(--content1))] p-6 shadow-[var(--shadow-lg)]">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
