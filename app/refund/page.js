import Link from 'next/link'

export const metadata = {
  title: 'Refund Policy — Rankivo',
  description: 'Read the Refund Policy for Rankivo, the AI Content and SEO platform.',
}

export default function RefundPage() {
  const updated = 'June 1, 2025'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#1B5FA8]">RANKIVO</Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-[#0D9488] transition-colors">← Back to Home</Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Refund Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: {updated}</p>

        <div className="space-y-8 text-gray-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. General Policy</h2>
            <p>Due to the nature of digital services, Rankivo generally does not offer refunds for partial subscription periods or unused time remaining on an active subscription. By subscribing to a paid plan, you acknowledge and agree to this policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Exceptions</h2>
            <p className="mb-2">Refund requests may be considered on a case-by-case basis under the following circumstances:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Technical issues that prevented access to the Service</li>
              <li>Duplicate charges or accidental double billing</li>
              <li>Billing errors on our part</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Subscription Cancellations</h2>
            <p>You may cancel your subscription at any time from your account settings. Upon cancellation, you will retain access to your paid plan until the end of the current billing period. No partial refunds are issued for the remaining days in a billing cycle.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Pay-As-You-Go Credits</h2>
            <p>Credit packs purchased on a pay-as-you-go basis are non-refundable once purchased. Credits do not expire and can be used across all tools on the platform at any time.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. How to Request a Refund</h2>
            <p>To submit a refund request, please contact us at <a href="mailto:support@rankivo.co" className="text-[#0D9488] hover:underline">support@rankivo.co</a> with your account email and a brief description of the issue. We will review your request and respond within 3–5 business days.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Processing</h2>
            <p>Approved refunds will be processed through the original payment method and may take several business days to reflect in your account, depending on your bank or payment provider.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Contact</h2>
            <p>For any questions about this Refund Policy, reach out to us at <a href="mailto:support@rankivo.co" className="text-[#0D9488] hover:underline">support@rankivo.co</a>.</p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-4 text-sm text-gray-400">
          <Link href="/terms" className="hover:text-[#0D9488] transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-[#0D9488] transition-colors">Privacy Policy</Link>
          <Link href="/" className="hover:text-[#0D9488] transition-colors">Back to Rankivo</Link>
        </div>
      </div>
    </div>
  )
}
