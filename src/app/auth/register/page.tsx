import RegisterForm from '@/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#f3e9df] px-4 py-12">
      <div className="mx-auto mt-10 w-full max-w-lg border border-[#cdb9aa] bg-[#fffaf7] p-8">
        <p className="eyebrow text-[#9d4134]">Join the record</p>
        <h1 className="display-title mt-4 text-4xl text-[#241c19]">Create your private account.</h1>
        <p className="mt-2 mb-8 text-sm text-[#6e5b52]">Your name stays out of it. Your experience does not.</p>
        <RegisterForm />
      </div>
    </div>
  );
}
