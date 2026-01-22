'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../utils/supabase/server'

export async function submitFlag(prevState, formData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'You must be logged in to submit flags' }
  }

  const challengeId = formData.get('challengeId')
  const flag = formData.get('flag')

  if (!challengeId || !flag) {
    return { success: false, message: 'Challenge ID and flag are required' }
  }

  const trimmedFlag = String(flag).trim()

  if (!trimmedFlag) {
    return { success: false, message: 'Please enter a flag' }
  }

  const { data, error } = await supabase.rpc('verify_ctf_flag', {
    p_user_id: user.id,
    p_challenge_id: challengeId,
    p_submitted_flag: trimmedFlag
  })

  if (error) {
    return { success: false, message: 'An error occurred. Please try again.' }
  }

  if (!data || data.length === 0) {
    return { success: false, message: 'An error occurred. Please try again.' }
  }

  const result = data[0]

  // Revalidate the CTF pages to show updated solve status
  revalidatePath('/ctf')

  return {
    success: result.success,
    message: result.message,
    pointsAwarded: result.points_awarded,
    firstBlood: result.first_blood
  }
}

export async function unlockHint(prevState, formData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'You must be logged in to unlock hints' }
  }

  const challengeId = formData.get('challengeId')
  const hintNumber = parseInt(formData.get('hintNumber'), 10)

  if (!challengeId || isNaN(hintNumber) || hintNumber < 1 || hintNumber > 3) {
    return { success: false, message: 'Invalid hint request' }
  }

  const { data, error } = await supabase.rpc('unlock_hint', {
    p_user_id: user.id,
    p_challenge_id: challengeId,
    p_hint_number: hintNumber
  })

  if (error) {
    return { success: false, message: 'An error occurred. Please try again.' }
  }

  if (!data || data.length === 0) {
    return { success: false, message: 'An error occurred. Please try again.' }
  }

  const result = data[0]

  return {
    success: result.success,
    hintText: result.hint_text,
    pointsDeducted: result.points_deducted
  }
}

export async function getUserChallengeStatus(competitionId) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { solvedChallenges: [], unlockedHints: [] }
  }

  // Get solved challenges
  const { data: solves } = await supabase
    .from('ctf_solves')
    .select('challenge_id, points_awarded, solved_at')
    .eq('user_id', user.id)
    .eq('competition_id', competitionId)

  // Get unlocked hints
  const { data: hints } = await supabase
    .from('ctf_hint_unlocks')
    .select('challenge_id, hint_number, points_deducted')
    .eq('user_id', user.id)

  return {
    solvedChallenges: solves || [],
    unlockedHints: hints || []
  }
}
