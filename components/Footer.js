import Link from 'next/link'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Logo size="md" animate={false} />
            <p className="text-gray-400 text-sm mt-3 leading-relaxed">AI-powered content and SEO platform for modern marketers.</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Product</p>
            <div className="space-y-2">
              {[['/#features','Features'],['/#pricing','Pricing'],['/upgrade','Plans'],['/dashboard','Dashboard']].map(([h,l])=>(
                <Link key={h} href={h} className="block text-sm text-gray-400 hover:text-[#1B5FA8] transition-colors">{l}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Company</p>
            <div className="space-y-2">
              {[['/about','About Us'],['/blog','Blog'],['/faq','FAQ'],['/contact','Contact']].map(([h,l])=>(
                <Link key={h} href={h} className="block text-sm text-gray-400 hover:text-[#1B5FA8] transition-colors">{l}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Legal</p>
            <div className="space-y-2">
              {[['/privacy','Privacy Policy'],['/terms','Terms of Service']].map(([h,l])=>(
                <Link key={h} href={h} className="block text-sm text-gray-400 hover:text-[#1B5FA8] transition-colors">{l}</Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-gray-400 text-sm">© 2026 RANKIVO. All rights reserved.</p>
          <p className="text-gray-400 text-sm">AI Content & SEO Platform</p>
        </div>
      </div>
    </footer>
  )
}
