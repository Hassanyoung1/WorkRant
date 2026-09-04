import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f3e9df] px-4 py-12">
      <div className="mx-auto mt-10 w-full max-w-md border border-[#cdb9aa] bg-[#fffaf7] p-8">
        <p className="eyebrow text-[#9d4134]">Private entrance</p>
        <h1 className="display-title mt-4 text-4xl text-[#241c19]">Welcome back.</h1>
        <p className="mt-2 mb-8 text-sm text-[#6e5b52]">Sign in to continue the conversation.</p>
        <LoginForm />
      </div>
    </div>
  );
}
