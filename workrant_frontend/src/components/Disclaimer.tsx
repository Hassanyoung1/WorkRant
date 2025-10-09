'use client';

interface DisclaimerProps {
  className?: string;
  variant?: 'post' | 'feed';
}

export default function Disclaimer({ className = '', variant = 'post' }: DisclaimerProps) {
  const baseClasses = 'text-xs text-gray-400 italic';
  const feedClasses = 'p-4 bg-orange-900/20 border border-orange-600/30 rounded-lg';
  
  const classes = variant === 'feed' 
    ? `${baseClasses} ${feedClasses} ${className}`
    : `${baseClasses} ${className}`;

  const message = variant === 'feed'
    ? 'Opinions expressed are anonymous and unverified. Please use your judgment and report any inappropriate content.'
    : 'Opinions expressed are anonymous and unverified.';

  return (
    <div className={classes}>
      <p>{message}</p>
    </div>
  );
}