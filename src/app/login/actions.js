'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '../../../utils/supabase/server'

const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
const MIN_PASSWORD_LENGTH = 8

function invalidCredentialsMessage(intent) {
  if (intent === 'signup') {
    return 'Could not create that account. Check your email and password.'
  }
  return 'Wrong email or password. Try again.'
}

function genericErrorMessage(intent) {
  if (intent === 'signup') {
    return 'Unable to create an account right now. Please try again.'
  }
  return 'Unable to sign you in right now. Please try again.'
}

export async function authenticate(_prevState, formData) {
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')
  const intent = formData.get('intent') === 'signup' ? 'signup' : 'login'

  if (!email || !password) {
    return { type: 'error', message: 'Email and password are required.' }
  }

  if (!emailPattern.test(email)) {
    return { type: 'error', message: 'Enter a valid email address.' }
  }

  if (intent === 'signup' && password.length < MIN_PASSWORD_LENGTH) {
    return { type: 'error', message: 'Password must be at least 8 characters long.' }
  }

  const supabase = await createClient()

  if (intent === 'signup') {
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      const loweredMessage = error.message?.toLowerCase() || ''

      if (loweredMessage.includes('registered') || error.status === 400) {
        return { type: 'error', message: invalidCredentialsMessage(intent) }
      }

      return { type: 'error', message: genericErrorMessage(intent) }
    }
  } else {
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      const loweredMessage = error.message?.toLowerCase() || ''

      if (error.status === 400 || loweredMessage.includes('invalid')) {
        return { type: 'error', message: invalidCredentialsMessage(intent) }
      }

      return { type: 'error', message: genericErrorMessage(intent) }
    }
  }

  revalidatePath('/', 'layout')
  redirect('/account')
}

export async function sendReset(prevState, formData) {
  const email = String(formData.get('resetEmail') || '').trim()
  const supabase = await createClient()

  if (!email) {
    return { type: 'error', message: 'Please enter your email.' }
  }

  if (!emailPattern.test(email)) {
    return { type: 'error', message: 'Enter a valid email address.' }
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : '')

  if (!siteUrl) {
    return { type: 'error', message: 'Site URL is not configured.' }
  }

  const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent('/reset-password')}`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  })

  if (error) {
    return { type: 'error', message: 'Could not send reset email. Try again in a moment.' }
  }

  return {
    type: 'success',
    message: 'If that account exists, a reset link is on the way.',
  }
}
