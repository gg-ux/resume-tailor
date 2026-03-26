import { useTheme } from '../../context/ThemeContext'

export function Tag({ children, variant = 'default', color, className = '' }) {
  const { isDark } = useTheme()

  const variants = {
    default: isDark
      ? 'bg-white/[0.06] text-white/60'
      : 'bg-black/[0.04] text-black/60',
    muted: isDark
      ? 'bg-white/[0.04] text-white/40'
      : 'bg-black/[0.03] text-black/40',
    success: isDark
      ? 'bg-[#22C55E]/10 text-[#22C55E]'
      : 'bg-[#16A34A]/10 text-[#16A34A]',
    warning: isDark
      ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
      : 'bg-[#D97706]/10 text-[#D97706]',
    error: isDark
      ? 'bg-[#EF4444]/10 text-[#EF4444]'
      : 'bg-[#DC2626]/10 text-[#DC2626]',
  }

  const colorStyle = color ? {
    backgroundColor: `${color}15`,
    color: color,
  } : {}

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-1
        font-mono text-[10px] uppercase tracking-wide
        rounded-md
        ${color ? '' : variants[variant]}
        ${className}
      `}
      style={colorStyle}
    >
      {children}
    </span>
  )
}

export default Tag
