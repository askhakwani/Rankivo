import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// gpt-oss models are reasoning models: keep reasoning short so the
// token budget goes to the actual JSON answer.
function buildParams(params, model) {
  const p = { ...params, model }
  if (model.startsWith('openai/gpt-oss')) {
    p.reasoning_effort = params.reasoning_effort || 'low'
  } else {
    delete p.reasoning_effort // other models may not support it
  }
  return p
}

function isJsonFailure(error) {
  return error?.status === 400 && String(error?.message || '').includes('json_validate_failed')
}

function isRetryable(error) {
  return (
    error?.status === 429 ||
    error?.status >= 500 ||
    isJsonFailure(error) ||
    error?.error?.code === 'model_not_found'
  )
}

/**
 * Calls Groq with retries:
 *  1. primary model
 *  2. primary again, only if the JSON output was empty/invalid
 *  3. fallback model
 * Throws a user-friendly Error if everything fails.
 */
export async function generateWithFallback(params, fallbackModel = 'qwen/qwen3.6-27b') {
  let lastError

  try {
    return await groq.chat.completions.create(buildParams(params, params.model))
  } catch (error) {
    lastError = error
  }

  if (!isRetryable(lastError)) throw friendlyError(lastError)
  console.warn(`Primary model "${params.model}" failed (${lastError?.status || 'unknown'})`)

  if (isJsonFailure(lastError)) {
    try {
      return await groq.chat.completions.create(buildParams(params, params.model))
    } catch (error) {
      lastError = error
    }
  }

  if (params.model !== fallbackModel) {
    try {
      console.warn(`Retrying with fallback "${fallbackModel}"`)
      return await groq.chat.completions.create(buildParams(params, fallbackModel))
    } catch (error) {
      lastError = error
    }
  }

  throw friendlyError(lastError)
}

function friendlyError(error) {
  if (error?.status === 429) {
    return new Error("We're experiencing high demand right now. Please try again in a minute.")
  }
  if (error?.status >= 500) {
    return new Error('Our AI provider is temporarily unavailable. Please try again shortly.')
  }
  if (isJsonFailure(error)) {
    return new Error('The AI returned an incomplete response. Please try again.')
  }
  return new Error('Something went wrong. Please try again.')
}