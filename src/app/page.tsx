'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Header from '@/components/Header';
import PostFeed from '@/components/PostFeed';

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

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
          <div className="space-y-24 pb-20 pt-10 sm:pt-16">
            <section className="relative overflow-hidden rounded-[2rem] bg-[#171615] px-6 py-12 text-[#f7efe7] shadow-[0_30px_90px_rgba(23,22,21,0.2)] sm:px-12 sm:py-16 lg:px-20 lg:py-20">
              <div className="absolute right-[-8rem] top-[-10rem] h-80 w-80 rounded-full border border-[#d46a4a]/30" />
              <div className="relative grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
                <div className="max-w-xl">
                  <p className="eyebrow text-[#e08a6f]">Before you sign the offer</p>
                  <h1 className="display-title mt-5 text-5xl text-[#fff8f1] sm:text-6xl lg:text-7xl">What people say after management leaves the room.</h1>
                  <p className="mt-7 max-w-lg text-lg leading-8 text-[#c9bdb5]">Workplace reviews without the polished language, anonymous by design and specific enough to help you decide.</p>
                  <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                    <a href="/register" className="btn bg-[#e06f4f] text-[#211512] hover:bg-[#ef8566]">Read the honest version</a>
                    <a href="/posts" className="btn border border-[#5f5049] bg-transparent text-[#f7efe7] hover:bg-[#282321]">Browse recent rants</a>
                  </div>
                </div>

                <article className="relative rotate-[1deg] border border-[#584b45] bg-[#f8f0e8] p-5 text-[#211b19] shadow-[14px_18px_0_#d46a4a] sm:p-7 lg:ml-8">
                  <div className="flex items-start justify-between border-b border-[#d8c9bd] pb-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b4939]">Anonymous post · 2h ago</p>
                      <h2 className="mt-3 font-serif text-2xl font-semibold leading-tight sm:text-3xl">The promotion came with a new title and the same impossible workload.</h2>
                    </div>
                    <span className="ml-4 hidden border border-[#b95743] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#9b4939] sm:inline-block">Unfiltered</span>
                  </div>
                  <p className="mt-5 text-base leading-7 text-[#51443f]">The team is talented. The manager is not cruel. That almost makes it harder to explain why everyone is exhausted and quietly interviewing elsewhere.</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {['Burnout culture', 'Toxic leadership', 'Promotion'].map((tag) => <span key={tag} className="border border-[#cdb8aa] px-2.5 py-1 text-xs font-medium text-[#6f554a]">{tag}</span>)}
                  </div>
                  <div className="mt-7 flex items-center justify-between border-t border-[#d8c9bd] pt-5 text-sm text-[#6f625c]">
                    <span>▲ 47 people found this useful</span>
                    <span>12 replies</span>
                  </div>
                </article>
              </div>
            </section>

            <section className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
              <div>
                <p className="eyebrow text-[#9d4134]">The useful part</p>
                <h2 className="display-title mt-4 max-w-sm text-4xl text-[#241c19] sm:text-5xl">A company page should tell you more than the careers page does.</h2>
              </div>
              <div className="border-t-2 border-[#241c19]">
                <div className="grid gap-8 border-b border-[#cdb9aa] py-8 sm:grid-cols-[1fr_1.6fr]">
                  <p className="font-serif text-2xl text-[#9d4134]">01 / Patterns</p>
                  <p className="max-w-xl text-lg leading-8 text-[#584944]">Read across teams and time, not just one five-star review. Repeated words matter: micromanagement, unpaid overtime, no path up.</p>
                </div>
                <div className="grid gap-8 border-b border-[#cdb9aa] py-8 sm:grid-cols-[1fr_1.6fr]">
                  <p className="font-serif text-2xl text-[#9d4134]">02 / Context</p>
                  <p className="max-w-xl text-lg leading-8 text-[#584944]">A rough quarter and a broken culture are different things. Posts carry enough detail to help you tell them apart.</p>
                </div>
                <div className="grid gap-8 border-b border-[#cdb9aa] py-8 sm:grid-cols-[1fr_1.6fr]">
                  <p className="font-serif text-2xl text-[#9d4134]">03 / Receipts</p>
                  <p className="max-w-xl text-lg leading-8 text-[#584944]">No personal profiles to perform for. Just the experience, the trade-off, and what someone wishes they had known sooner.</p>
                </div>
              </div>
            </section>

            <section className="grid gap-8 bg-[#e2d2c4] px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1fr_1.2fr] lg:items-center">
              <div>
                <p className="eyebrow text-[#9d4134]">Built for the awkward questions</p>
                <h2 className="display-title mt-4 text-4xl text-[#241c19] sm:text-5xl">Would you recommend this place to someone you care about?</h2>
              </div>
              <div className="border-l-2 border-[#9d4134] pl-6 sm:pl-10">
                <p className="text-xl leading-9 text-[#584944]">Ask before the interview. Ask after the final round. Ask when the new job has started feeling strangely familiar.</p>
                    <Link href="/companies" className="mt-7 inline-flex text-sm font-semibold uppercase tracking-[0.14em] text-[#9d4134] underline decoration-[#9d4134]/40 underline-offset-8 hover:text-[#713229]">Explore company conversations <span className="ml-3">→</span></Link>
              </div>
            </section>

            <section className="flex flex-col gap-8 border-t-2 border-[#241c19] pt-8 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow text-[#9d4134]">Your turn</p>
                <h2 className="display-title mt-4 text-4xl text-[#241c19] sm:text-6xl">Leave the polished version at the door.</h2>
              </div>
              <a href="/register" className="btn btn-primary shrink-0">Share anonymously <span>→</span></a>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
