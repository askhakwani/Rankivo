'use client'
export default function Logo({ size = 'md', animate = true }) {
  const sizes = {
    sm: { text: 'text-lg', dot: 'w-2 h-2', wrapper: 'gap-1.5' },
    md: { text: 'text-2xl', dot: 'w-2.5 h-2.5', wrapper: 'gap-2' },
    lg: { text: 'text-4xl', dot: 'w-3.5 h-3.5', wrapper: 'gap-2.5' },
  }
  const s = sizes[size] || sizes.md
  return (
    <span className={`inline-flex items-center ${s.wrapper} group cursor-default select-none`}>
      <span className={`relative flex ${s.dot}`}>
        <span className={`${animate ? 'animate-ping' : ''} absolute inline-flex h-full w-full rounded-full bg-[#0D9488] opacity-30`}></span>
        <span className={`relative inline-flex rounded-full ${s.dot} bg-[#0D9488]`}></span>
      </span>
      <span className={`font-extrabold tracking-tight ${s.text}`}>
        <span className="text-[#1B5FA8] group-hover:text-[#0D9488] transition-colors duration-300">RANK</span><span className="text-[#0D9488] group-hover:text-[#C9943A] transition-colors duration-300">IVO</span>
      </span>
    </span>
  )
}
