'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const content = ((formData.get('content') as string) || '').trim();
  const imageFile = formData.get('image') as File | null;

  const hasImage = Boolean(imageFile && imageFile.size > 0);

  // Guard against posting empty text and empty images
  if (!content && !hasImage) {
    return;
  }

  let imageUrl: string | null = null;

  if (hasImage && imageFile) {
    const fileExt = imageFile.name.split('.').pop() || 'jpg';
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from('MEDIA')
      .upload(fileName, buffer, {
        contentType: imageFile.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload Error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('MEDIA')
      .getPublicUrl(fileName);

    imageUrl = publicUrlData.publicUrl;
  }

  const { error: insertError } = await supabase.from('posts').insert({
    user_id: user.id,
    content: content,
    image_url: imageUrl,
  });

  if (insertError) {
    console.error('Insert Error:', insertError);
    throw new Error(`Post creation failed: ${insertError.message}`);
  }

  revalidatePath('/');
}

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: email.split('@')[0],
      },
    },
  });

  if (error) throw new Error(error.message);

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function deletePost(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const postId = formData.get('postId') as string;
  if (!postId) return;

  // RLS will ensure users can only delete their own posts
  await supabase.from('posts').delete().match({ id: postId, user_id: user.id });

  revalidatePath('/');
}

export async function toggleLike(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const postId = formData.get('postId') as string;
  if (!postId) return;

  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .match({ post_id: postId, user_id: user.id })
    .maybeSingle();

  if (existingLike) {
    await supabase.from('likes').delete().match({ id: existingLike.id });
  } else {
    await supabase.from('likes').insert({ post_id: postId, user_id: user.id });

    // Look up the post owner to notify them
    const { data: post } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    if (post && post.user_id !== user.id) {
      await supabase.from('notifications').insert({
        recipient_id: post.user_id,
        actor_id: user.id,
        type: 'like',
        post_id: postId,
      });
    }
  }

  revalidatePath('/');
}

export async function createComment(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const postId = formData.get('postId') as string;
  const content = ((formData.get('content') as string) || '').trim();

  if (!postId || !content) return;

  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    user_id: user.id,
    content: content,
  });

  if (error) {
    throw new Error(`Comment failed: ${error.message}`);
  }

  // Look up post author and trigger notification
  const { data: post } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .single();

  if (post && post.user_id !== user.id) {
    await supabase.from('notifications').insert({
      recipient_id: post.user_id,
      actor_id: user.id,
      type: 'comment',
      post_id: postId,
    });
  }

  revalidatePath('/');
  revalidatePath('/[username]', 'page');
}

export async function toggleFollow(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const targetUserId = formData.get('targetUserId') as string;
  const username = formData.get('username') as string;

  if (!targetUserId || targetUserId === user.id) return;

  const { data: existingFollow } = await supabase
    .from('follows')
    .select('id')
    .match({ follower_id: user.id, following_id: targetUserId })
    .maybeSingle();

  if (existingFollow) {
    await supabase.from('follows').delete().match({ id: existingFollow.id });
  } else {
    await supabase.from('follows').insert({
      follower_id: user.id,
      following_id: targetUserId,
    });

    // Notify followed account
    await supabase.from('notifications').insert({
      recipient_id: targetUserId,
      actor_id: user.id,
      type: 'follow',
    });
  }

  if (username) {
    revalidatePath(`/${username}`);
  }
  revalidatePath('/');
}

export async function deleteComment(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const commentId = formData.get('commentId') as string;
  if (!commentId) return;

  const { error } = await supabase
    .from('comments')
    .delete()
    .match({ id: commentId, user_id: user.id });

  if (error) {
    throw new Error(`Failed to delete comment: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/[username]', 'page');
}

export async function toggleBookmark(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const postId = formData.get('postId') as string;
  if (!postId) return;

  const { data: existingBookmark } = await supabase
    .from('bookmarks')
    .select('id')
    .match({ user_id: user.id, post_id: postId })
    .maybeSingle();

  if (existingBookmark) {
    await supabase.from('bookmarks').delete().match({ id: existingBookmark.id });
  } else {
    await supabase.from('bookmarks').insert({
      user_id: user.id,
      post_id: postId,
    });
  }

  revalidatePath('/');
  revalidatePath('/bookmarks');
  revalidatePath('/explore');
}

