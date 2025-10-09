import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Profile - WorkRant — Anonymous Workplace Voices',
  description: 'View your WorkRant profile, statistics, and manage your account settings. All posts remain anonymous.',
  openGraph: {
    title: 'WorkRant Profile',
    description: 'Anonymous workplace transparency platform',
    url: '/profile',
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}