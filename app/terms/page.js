import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — Rankivo',
  description: 'Read the Terms of Service for Rankivo, the AI Content and SEO platform.',
}

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: {updated}</p>

        <div className="space-y-8 text-gray-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Rankivo ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service. These terms apply to all users, including guests and registered accounts.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Description of Service</h2>
            <p>Rankivo is an AI-powered content and SEO platform that helps users generate blog posts, social media captions, email content, ad copy, and other digital content. The Service uses third-party AI models to generate content based on your inputs.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. User Accounts</h2>
            <p className="mb-2">To access certain features, you must create an account. You are responsible for:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activity that occurs under your account</li>
              <li>Providing accurate and complete registration information</li>
              <li>Notifying us immediately of any unauthorized access to your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Acceptable Use</h2>
            <p className="mb-2">You agree not to use Rankivo to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Generate content that is illegal, harmful, deceptive, or violates the rights of others</li>
              <li>Produce spam, misinformation, or content intended to deceive users</li>
              <li>Reverse-engineer, scrape, or abuse our infrastructure</li>
              <li>Circumvent usage limits or share account access with unauthorized users</li>
              <li>Generate content that infringes on intellectual property rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Content Ownership</h2>
            <p>You retain ownership of the content you input into Rankivo. Generated content may be used for personal or commercial purposes after creation. We do not claim ownership of your generated outputs, however you are responsible for how you use them.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Usage Limits and Plans</h2>
            <p>Free accounts may include limited usage per month. Paid plans provide higher usage limits. Usage resets monthly. We reserve the right to modify plan features or enforce fair usage limits.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Payments, Billing & Subscription</h2>
            <p className="mb-2">Rankivo offers both free and paid subscription plans. Paid subscriptions are billed on a recurring basis (monthly or annually depending on the selected plan).</p>
            <p className="mb-2">Users authorize recurring charges at the time of subscription purchase. Billing continues until the subscription is canceled.</p>
            <p className="mb-2">Users may cancel their subscription at any time from their account settings. After cancellation, access will remain active until the end of the current billing period.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Refund Policy</h2>
            <p className="mb-2">Due to the nature of digital services, we generally do not offer refunds for partial subscription periods or unused time.</p>
            <p className="mb-2">Refund requests may be considered on a case-by-case basis in cases such as technical issues, duplicate charges, or billing errors.</p>
            <p>Approved refunds will be processed through the original payment method and may take several business days to complete.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Disclaimer of Warranties</h2>
            <p>The Service is provided "as is" without warranties of any kind. We do not guarantee accuracy or reliability of AI-generated content. Users are responsible for reviewing outputs before use.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Rankivo shall not be liable for any indirect or consequential damages. Total liability is limited to the amount paid by the user in the last 12 months.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Termination</h2>
            <p>We may suspend or terminate accounts for violations of these terms. Users may delete their account at any time.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Changes to Terms</h2>
            <p>We may update these Terms from time to time. Continued use of Rankivo constitutes acceptance of updated terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">13. Contact</h2>
            <p>For questions, contact us at <a href="mailto:support@rankivo.co" className="text-[#0D9488] hover:underline">support@rankivo.co</a>.</p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-4 text-sm text-gray-400">
          <Link href="/privacy" className="hover:text-[#0D9488] transition-colors">Privacy Policy</Link>
          <Link href="/" className="hover:text-[#0D9488] transition-colors">Back to Rankivo</Link>
        </div>
      </div>
    </div>
  )
}
