import React from 'react';

const PostSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
  if (count > 1) {
    return <>{Array.from({ length: count }, (_, index) => <PostSkeleton key={index} />)}</>;
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        {/* Author skeleton */}
        <div className="h-4 bg-gray-700 rounded w-32"></div>
        {/* Date skeleton */}
        <div className="h-4 bg-gray-700 rounded w-24"></div>
      </div>
      {/* Content skeleton */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-700 rounded w-4/6"></div>
      </div>
      {/* Actions skeleton */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-16 bg-gray-700 rounded"></div>
          <div className="h-8 w-16 bg-gray-700 rounded"></div>
        </div>
        <div className="h-8 w-24 bg-gray-700 rounded"></div>
      </div>
    </div>
  );
};

export default PostSkeleton;
