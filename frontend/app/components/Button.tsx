import { type ButtonHTMLAttributes, forwardRef, type MouseEventHandler } from 'react'
import Link from 'next/link'

type Variant = 'primary' | 'outline' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  href?: string
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>
}

const variantStyles: Record<Variant, string> = {
  primary:
    'rounded-full gap-2 flex items-center justify-center bg-primary px-8 py-4 font-semibold text-white shadow-sm transition-all hover:not-disabled:brightness-90 hover:not-disabled:scale-[0.975] active:not-disabled:scale-90 disabled:cursor-not-allowed disabled:opacity-50',
  outline:
    'rounded-full gap-2 flex items-center justify-center border-2 border-primary px-8 py-4 font-semibold text-primary transition-colors hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-50',
  ghost: 'underline underline-offset-4 gap-2 flex items-center justify-center text-muted transition-colors hover:text-text',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', href, className = '', children, onClick, ...props }, ref) => {
    const styles = `${variantStyles[variant]} ${className}`

    if (href) {
      return (
        <Link href={href} className={styles} onClick={onClick as MouseEventHandler<HTMLAnchorElement>}>
          {children}
        </Link>
      )
    }

    return (
      <button ref={ref} className={styles} onClick={onClick} {...props}>
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
