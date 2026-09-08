import type { CollectionConfig, PayloadRequest } from 'payload'
import { isAdminAccess } from '@/lib/access'
import {
  buildPasswordChangedEmail,
  buildPasswordResetEmail,
} from '@/lib/email-templates'
import {
  getPasswordChangeNotificationTargets,
  type PasswordChangeNotificationTarget,
} from '@/lib/auth-password-notification'
import {
  getResendAuthFromEmail,
  getResendReplyToEmail,
} from '@/lib/resend-mail'

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null

  const email = value.trim()
  return email || null
}

async function resolveNotificationEmail(
  target: PasswordChangeNotificationTarget,
  req: PayloadRequest
): Promise<string | null> {
  const resultEmail = normalizeEmail(target.email)
  if (resultEmail) return resultEmail
  if (target.id === undefined) return null

  try {
    const user = await req.payload.findByID({
      collection: 'users',
      id: target.id,
      depth: 0,
      overrideAccess: true,
      req,
      select: { email: true },
    })

    return normalizeEmail(user.email)
  } catch {
    req.payload.logger.error(
      '[Auth email] Password changed recipient could not be resolved.'
    )
    return null
  }
}

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    forgotPassword: {
      expiration: 30 * 60 * 1000,
      generateEmailHTML: ({ token } = {}) => {
        if (!token) {
          throw new Error('Password reset token was not generated.')
        }
        return buildPasswordResetEmail(token).html
      },
      generateEmailSubject: () => buildPasswordResetEmail('').subject,
    },
  },
  admin: {
    useAsTitle: 'email',
  },
  access: {
    // Only admins may create, edit, or delete other staff accounts (prevents a
    // low-privilege account from self-escalating or minting new admins).
    create: isAdminAccess,
    update: isAdminAccess,
    delete: isAdminAccess,
  },
  hooks: {
    afterOperation: [
      async ({ args, operation, req, result }) => {
        const targets = getPasswordChangeNotificationTargets({
          args,
          operation,
          result,
        })
        if (targets.length === 0) return result

        const resolvedEmails = await Promise.all(
          targets.map((target) => resolveNotificationEmail(target, req))
        )
        const emails = Array.from(
          new Set(
            resolvedEmails.filter((email): email is string => email !== null)
          )
        )
        if (emails.length === 0) return result

        const message = buildPasswordChangedEmail()
        await Promise.all(
          emails.map(async (email) => {
            try {
              await req.payload.sendEmail({
                to: email,
                from: getResendAuthFromEmail(),
                replyTo: getResendReplyToEmail(),
                subject: message.subject,
                html: message.html,
                text:
                  "Le mot de passe de votre compte d'administration Ossa Bois France vient d'être modifié. Si vous n'êtes pas à l'origine de cette opération, contactez immédiatement la personne responsable de la plateforme et sécurisez votre compte.",
              })
            } catch {
              // The password operation has already succeeded. Never fail it
              // because a secondary alert failed, and never log account PII.
              req.payload.logger.error(
                '[Auth email] Password changed notification could not be sent.'
              )
            }
          })
        )

        return result
      },
    ],
  },
  fields: [
    // Email and password are added by default by auth: true
    {
      // Stored as a plain varchar column (not a Postgres enum) so the migration
      // and any manual DB apply stay trivially safe and portable. Access checks
      // compare against the exact strings 'admin' / 'editor'; any other value is
      // treated as non-admin (fail-safe deny).
      name: 'role',
      type: 'text',
      required: true,
      defaultValue: 'admin',
      // Only admins can change roles (no self-promotion). Everyone can read
      // their own role via the JWT.
      access: {
        update: isAdminAccess,
      },
      saveToJWT: true,
      validate: (val: string | null | undefined) =>
        val === 'admin' || val === 'editor' || 'Role must be "admin" or "editor".',
      admin: {
        description:
          'Values: "admin" (full access incl. Orders PII + pricing) or "editor" (restricted).',
      },
    },
  ],
}
