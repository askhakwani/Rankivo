/**
 * fix-broken-links.js
 *
 * Finds and fixes 21 known broken internal blog links inside the
 * `content` column of the `blog_posts` table in Supabase.
 *
 * SAFETY:
 *   - Runs in DRY RUN mode by default — shows what WOULD change,
 *     writes nothing.
 *   - To actually apply the fixes, run with --apply
 *
 * USAGE (PowerShell):
 *   node fix-broken-links.js              (dry run, shows changes only)
 *   node fix-broken-links.js --apply      (writes the fixes to Supabase)
 *
 * REQUIREMENTS:
 *   npm install @supabase/supabase-js --save
 *   Set these environment variables before running (PowerShell):
 *     $env:NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
 *     $env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const APPLY = process.argv.includes('--apply');

// Mapping: broken slug -> correct slug
const SLUG_FIXES = {
  'on-page-seo-for-beginners': 'on-page-seo-for-beginners-the-complete-2026-guide',
  'keywords-in-url-slug-seo': 'should-you-use-keywords-in-your-url-slug',
  'image-seo-optimization': 'image-seo-how-to-optimize-images-for-search-engines',
  'url-structure-for-seo': 'url-structure-for-seo-how-to-create-urls-that-rank',
  'what-is-alt-text-seo': 'what-is-alt-text-and-why-does-it-matter-for-seo',
  'on-page-seo-checklist': 'on-page-seo-checklist-for-beginners-2026',
  'how-to-check-keyword-competition': 'how-to-check-if-a-keyword-is-too-competitive-to-rank-for',
  'how-to-find-long-tail-keywords-for-free': 'how-to-find-long-tail-keywords-for-free-step-by-step',
  'types-of-search-intent': '4-types-of-search-intent-explained-with-examples',
  'match-content-to-search-intent': 'how-to-match-content-to-search-intent-and-rank-faster',
  'what-is-keyword-difficulty': 'what-is-keyword-difficulty-and-how-to-use-it',
  'keyword-research-mistakes-to-avoid': 'common-keyword-research-mistakes-to-avoid',
  'types-of-keywords-in-seo': 'types-of-keywords-in-seo-every-blogger-must-know',
  'buyer-intent-keywords': 'what-are-buyer-intent-keywords-and-how-to-find-them',
  'short-tail-vs-long-tail-keywords': 'short-tail-vs-long-tail-keywords-which-should-you-target',
  'why-keyword-research-is-important': 'why-keyword-research-is-important-for-seo',
  'what-is-search-intent': 'what-is-search-intent-and-why-it-determines-your-rankings',
  'how-to-find-low-competition-keywords': 'how-to-find-low-competition-keywords-for-a-new-website',
  'long-tail-keywords-for-beginners': 'long-tail-keywords-what-they-are-and-why-beginners-need-them',
  'best-free-keyword-research-tools': 'best-free-keyword-research-tools-in-2026-ranked-reviewed',
  'blog-without-keyword-research': 'what-happens-to-your-blog-without-keyword-research',
};

// Sort broken slugs by length descending so longer/more-specific slugs
// are replaced before shorter ones that could be substrings of them.
const sortedBrokenSlugs = Object.keys(SLUG_FIXES).sort((a, b) => b.length - a.length);

function fixContent(content) {
  let updated = content;
  let changeCount = 0;
  const changesInThisPost = [];

  for (const brokenSlug of sortedBrokenSlugs) {
    const correctSlug = SLUG_FIXES[brokenSlug];

    // Match href="/blog/broken-slug" or href="https://www.rankivo.co/blog/broken-slug"
    // Use word boundary equivalent: slug must be followed by a quote, not by more slug characters
    const pattern = new RegExp(
      `(href=["'])(?:https://www\\.rankivo\\.co)?/blog/${brokenSlug}(["'])`,
      'g'
    );

    const matches = [...updated.matchAll(pattern)];
    if (matches.length > 0) {
      updated = updated.replace(pattern, `$1/blog/${correctSlug}$2`);
      changeCount += matches.length;
      changesInThisPost.push({ from: brokenSlug, to: correctSlug, count: matches.length });
    }
  }

  return { updated, changeCount, changesInThisPost };
}

async function main() {
  console.log(APPLY ? '*** APPLY MODE — changes WILL be written ***\n' : '*** DRY RUN — no changes will be written ***\n');

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, content');

  if (error) {
    console.error('Failed to fetch posts:', error.message);
    process.exit(1);
  }

  console.log(`Fetched ${posts.length} posts. Scanning for broken links...\n`);

  let totalPostsAffected = 0;
  let totalLinksFixed = 0;
  const updates = [];

  for (const post of posts) {
    if (!post.content) continue;

    const { updated, changeCount, changesInThisPost } = fixContent(post.content);

    if (changeCount > 0) {
      totalPostsAffected++;
      totalLinksFixed += changeCount;

      console.log(`Post: "${post.title}" (slug: ${post.slug})`);
      changesInThisPost.forEach(c => {
        console.log(`  ${c.from}  ->  ${c.to}  (${c.count}x)`);
      });
      console.log('');

      updates.push({ id: post.id, content: updated });
    }
  }

  console.log('========================================');
  console.log(`Posts affected: ${totalPostsAffected}`);
  console.log(`Total links fixed: ${totalLinksFixed}`);
  console.log('========================================\n');

  if (!APPLY) {
    console.log('This was a dry run. No changes were written.');
    console.log('Review the output above, then re-run with --apply to write the fixes:');
    console.log('  node fix-broken-links.js --apply');
    return;
  }

  if (updates.length === 0) {
    console.log('Nothing to update.');
    return;
  }

  console.log('Writing fixes to Supabase...\n');

  for (const update of updates) {
    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({ content: update.content })
      .eq('id', update.id);

    if (updateError) {
      console.error(`  Failed to update post ${update.id}:`, updateError.message);
    } else {
      console.log(`  Updated post ${update.id}`);
    }
  }

  console.log('\nDone. All fixes applied.');
}

main().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
