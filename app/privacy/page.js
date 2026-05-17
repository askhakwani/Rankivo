import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — Rankivo',
  description: 'Read the Privacy Policy for Rankivo, the AI Content and SEO platform.',
}

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: {updated}</p>

        <div className="space-y-8 text-gray-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p className="mb-2">We collect the following types of information:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account information:</strong> Name, email address, country, city, state, and phone number provided during signup</li>
              <li><strong>Content inputs:</strong> Topics, keywords, and settings you enter when generating content</li>
              <li><strong>Generated content:</strong> Content produced by our AI tools, stored in your content history</li>
              <li><strong>Usage data:</strong> Number of posts generated, plan type, and monthly usage counts</li>
              <li><strong>Technical data:</strong> Browser type, IP address, and cookies used to deliver the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p className="mb-2">We use your information to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide, maintain, and improve the Rankivo Service</li>
              <li>Enforce usage limits based on your subscription plan</li>
              <li>Store and display your content generation history</li>
              <li>Send account-related emails (verification, password reset)</li>
              <li>Respond to support inquiries and feedback</li>
              <li>Improve our AI models and platform features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Data Storage</h2>
            <p>Your data is stored securely using Supabase, a cloud database platform. All data is stored with encryption at rest and in transit. We do not sell your data to third parties. Your content history is associated with your user account and is only accessible to you.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Cookies</h2>
            <p>Rankivo uses cookies to maintain your session and remember your preferences. We display a cookie consent banner on first use. Declining cookies may limit functionality. We do not use advertising cookies or third-party tracking cookies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Third-Party Services</h2>
            <p className="mb-2">We use the following third-party services to deliver Rankivo:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Supabase</strong> — Authentication and database storage</li>
              <li><strong>Groq AI</strong> — AI model inference for content generation</li>
              <li><strong>Vercel</strong> — Hosting and deployment infrastructure</li>
            </ul>
            <p className="mt-2">Each of these services has their own privacy policies. We encourage you to review them.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Guest Users</h2>
            <p>If you use Rankivo without creating an account, we do not store any personally identifiable information. Guest-generated content is not saved to any database. We may log anonymized usage metrics for performance monitoring.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Your Rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access the data we hold about you</li>
              <li>Update or correct your account information at any time from Account Settings</li>
              <li>Delete your account and all associated data from Account Settings → Danger Zone</li>
              <li>Request a copy of your data by contacting us at support@rankivo.co</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Data Retention</h2>
            <p>We retain your account data and content history for as long as your account is active. When you delete your account, all profile data and content history is permanently removed. Anonymized, aggregated usage statistics may be retained for analytics purposes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Children's Privacy</h2>
            <p>Rankivo is not intended for users under the age of 13. We do not knowingly collect data from children. If you believe a child has provided personal data, please contact us and we will promptly delete it.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy periodically. We will update the "Last updated" date at the top of this page. Continued use of Rankivo after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Contact</h2>
            <p>For privacy concerns or data requests, contact us at <a href="mailto:support@rankivo.co" className="text-[#0D9488] hover:underline">support@rankivo.co</a>.</p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-4 text-sm text-gray-400">
          <Link href="/terms" className="hover:text-[#0D9488] transition-colors">Terms of Service</Link>
          <Link href="/" className="hover:text-[#0D9488] transition-colors">Back to Rankivo</Link>
        </div>
      </div>
    </div>
  )
}
