import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

/**
 * Calls Groq with automatic fallback to a secondary model if the
 * primary model is rate-limited (HTTP 429) or unavailable.
 * Throws a clean, user-friendly Error if both attempts fail.
 *
 * @param {object} params - same shape as groq.chat.completions.create()
 * @param {string} fallbackModel - model to retry with if primary fails
 */
export async function generateWithFallback(params, fallbackModel = 'qwen/qwen3.6-27b') {
  try {
    return await groq.chat.completions.create(params)
  } catch (error) {
    const isRateLimit = error?.status === 429
    const isServerIssue = error?.status >= 500
    const isModelIssue = error?.error?.code === 'model_not_found'

    if ((isRateLimit || isServerIssue || isModelIssue) && params.model !== fallbackModel) {
      console.warn(`Primary model "${params.model}" failed (${error?.status || 'unknown'}), retrying with fallback "${fallbackModel}"`)
      try {
        return await groq.chat.completions.create({ ...params, model: fallbackModel })
      } catch (fallbackError) {
        throw friendlyError(fallbackError)
      }
    }

    throw friendlyError(error)
  }
}

function friendlyError(error) {
  if (error?.status === 429) {
    return new Error('We\'re experiencing high demand right now. Please try again in a minute.')
  }
  if (error?.status >= 500) {
    return new Error('Our AI provider is temporarily unavailable. Please try again shortly.')
  }
  return new Error(error?.message || 'Something went wrong. Please try again.')
}
