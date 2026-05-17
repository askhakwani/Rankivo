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
              <li>Reverse-engineer, scrape, or abuse our API or infrastructure</li>
              <li>Circumvent usage limits or share account access with unauthorized users</li>
              <li>Generate content that infringes on intellectual property rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Content Ownership</h2>
            <p>You retain ownership of the content you input into Rankivo. For AI-generated content, once generated and delivered to you, you may use it for personal or commercial purposes. Rankivo does not claim ownership over content you generate using our tools. However, we are not responsible for how you use generated content.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Usage Limits and Plans</h2>
            <p>Rankivo operates on a tiered subscription model. Free accounts receive 3 posts per month. Paid plans provide higher limits. Usage resets monthly. We reserve the right to enforce limits, modify plan features, or suspend accounts that abuse the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Disclaimer of Warranties</h2>
            <p>The Service is provided "as is" without warranties of any kind. Rankivo does not guarantee that AI-generated content is accurate, complete, or suitable for any specific purpose. You are responsible for reviewing and editing all generated content before publication.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Rankivo shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid to us in the 12 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Termination</h2>
            <p>We reserve the right to suspend or terminate your account at our discretion for violations of these terms, abuse of the Service, or any other reason with or without notice. You may delete your account at any time from Account Settings.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Changes to Terms</h2>
            <p>We may update these Terms of Service from time to time. Continued use of Rankivo after changes constitutes acceptance of the revised terms. We will note the "Last updated" date at the top of this page when changes are made.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Contact</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:support@rankivo.co" className="text-[#0D9488] hover:underline">support@rankivo.co</a>.</p>
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
