import { Post as PostData, User } from '@prisma/client'
import Link from 'next/link';
import UserAvatar from '../UserAvatar';
import { formateRelativeDate } from '@/lib/utils';

interface postProps {
    post: {
        id: string;
        content: string;
        userId: string;
        createdAt: Date;
        user: {
          username: string;
          displayName: string;
          avatarUrl: string | null;
        };
      };// Correctly type the post with the user
}

const Post = ({post}: postProps) => {
  return (
    <article className='space-y-3 rounded-2xl bg-card p-5 shadow-sm'>
        <div className='flex flex-wrap gap-3'>
            <Link href={`/users/${post.user.username}`}>
            <UserAvatar avatarUrl={post.user.avatarUrl} />
            </Link>
        <div>
            <Link
            href={`/users/${post.user.username}`}
            className='block font-medium hover:underline'
            >
                {post.user.displayName}
            </Link>
            <Link href={`/posts/${post.id}`} className='block text-sm text-muted-foreground hover:underline'>
            {formateRelativeDate(post.createdAt)}
            </Link>
        </div>
        </div>
        <div className='whitespace-pre-line break-words'>
            {post.content}
        </div>
    </article>
  )
}

export default Post