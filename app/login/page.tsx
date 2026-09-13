import AuthSplitCard from "@/components/AuthSplitCard";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFEBEF] px-4 py-10 sm:px-6 lg:px-8">
      <AuthSplitCard variant="login" />
    </main>
  );
}