import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Posts - WorkRant — Anonymous Workplace Voices',
  description: 'Browse unfiltered anonymous workplace experiences and discussions from the WorkRant community.',
  openGraph: {
    title: 'Anonymous Workplace Experiences - WorkRant',
    description: 'Read real workplace experiences shared anonymously by the community.',
    type: 'website',
  },
};

export default function PostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
