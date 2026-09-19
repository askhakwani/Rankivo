const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')

// Manually parse .env.local (no dotenv dependency needed)
let envContent = fs.readFileSync('.env.local', 'utf8').replace(/\r\n/g, '\n')
envContent = envContent.replace(/^\uFEFF/, '') // strip BOM if present
const env = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
  }
})

console.log('DEBUG - found URL:', env.NEXT_PUBLIC_SUPABASE_URL ? 'YES (' + env.NEXT_PUBLIC_SUPABASE_URL.slice(0,20) + '...)' : 'MISSING')
console.log('DEBUG - found KEY:', env.SUPABASE_SERVICE_ROLE_KEY ? 'YES (length ' + env.SUPABASE_SERVICE_ROLE_KEY.length + ')' : 'MISSING')

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
)

supabase
  .from('blog_posts')
  .select('slug, published, updated_at')
  .order('updated_at', { ascending: false })
  .limit(10)
  .then(r => console.log(JSON.stringify(r, null, 2)))
