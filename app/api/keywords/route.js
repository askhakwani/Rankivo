import { createClient } from '../../../lib/supabase'
import { PLANS } from '../../../lib/plans'
import { getUserUsage, incrementSearch, deductCredit } from '../../../lib/usageTracker'
import { generateWithFallback } from '../../../lib/groq-helper'

function detectIntent(keyword) {
  const kw = keyword.toLowerCase()
  if (/^(how|what|why|when|where|who|which|is|are|does|do|can|should)\b/.test(kw)) return 'Informational'
  if (/\b(buy|purchase|order|price|cheap|deal|discount|coupon|shop)\b/.test(kw)) return 'Transactional'
  if (/\b(best|top|review|vs|compare|alternative|recommend)\b/.test(kw)) return 'Commercial'
  return 'Navigational'
}

function generateMockData(keyword, index) {
  const seed = keyword.length + index
  const volume = [100, 500, 1000, 2500, 5000, 10000, 25000, 50000][seed % 8]
  const cpc = parseFloat((0.5 + (seed % 20) * 0.5).toFixed(2))
  const difficulty = 10 + (seed % 9) * 10
  const competition = difficulty < 40 ? 'Low' : difficulty < 70 ? 'Medium' : 'High'
  const intent = detectIntent(keyword)
  const trend = Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
    volume: Math.max(50, volume + Math.floor(Math.sin(i + seed) * volume * 0.3))
  }))
  return { keyword, volume, cpc, difficulty, competition, intent, trend }
}

function clusterKeywords(keywords) {
  const clusters = {}
  keywords.forEach(kw => {
    const words = kw.keyword.split(' ')
    const root = words.slice(0, 2).join(' ')
    if (!clusters[root]) clusters[root] = []
    clusters[root].push(kw.keyword)
  })
  return clusters
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { seeds, url } = body

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!seeds || seeds.length === 0) return Response.json({ error: 'No keywords provided' }, { status: 400 })

    let plan = 'free'
    let usage = null
    let chargeAction = null // 'search' | 'credit' -- charged only AFTER the AI call succeeds

    if (user) {
      usage = await getUserUsage(user.id)
      plan = usage?.plan || 'free'
      const planLimits = PLANS[plan]
      const searchesToday = usage?.searches_today || 0
      const credits = usage?.credits || 0

      if (searchesToday >= planLimits.searchesPerDay) {
        if (credits > 0) {
          chargeAction = 'credit'
        } else {
          return Response.json({
            error: 'LIMIT_REACHED',
            message: `You've reached your ${planLimits.searchesPerDay} daily searches on the ${plan} plan. Upgrade to Pro for 100 searches/day, or buy extra credits.`,
            upgrade: true,
            searchesUsed: searchesToday,
            searchesLimit: planLimits.searchesPerDay,
            credits: 0,
          }, { status: 403 })
        }
      } else {
        chargeAction = 'search'
      }
    }

    const maxKeywords = PLANS[plan].keywordsPerSearch
    const seedList = seeds.map(s => s.trim()).filter(Boolean).join(', ')

    const prompt = `You are a keyword research expert. For the seed keyword(s): "${seedList}"${url ? ` and website: ${url}` : ''}, generate exactly 30 related keywords in this JSON format only, no explanation:
{"keywords":["kw1","kw2","kw3","kw4","kw5","kw6","kw7","kw8"],"questions":["how to kw1","what is kw2","why use kw3","when to kw4","which kw5 is best","how does kw6 work","what are kw7 benefits","how to choose kw8"],"buying":["best kw1","buy kw2","top kw3","kw4 price","kw5 review","kw6 deal","kw7 vs kw8","cheap kw1"],"longtail":["kw1 for beginners","how to kw2 fast","kw3 step by step","kw4 complete guide","kw5 tips and tricks","kw6 for small business","kw7 without experience","kw8 in 2026"]}
Return only valid JSON. No markdown. No explanation.`

    const completion = await generateWithFallback({
      messages: [{ role: 'user', content: prompt }],
      model: 'openai/gpt-oss-20b',
      temperature: 0,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    })

    let text = completion.choices[0]?.message?.content || ''
    text = text.replace(/```json|```/g, '').trim()
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')
    text = text.substring(jsonStart, jsonEnd + 1)

    let parsed
    try {
      parsed = JSON.parse(text)
    } catch (parseError) {
      console.error('Keyword research JSON parse failed. Raw text:', text)
      return Response.json(
        { error: 'Failed: the AI response was incomplete. Please try again.' },
        { status: 500 }
      )
    }

    // AI call succeeded and JSON parsed -- now charge the user
    if (user && chargeAction === 'credit') await deductCredit(user.id)
    else if (user && chargeAction === 'search') await incrementSearch(user.id)

    const allKeywords = [
      ...(parsed.keywords || []),
      ...(parsed.questions || []),
      ...(parsed.buying || []),
      ...(parsed.longtail || []),
    ].slice(0, maxKeywords)

    const results = allKeywords.map((kw, i) => generateMockData(kw, i))
    const clusters = clusterKeywords(results)

    const grouped = {
      all: results,
      questions: (parsed.questions || []).slice(0, maxKeywords).map((kw, i) => generateMockData(kw, i)),
      buying: (parsed.buying || []).slice(0, maxKeywords).map((kw, i) => generateMockData(kw, i + 10)),
      longtail: (parsed.longtail || []).slice(0, maxKeywords).map((kw, i) => generateMockData(kw, i + 20)),
      lowCompetition: results.filter(k => k.competition === 'Low'),
    }

    const updatedUsage = user ? await getUserUsage(user.id) : null
    const searchesRemaining = user
      ? Math.max(0, PLANS[plan].searchesPerDay - (updatedUsage?.searches_today || 0))
      : PLANS.free.searchesPerDay - 1

    return Response.json({
      results, grouped, clusters,
      plan,
      searchesRemaining,
      credits: updatedUsage?.credits || 0,
    })

  } catch (error) {
    console.error('Keyword error:', error)
    return Response.json({ error: 'Failed: ' + error.message }, { status: 500 })
  }
}
