import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Posts - WorkRant — Anonymous Workplace Voices',
  description: 'Browse anonymous workplace experiences and discussions from the WorkRant community. Share your own workplace stories safely and anonymously.',
  openGraph: {
    title: 'WorkRant Posts - Anonymous Workplace Voices',
    description: 'Browse anonymous workplace experiences and discussions from the WorkRant community.',
    type: 'website',
    url: '/posts',
    siteName: 'WorkRant',
  },
  robots: {
    index: true,
    follow: true,
  }
}