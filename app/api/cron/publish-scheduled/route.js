import { createClient } from '@supabase/supabase-js';

export async function GET(request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from('blog_posts')
    .update({ published: true })
    .eq('published', false)
    .not('scheduled_at', 'is', null)
    .lte('scheduled_at', new Date().toISOString())
    .select('id, title');

  // Log this run to cron_logs, regardless of outcome
  await supabase.from('cron_logs').insert({
    published_count: data?.length || 0,
    success: !error,
    error_message: error?.message || null,
  });

  if (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }

  return Response.json({
    success: true,
    published_count: data?.length || 0,
    posts: data || [],
  });
}
