'use client'

import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  delay?: number
  y?: number
  duration?: number
  className?: string
  as?: 'div' | 'section' | 'span'
} & Omit<HTMLMotionProps<'div'>, 'children' | 'className'>

export function FadeIn({
  children,
  delay = 0,
  y = 16,
  duration = 0.35,
  className,
  as = 'div',
  ...rest
}: Props) {
  const reduce = useReducedMotion()
  const Component = as === 'section' ? motion.section : as === 'span' ? motion.span : motion.div

  if (reduce) {
    return (
      <Component className={className} {...rest}>
        {children}
      </Component>
    )
  }

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </Component>
  )
}
