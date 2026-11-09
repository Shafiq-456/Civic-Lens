'use client'

import type { ComponentProps } from 'react'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

/** Tab identifiers for the administration portal shell. */
export type AdminTab = 'dashboard' | 'complaints' | 'records' | 'citizen' | 'monitoring' | 'audit'

/** Chip tone per administration role. */
export const ROLE_TONE: Record<string, string> = {
  ADMIN: 'teal',
  DEPT_OFFICER: 'amber',
  AUDITOR: 'slate',
}

/** Human-readable label for a role code. */
export function roleLabel(role: string): string {
  if (role === 'ADMIN') return 'Administrator'
  if (role === 'DEPT_OFFICER') return 'Department officer'
  if (role === 'AUDITOR') return 'Auditor'
  return role
}

type GuardedButtonProps = ComponentProps<typeof Button> & { canEdit: boolean }

/**
 * Button that is automatically disabled for read-only sessions (e.g. the auditor role).
 * While blocked it renders with a lock icon and a "Read-only session" tooltip.
 */
export function GuardedButton({ canEdit, disabled = false, children, ...props }: GuardedButtonProps) {
  if (canEdit) {
    return (
      <Button {...props} disabled={disabled}>
        {children}
      </Button>
    )
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* Wrapping span keeps the tooltip trigger interactive even though the button itself is disabled. */}
        <span className="inline-block cursor-not-allowed">
          <Button {...props} disabled aria-disabled tabIndex={-1}>
            <Lock className="h-3 w-3" aria-hidden />
            {children}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>Read-only session</TooltipContent>
    </Tooltip>
  )
}
