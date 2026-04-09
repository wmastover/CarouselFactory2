import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-neutral-900 text-white hover:bg-neutral-700 active:scale-95',
        outline: 'border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 active:scale-95',
        ghost: 'text-neutral-700 hover:bg-neutral-100 active:scale-95',
        active: 'bg-neutral-900 text-white border border-neutral-900 active:scale-95',
      },
      size: {
        default: 'h-10 rounded-full px-5 py-2',
        sm: 'h-8 rounded-full px-4 py-1.5 text-xs',
        lg: 'h-11 rounded-full px-6',
        icon: 'h-9 w-9 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export function Button({ className, variant, size, ...props }) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
