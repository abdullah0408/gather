import PostEditor from '@/components/posts/editors/PostEditor'
import Post from '@/components/posts/Post';
import TrendsSidebar from '@/components/TrendsSidebar';
import prisma from '@/lib/prisma'
import React from 'react'

const page = async () => {
  const posts = await prisma.post.findMany({
    include: {
      user: {
        select: {
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <main className='w-full min-w-0 flex gap-5'>
      <div className='w-full min-w-0 space-y-5'>
        <PostEditor/>
        {posts.map(post => (
          <Post key={post.id} post={post}/>
        ))}
      </div>
      <TrendsSidebar/>
    </main>
  )
}

export default page