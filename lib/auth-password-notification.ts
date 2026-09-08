export type PasswordChangeNotificationTarget = {
  email?: string
  id?: number | string
}

type PasswordChangeHookInput = {
  args: unknown
  operation: string
  result: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined

  const normalized = value.trim()
  return normalized || undefined
}

function getID(value: unknown): number | string | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  return getString(value)
}

function toTarget(
  value: unknown,
  fallbackID?: number | string
): PasswordChangeNotificationTarget | null {
  if (!isRecord(value)) {
    return fallbackID === undefined ? null : { id: fallbackID }
  }

  const email = getString(value.email)
  const id = getID(value.id) ?? fallbackID

  if (!email && id === undefined) return null

  const target: PasswordChangeNotificationTarget = {}
  if (email) target.email = email
  if (id !== undefined) target.id = id
  return target
}

/**
 * Mirrors Payload's direct-password update condition: an update only writes a
 * new password when the incoming value is a non-empty string.
 */
export function hasDirectPasswordUpdate(args: unknown): boolean {
  if (!isRecord(args) || !isRecord(args.data)) return false

  return (
    Object.prototype.hasOwnProperty.call(args.data, 'password') &&
    typeof args.data.password === 'string' &&
    args.data.password.length > 0
  )
}

/**
 * Returns only users whose password operation has completed successfully.
 * Reset-password is a separate Payload operation; direct admin/API edits are
 * updateByID (or update for bulk edits), so the branches cannot double-send.
 */
export function getPasswordChangeNotificationTargets({
  args,
  operation,
  result,
}: PasswordChangeHookInput): PasswordChangeNotificationTarget[] {
  if (operation === 'resetPassword') {
    if (!isRecord(result)) return []

    const target = toTarget(result.user)
    return target ? [target] : []
  }

  if (!hasDirectPasswordUpdate(args)) return []

  if (operation === 'updateByID') {
    const fallbackID = isRecord(args) ? getID(args.id) : undefined
    const target = toTarget(result, fallbackID)
    return target ? [target] : []
  }

  if (operation === 'update') {
    if (!isRecord(result) || !Array.isArray(result.docs)) return []

    return result.docs
      .map((doc) => toTarget(doc))
      .filter(
        (target): target is PasswordChangeNotificationTarget => target !== null
      )
  }

  return []
}
