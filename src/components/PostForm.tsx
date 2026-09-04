'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Post } from '@/types';
import { usePostCreation } from '@/hooks/usePostCreation';

interface PostFormProps {
  onPostCreated?: (post: Post) => void;
  onCancel?: () => void;
}

const postTypes = [
  { value: 'experience', label: 'Experience', note: 'What happened on the job.' },
  { value: 'advice', label: 'Advice', note: 'What someone else should know.' },
  { value: 'question', label: 'Question', note: 'Something you want the room to answer.' },
  { value: 'warning', label: 'Warning', note: 'A pattern worth naming.' },
] as const;

export default function PostForm({ onPostCreated, onCancel }: PostFormProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { createPost, isSubmitting, error, setError } = usePostCreation({
    onSuccess: (post) => {
      onPostCreated?.(post);
      setFormData({ content: '', post_type: 'experience', company_name: '', image: null });
    },
    redirectOnSuccess: false,
  });

  const [formData, setFormData] = useState({
    content: '',
    post_type: 'experience' as 'experience' | 'advice' | 'question' | 'warning',
    company_name: '',
    image: null as File | null,
  });

  if (isLoading) return <div className="p-8 text-sm text-[#6e5b52]">Loading the editor...</div>;

  if (!user) {
    router.push('/login');
    return <div className="p-8 text-sm text-[#6e5b52]">Redirecting to login...</div>;
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }
    setFormData((previous) => ({ ...previous, image: file }));
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    await createPost({
      content: formData.content,
      company_name: formData.company_name,
      post_type: formData.post_type,
      image: formData.image ?? undefined,
    });
  };

  return (
    <div className="space-y-7">
      <div className="flex items-start justify-between border-b border-[#cdb9aa] pb-5">
        <div>
          <p className="eyebrow text-[#9d4134]">New entry</p>
          <h3 className="display-title mt-2 text-3xl text-[#241c19]">Say the part you would normally leave out.</h3>
          <p className="mt-2 text-sm text-[#6e5b52]">Specific details help more than polished opinions.</p>
        </div>
        {onCancel && <button type="button" onClick={onCancel} className="text-2xl leading-none text-[#6e5b52] hover:text-[#241c19]" aria-label="Close composer">×</button>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-7">
        <fieldset>
          <legend className="eyebrow mb-3 text-[#6e5b52]">What kind of entry is this?</legend>
          <div className="grid gap-px border border-[#cdb9aa] bg-[#cdb9aa] sm:grid-cols-2">
            {postTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData((previous) => ({ ...previous, post_type: type.value }))}
                className={`min-h-24 bg-[#fffaf7] p-4 text-left transition hover:bg-[#f7ebe2] ${formData.post_type === type.value ? 'border-l-4 border-[#9d4134] bg-[#f0ddd2]' : ''}`}
                aria-pressed={formData.post_type === type.value}
              >
                <span className="block font-serif text-xl font-semibold text-[#241c19]">{type.label}</span>
                <span className="mt-1 block text-xs leading-5 text-[#6e5b52]">{type.note}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="post-company" className="eyebrow mb-2 block text-[#6e5b52]">Company context <span className="normal-case tracking-normal">(optional)</span></label>
          <input id="post-company" type="text" value={formData.company_name} onChange={(event) => setFormData((previous) => ({ ...previous, company_name: event.target.value }))} className="input" placeholder="Name the company if it helps the story" />
        </div>

        <div>
          <label htmlFor="post-content" className="eyebrow mb-2 block text-[#6e5b52]">The account</label>
          <textarea id="post-content" rows={7} value={formData.content} onChange={(event) => setFormData((previous) => ({ ...previous, content: event.target.value }))} className="input h-auto resize-none py-4 leading-7" placeholder="What happened, who was affected, and what do you wish you had known?" required />
          <div className="mt-2 flex justify-between text-xs text-[#6e5b52]"><span>Leave out names, email addresses, and identifying details.</span><span>{formData.content.length} characters</span></div>
        </div>

        <div>
          <label htmlFor="post-image" className="eyebrow mb-2 block text-[#6e5b52]">Evidence or context <span className="normal-case tracking-normal">(optional)</span></label>
          <input id="post-image" type="file" accept="image/*" onChange={handleImageChange} className="block w-full border border-dashed border-[#b99d8d] bg-[#f8efe8] p-4 text-sm text-[#6e5b52] file:mr-4 file:border-0 file:bg-[#241c19] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#fffaf7]" />
          {formData.image && <p className="mt-2 text-xs text-[#6e5b52]">Attached: {formData.image.name}</p>}
        </div>

        {error && <div className="border-l-2 border-[#9d4134] bg-[#f0d9d1] p-3 text-sm text-[#713229]">{error}</div>}

        <div className="flex items-center justify-between border-t border-[#cdb9aa] pt-5">
          <p className="max-w-xs text-xs leading-5 text-[#6e5b52]">Your post is published under your pseudonym, not your real identity.</p>
          <div className="flex gap-3">
            {onCancel && <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={isSubmitting}>Cancel</button>}
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">{isSubmitting ? 'Publishing...' : 'Publish entry'}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
