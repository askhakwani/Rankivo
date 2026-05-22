import { createClient } from '@supabase/supabase-js'

// ── Plan mapping from Paddle Price IDs ───────────────────────────────────────
const PRICE_TO_PLAN = {
  'pri_01ks8qhk18m3mgm9vtd0tm1185': 'starter',
  'pri_01ks8qn13dp9ryh2zgeenyt9dw': 'pro',
  'pri_01ks8rmgkpjqxeh4m0y6zq0g31': 'agency',
}

// ── Credit mapping from Paddle Price IDs ─────────────────────────────────────
const PRICE_TO_CREDITS = {
  'pri_01ks8skffm6dhrbcybv50g16d5': { type: 'post_credits',   amount: 10  },
  'pri_01ks8sh6529ypn8qxyqgp165qj': { type: 'post_credits',   amount: 50  },
  'pri_01ks8sr66ypmegqvec2j4ry2gj': { type: 'search_credits', amount: 100 },
  'pri_01ks8spsgfnrd7bktgr6193jve': { type: 'search_credits', amount: 500 },
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// ── Verify Paddle webhook signature ──────────────────────────────────────────
async function verifyPaddleSignature(request, rawBody) {
  const signature = request.headers.get('paddle-signature')
  if (!signature) return false

  const secret = process.env.PADDLE_WEBHOOK_SECRET
  if (!secret) return false

  try {
    const [tsPart, h1Part] = signature.split(';')
    const ts = tsPart.replace('ts=', '')
    const h1 = h1Part.replace('h1=', '')

    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const signedPayload = `${ts}:${rawBody}`
    const signatureBytes = hexToBytes(h1)

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      encoder.encode(signedPayload)
    )

    return valid
  } catch (e) {
    console.error('Signature verification error:', e)
    return false
  }
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return bytes
}

// ── Main webhook handler ──────────────────────────────────────────────────────
export async function POST(request) {
  const rawBody = await request.text()

  // Verify signature
  const isValid = await verifyPaddleSignature(request, rawBody)
  if (!isValid) {
    console.error('Invalid Paddle webhook signature')
    return Response.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event
  try {
    event = JSON.parse(rawBody)
  } catch (e) {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const admin = adminClient()
  const eventType = event.event_type
  const data = event.data

  console.log('Paddle webhook:', eventType)

  try {
    switch (eventType) {

      // ── Subscription activated (new subscriber) ───────────────────────────
      case 'subscription.activated': {
        const userId  = data.custom_data?.userId
        const priceId = data.items?.[0]?.price?.id
        const plan    = PRICE_TO_PLAN[priceId]

        if (!userId || !plan) {
          console.error('Missing userId or plan:', { userId, priceId })
          break
        }

        await admin.from('profiles').update({
          plan,
          paddle_subscription_id: data.id,
          paddle_customer_id:     data.customer_id,
          subscription_status:    'active',
        }).eq('id', userId)

        console.log(`✅ Subscription activated: ${userId} → ${plan}`)
        break
      }

      // ── Subscription updated (plan change) ───────────────────────────────
      case 'subscription.updated': {
        const subId   = data.id
        const priceId = data.items?.[0]?.price?.id
        const plan    = PRICE_TO_PLAN[priceId]

        if (!plan) break

        await admin.from('profiles').update({
          plan,
          subscription_status: data.status,
        }).eq('paddle_subscription_id', subId)

        console.log(`✅ Subscription updated: ${subId} → ${plan}`)
        break
      }

      // ── Subscription cancelled ────────────────────────────────────────────
      case 'subscription.canceled': {
        const subId = data.id

        await admin.from('profiles').update({
          plan:                'free',
          subscription_status: 'cancelled',
          paddle_subscription_id: null,
        }).eq('paddle_subscription_id', subId)

        console.log(`✅ Subscription cancelled: ${subId} → free`)
        break
      }

      // ── One-time payment (credit packs) ───────────────────────────────────
      case 'transaction.completed': {
        const userId  = data.custom_data?.userId
        const priceId = data.items?.[0]?.price?.id
        const credit  = PRICE_TO_CREDITS[priceId]

        if (!userId || !credit) {
          // Could be a subscription transaction — not an error
          console.log('Transaction completed (subscription or unknown price):', priceId)
          break
        }

        // Fetch current credits and add
        const { data: profile } = await admin
          .from('profiles')
          .select(credit.type)
          .eq('id', userId)
          .single()

        const current = profile?.[credit.type] || 0
        await admin.from('profiles').update({
          [credit.type]: current + credit.amount,
        }).eq('id', userId)

        console.log(`✅ Credits added: ${userId} +${credit.amount} ${credit.type}`)
        break
      }

      // ── Payment failed ────────────────────────────────────────────────────
      case 'subscription.payment_failed': {
        const subId = data.id
        await admin.from('profiles').update({
          subscription_status: 'past_due',
        }).eq('paddle_subscription_id', subId)

        console.log(`⚠️ Payment failed: ${subId}`)
        break
      }

      default:
        console.log('Unhandled webhook event:', eventType)
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return Response.json({ error: 'Handler error' }, { status: 500 })
  }

  return Response.json({ received: true })
}
