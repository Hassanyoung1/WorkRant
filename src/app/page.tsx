'use client';

import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import PostFeed from '@/components/PostFeed';
import LoginForm from '@/components/LoginForm';

const stats = [
  { value: '2.8k+', label: 'anonymous stories shared' },
  { value: '140+', label: 'companies reviewed' },
  { value: '94%', label: 'users say it helps' },
];

const signalPoints = [
  'Anonymous insights from real workers',
  'Honest company and leadership feedback',
  'Practical career advice that people trust',
];

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4eee9]">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#e6d7c9] border-t-[#4a2d24]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4eee9] text-[#2a1f1c]">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {user ? (
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="rounded-[28px] border border-[#e6d7c9] bg-[#fffaf7] p-6 shadow-[0_18px_48px_rgba(74,45,36,0.06)] sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#6b544b]">Workspace</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-[#2a1f1c] sm:text-4xl">
                    Welcome back, {user.pseudonym}
                  </h1>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#e5c8ae] bg-[#f9f1e5] px-3 py-1.5 text-xs font-medium text-[#5a3e31]">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  Live community
                </div>
              </div>
            </div>
            <PostFeed />
          </div>
        ) : (
          <div className="space-y-12 pb-16 pt-8 sm:pt-12">
            <section className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e6d7c9] bg-[#fffaf7] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-[#5d4a45] shadow-sm">
                  Honest work conversations
                </div>
                <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.08em] text-[#2a1f1c] sm:text-5xl lg:text-6xl">
                  Work should be easier to understand.
                </h1>
                <p className="mt-5 max-w-xl text-lg leading-8 text-[#504540]">
                  WorkRant helps people share what work is really like — the culture, the pressure, the leadership, and the trade-offs behind the job title.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a href="/register" className="btn btn-primary">
                    Join WorkRant
                  </a>
                  <a href="/posts" className="btn btn-secondary">
                    Browse stories
                  </a>
                </div>

                <div className="mt-8 grid max-w-lg grid-cols-3 gap-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-[#e6d7c9] bg-[#fffaf7] p-4 shadow-sm">
                      <div className="text-2xl font-semibold tracking-[-0.05em] text-[#2a1f1c]">{stat.value}</div>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[#6b544b]">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="overflow-hidden rounded-[32px] border border-[#e6d7c9] bg-[#fffaf7] shadow-[0_25px_80px_rgba(74,45,36,0.08)]">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
                    alt="Professionals collaborating in a modern office"
                    className="h-[620px] w-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 left-6 right-6 rounded-[24px] border border-[#e6d7c9] bg-[#fffaf7]/90 p-4 shadow-lg backdrop-blur-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#6b544b]">Community signal</span>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                      +18 today
                    </span>
                  </div>
                  <div className="space-y-3">
                    {signalPoints.map((point) => (
                      <div key={point} className="flex items-center gap-3 text-sm text-[#473b37]">
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#a86241]" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
              <div className="rounded-[28px] border border-[#e6d7c9] bg-[#f3ebdf] p-6 sm:p-8">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#6b544b]">Why it matters</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-[#2a1f1c]">A better way to learn what work is really like.</h2>
                <div className="mt-8 space-y-5">
                  {[
                    ['Anonymous by design', 'No personal details required. People speak honestly without fear of being identified.'],
                    ['Built for real decisions', 'See patterns across teams, leaders, and employers before you say yes to a role.'],
                    ['Useful for both sides', 'Employees share what they know; employers learn where friction actually sits.'],
                  ].map(([title, copy]) => (
                    <div key={title} className="flex gap-4 rounded-2xl bg-[#fffaf7]/80 p-4">
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4a2d24] text-xs font-semibold text-white">
                        {title.slice(0, 1)}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-[#2a1f1c]">{title}</h3>
                        <p className="mt-1 text-sm leading-6 text-[#4f4340]">{copy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-[28px] border border-[#e6d7c9] bg-[#fffaf7] shadow-[0_18px_48px_rgba(74,45,36,0.04)]">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80"
                  alt="Team in a meeting discussing workplace experiences"
                  className="h-full min-h-[380px] w-full object-cover"
                />
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              {[
                ['Transparent feedback', 'See how people actually describe cultures, managers, and day-to-day work.'],
                ['Career clarity', 'Understand trade-offs before accepting an offer or moving teams.'],
                ['Trust without friction', 'Short, honest, useful first-hand experience from people who have been there.'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-[24px] border border-[#e6d7c9] bg-[#fffaf7] p-6 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#6b544b]">Focus</p>
                  <h3 className="mt-3 text-xl font-semibold tracking-[-0.04em] text-[#2a1f1c]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#4f4340]">{text}</p>
                </div>
              ))}
            </section>

            <div className="rounded-[28px] border border-stone-200 bg-stone-900 p-8 text-white shadow-[0_30px_80px_rgba(28,25,23,0.12)] sm:p-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-300">Start here</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-white sm:text-4xl">See what your workplace feels like before it becomes your reality.</h2>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <a href="/register" className="btn btn-primary bg-[#fffaf7] text-[#2a1f1c] hover:bg-[#f3e7df]">Create an account</a>
                  <a href="/login" className="btn btn-secondary border border-stone-700 bg-stone-800/80 text-white hover:bg-stone-800">Sign in</a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
