import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type Variant = 'primary' | 'secondary' | 'ghost'

function classes(variant: Variant, huge: boolean, block: boolean) {
  return [
    'btn',
    `btn--${variant}`,
    huge && 'btn--huge',
    block && 'btn--block',
  ]
    .filter(Boolean)
    .join(' ')
}

interface CommonProps {
  variant?: Variant
  huge?: boolean
  block?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  huge = false,
  block = false,
  children,
  className,
  ...rest
}: CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
    className?: string
  }) {
  return (
    <button
      className={[classes(variant, huge, block), className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </button>
  )
}

export function LinkButton({
  variant = 'primary',
  huge = false,
  block = false,
  children,
  ...rest
}: CommonProps & LinkProps) {
  return (
    <Link className={classes(variant, huge, block)} {...rest}>
      {children}
    </Link>
  )
}
