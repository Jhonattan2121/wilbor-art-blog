'use client';

import { useState } from 'react';
import { BiEdit, BiTrash } from 'react-icons/bi';
import HivePostModal from './HivePostModal';

interface PostActionsProps {
  post: {
    author: string;
    permlink: string;
    title: string;
    body: string;
    json_metadata: string;
  };
  onDelete?: () => void;
}

export default function PostActions({ post, onDelete }: PostActionsProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    if (typeof window === 'undefined' || !window.hive_keychain) {
      alert('Please install Hive Keychain to delete posts');
      return;
    }

    const operations = [
      ["delete_comment", {
        "author": post.author,
        "permlink": post.permlink
      }]
    ];

    window.hive_keychain.requestBroadcast(
      post.author,
      operations,
      'posting',
      (response: any) => {
        if (response.success) {
          alert('Post deleted successfully!');
          onDelete?.();
        } else {
          alert('Error deleting post: ' + response.message);
        }
      }
    );
  };

  return (
    <>
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="p-2 rounded-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
          title="Edit post"
        >
          <BiEdit size={20} className="text-gray-700 dark:text-gray-300" />
        </button>
        <button
          onClick={handleDelete}
          className="p-2 rounded-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-lg hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
          title="Delete post"
        >
          <BiTrash size={20} className="text-red-500" />
        </button>
      </div>

      <HivePostModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editPost={post}
      />
    </>
  );
} 