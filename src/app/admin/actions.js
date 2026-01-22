'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../../../utils/supabase/server'

// Helper to check admin status
async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    throw new Error('Not authorized')
  }

  return { supabase, user }
}

// Helper to verify competition access (owner, collaborator, or admin)
async function verifyCompetitionAccess(supabase, competitionId, userId, requiredRole = 'editor') {
  // Check if owner
  const { data: competition } = await supabase
    .from('ctf_competitions')
    .select('id, created_by')
    .eq('id', competitionId)
    .single()

  if (!competition) return { hasAccess: false, isOwner: false }
  if (competition.created_by === userId) return { hasAccess: true, isOwner: true }

  // Check if collaborator with sufficient role
  const { data: collaborator } = await supabase
    .from('ctf_competition_collaborators')
    .select('role')
    .eq('competition_id', competitionId)
    .eq('user_id', userId)
    .single()

  if (collaborator) {
    const roleHierarchy = { viewer: 1, editor: 2 }
    const hasAccess = roleHierarchy[collaborator.role] >= roleHierarchy[requiredRole]
    return { hasAccess, isOwner: false, role: collaborator.role }
  }

  // Fallback: check if user is admin (admins have full access)
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single()

  if (profile?.is_admin) {
    return { hasAccess: true, isOwner: false, isAdmin: true }
  }

  return { hasAccess: false, isOwner: false }
}

// Competition actions
export async function createCompetition(prevState, formData) {
  try {
    const { supabase, user } = await requireAdmin()

    const title = formData.get('title')?.toString().trim()
    const description = formData.get('description')?.toString().trim() || null
    const rules = formData.get('rules')?.toString().trim() || null
    const startsAt = formData.get('starts_at')?.toString()
    const endsAt = formData.get('ends_at')?.toString()
    const isActive = formData.get('is_active') === 'true'

    if (!title || !startsAt || !endsAt) {
      return { success: false, message: 'Title, start date, and end date are required' }
    }

    const { data, error } = await supabase
      .from('ctf_competitions')
      .insert({
        title,
        description,
        rules,
        starts_at: startsAt,
        ends_at: endsAt,
        is_active: isActive,
        created_by: user.id
      })
      .select('id')
      .single()

    if (error) {
      return { success: false, message: error.message || 'Failed to create competition' }
    }

    revalidatePath('/admin/ctf/competitions')
    revalidatePath('/ctf')

    return { success: true, message: 'Competition created', id: data.id }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

export async function updateCompetition(prevState, formData) {
  try {
    const { supabase, user } = await requireAdmin()

    const id = formData.get('id')?.toString()
    const title = formData.get('title')?.toString().trim()
    const description = formData.get('description')?.toString().trim() || null
    const rules = formData.get('rules')?.toString().trim() || null
    const startsAt = formData.get('starts_at')?.toString()
    const endsAt = formData.get('ends_at')?.toString()
    const isActive = formData.get('is_active') === 'true'

    if (!id || !title || !startsAt || !endsAt) {
      return { success: false, message: 'ID, title, start date, and end date are required' }
    }

    // Verify access before update (owner or editor)
    const { hasAccess } = await verifyCompetitionAccess(supabase, id, user.id, 'editor')
    if (!hasAccess) {
      return { success: false, message: 'Not authorized to modify this competition' }
    }

    const { error } = await supabase
      .from('ctf_competitions')
      .update({
        title,
        description,
        rules,
        starts_at: startsAt,
        ends_at: endsAt,
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      return { success: false, message: 'Failed to update competition' }
    }

    revalidatePath('/admin/ctf/competitions')
    revalidatePath('/ctf')

    return { success: true, message: 'Competition updated' }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

export async function deleteCompetition(id) {
  try {
    const { supabase, user } = await requireAdmin()

    // Verify ownership before delete (only owner can delete)
    const { isOwner } = await verifyCompetitionAccess(supabase, id, user.id)
    if (!isOwner) {
      return { success: false, message: 'Not authorized to delete this competition' }
    }

    const { error } = await supabase
      .from('ctf_competitions')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, message: 'Failed to delete competition' }
    }

    revalidatePath('/admin/ctf/competitions')
    revalidatePath('/ctf')

    return { success: true, message: 'Competition deleted' }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

// Challenge actions
export async function createChallenge(prevState, formData) {
  try {
    const { supabase, user } = await requireAdmin()

    const competitionId = formData.get('competition_id')?.toString()
    const title = formData.get('title')?.toString().trim()
    const description = formData.get('description')?.toString().trim()
    const category = formData.get('category')?.toString().trim()
    const difficulty = formData.get('difficulty')?.toString()
    const points = parseInt(formData.get('points')?.toString() || '100', 10)
    const flag = formData.get('flag')?.toString().trim()
    const flagFormat = formData.get('flag_format')?.toString().trim() || null
    const caseSensitive = formData.get('case_sensitive') !== 'false'
    const hint1 = formData.get('hint_1')?.toString().trim() || null
    const hint1Cost = parseInt(formData.get('hint_1_cost')?.toString() || '0', 10)
    const hint2 = formData.get('hint_2')?.toString().trim() || null
    const hint2Cost = parseInt(formData.get('hint_2_cost')?.toString() || '0', 10)
    const hint3 = formData.get('hint_3')?.toString().trim() || null
    const hint3Cost = parseInt(formData.get('hint_3_cost')?.toString() || '0', 10)
    const attachmentUrl = formData.get('attachment_url')?.toString().trim() || null
    const challengeUrl = formData.get('challenge_url')?.toString().trim() || null
    const maxAttempts = formData.get('max_attempts')?.toString().trim()
    const isVisible = formData.get('is_visible') !== 'false'
    const sortOrder = parseInt(formData.get('sort_order')?.toString() || '0', 10)

    if (!competitionId || !title || !description || !category || !difficulty || !flag) {
      return { success: false, message: 'Required fields: competition, title, description, category, difficulty, flag' }
    }

    // Verify access before creating challenge (owner or editor)
    const { hasAccess } = await verifyCompetitionAccess(supabase, competitionId, user.id, 'editor')
    if (!hasAccess) {
      return { success: false, message: 'Not authorized to add challenges to this competition' }
    }

    // Hash the flag using database function
    const { data: hashResult } = await supabase.rpc('hash_ctf_flag', {
      p_flag: flag,
      p_case_sensitive: caseSensitive
    })

    if (!hashResult) {
      return { success: false, message: 'Failed to hash flag' }
    }

    const { data, error } = await supabase
      .from('ctf_challenges')
      .insert({
        competition_id: competitionId,
        title,
        description,
        category,
        difficulty,
        points,
        flag_hash: hashResult,
        flag_format: flagFormat,
        case_sensitive: caseSensitive,
        hint_1: hint1,
        hint_1_cost: hint1Cost,
        hint_2: hint2,
        hint_2_cost: hint2Cost,
        hint_3: hint3,
        hint_3_cost: hint3Cost,
        attachment_url: attachmentUrl,
        challenge_url: challengeUrl,
        max_attempts: maxAttempts ? parseInt(maxAttempts, 10) : null,
        is_visible: isVisible,
        sort_order: sortOrder
      })
      .select('id')
      .single()

    if (error) {
      return { success: false, message: 'Failed to create challenge' }
    }

    revalidatePath(`/admin/ctf/competitions/${competitionId}/challenges`)
    revalidatePath('/ctf')

    return { success: true, message: 'Challenge created', id: data.id }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

export async function updateChallenge(prevState, formData) {
  try {
    const { supabase, user } = await requireAdmin()

    const id = formData.get('id')?.toString()
    const competitionId = formData.get('competition_id')?.toString()
    const title = formData.get('title')?.toString().trim()
    const description = formData.get('description')?.toString().trim()
    const category = formData.get('category')?.toString().trim()
    const difficulty = formData.get('difficulty')?.toString()
    const points = parseInt(formData.get('points')?.toString() || '100', 10)
    const flag = formData.get('flag')?.toString().trim() // Optional - only update if provided
    const flagFormat = formData.get('flag_format')?.toString().trim() || null
    const caseSensitive = formData.get('case_sensitive') !== 'false'
    const hint1 = formData.get('hint_1')?.toString().trim() || null
    const hint1Cost = parseInt(formData.get('hint_1_cost')?.toString() || '0', 10)
    const hint2 = formData.get('hint_2')?.toString().trim() || null
    const hint2Cost = parseInt(formData.get('hint_2_cost')?.toString() || '0', 10)
    const hint3 = formData.get('hint_3')?.toString().trim() || null
    const hint3Cost = parseInt(formData.get('hint_3_cost')?.toString() || '0', 10)
    const attachmentUrl = formData.get('attachment_url')?.toString().trim() || null
    const challengeUrl = formData.get('challenge_url')?.toString().trim() || null
    const maxAttempts = formData.get('max_attempts')?.toString().trim()
    const isVisible = formData.get('is_visible') !== 'false'
    const sortOrder = parseInt(formData.get('sort_order')?.toString() || '0', 10)

    if (!id || !title || !description || !category || !difficulty) {
      return { success: false, message: 'Required fields: id, title, description, category, difficulty' }
    }

    // Verify access before updating challenge (owner or editor)
    if (competitionId) {
      const { hasAccess } = await verifyCompetitionAccess(supabase, competitionId, user.id, 'editor')
      if (!hasAccess) {
        return { success: false, message: 'Not authorized to modify challenges in this competition' }
      }
    }

    const updateData = {
      title,
      description,
      category,
      difficulty,
      points,
      flag_format: flagFormat,
      case_sensitive: caseSensitive,
      hint_1: hint1,
      hint_1_cost: hint1Cost,
      hint_2: hint2,
      hint_2_cost: hint2Cost,
      hint_3: hint3,
      hint_3_cost: hint3Cost,
      attachment_url: attachmentUrl,
      challenge_url: challengeUrl,
      max_attempts: maxAttempts ? parseInt(maxAttempts, 10) : null,
      is_visible: isVisible,
      sort_order: sortOrder,
      updated_at: new Date().toISOString()
    }

    // Only update flag hash if a new flag is provided
    if (flag) {
      const { data: hashResult } = await supabase.rpc('hash_ctf_flag', {
        p_flag: flag,
        p_case_sensitive: caseSensitive
      })

      if (hashResult) {
        updateData.flag_hash = hashResult
      }
    }

    const { error } = await supabase
      .from('ctf_challenges')
      .update(updateData)
      .eq('id', id)

    if (error) {
      return { success: false, message: 'Failed to update challenge' }
    }

    revalidatePath(`/admin/ctf/competitions/${competitionId}/challenges`)
    revalidatePath('/ctf')

    return { success: true, message: 'Challenge updated' }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

export async function deleteChallenge(id, competitionId) {
  try {
    const { supabase, user } = await requireAdmin()

    // Verify access before deleting challenge (owner or editor)
    const { hasAccess } = await verifyCompetitionAccess(supabase, competitionId, user.id, 'editor')
    if (!hasAccess) {
      return { success: false, message: 'Not authorized to delete challenges from this competition' }
    }

    const { error } = await supabase
      .from('ctf_challenges')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, message: 'Failed to delete challenge' }
    }

    revalidatePath(`/admin/ctf/competitions/${competitionId}/challenges`)
    revalidatePath('/ctf')

    return { success: true, message: 'Challenge deleted' }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

// Collaborator actions
export async function addCollaborator(prevState, formData) {
  try {
    const { supabase, user } = await requireAdmin()

    const competitionId = formData.get('competition_id')?.toString()
    const collaboratorEmail = formData.get('email')?.toString().trim()
    const role = formData.get('role')?.toString() || 'editor'

    if (!competitionId || !collaboratorEmail) {
      return { success: false, message: 'Competition ID and email are required' }
    }

    if (!['editor', 'viewer'].includes(role)) {
      return { success: false, message: 'Invalid role' }
    }

    // Only owner can add collaborators
    const { isOwner } = await verifyCompetitionAccess(supabase, competitionId, user.id)
    if (!isOwner) {
      return { success: false, message: 'Only the competition owner can manage collaborators' }
    }

    // Find user by email
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('id, is_admin')
      .eq('email', collaboratorEmail)
      .single()

    if (!targetUser) {
      return { success: false, message: 'User not found' }
    }

    if (!targetUser.is_admin) {
      return { success: false, message: 'User must be an admin to be added as collaborator' }
    }

    // Add collaborator
    const { error } = await supabase
      .from('ctf_competition_collaborators')
      .insert({
        competition_id: competitionId,
        user_id: targetUser.id,
        role,
        invited_by: user.id
      })

    if (error) {
      if (error.code === '23505') {
        return { success: false, message: 'User is already a collaborator' }
      }
      return { success: false, message: 'Failed to add collaborator' }
    }

    revalidatePath(`/admin/ctf/competitions/${competitionId}`)
    return { success: true, message: 'Collaborator added' }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

export async function removeCollaborator(competitionId, collaboratorUserId) {
  try {
    const { supabase, user } = await requireAdmin()

    // Only owner can remove collaborators
    const { isOwner } = await verifyCompetitionAccess(supabase, competitionId, user.id)
    if (!isOwner) {
      return { success: false, message: 'Only the competition owner can manage collaborators' }
    }

    const { error } = await supabase
      .from('ctf_competition_collaborators')
      .delete()
      .eq('competition_id', competitionId)
      .eq('user_id', collaboratorUserId)

    if (error) {
      return { success: false, message: 'Failed to remove collaborator' }
    }

    revalidatePath(`/admin/ctf/competitions/${competitionId}`)
    return { success: true, message: 'Collaborator removed' }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

export async function getCollaborators(competitionId) {
  try {
    const { supabase, user } = await requireAdmin()

    const { hasAccess, isOwner } = await verifyCompetitionAccess(supabase, competitionId, user.id, 'viewer')
    if (!hasAccess) {
      return { success: false, collaborators: [], isOwner: false }
    }

    const { data } = await supabase
      .from('ctf_competition_collaborators')
      .select(`
        id,
        role,
        created_at,
        user_id,
        profiles!ctf_competition_collaborators_user_id_fkey(id, email, full_name)
      `)
      .eq('competition_id', competitionId)

    return { success: true, collaborators: data || [], isOwner }
  } catch (error) {
    return { success: false, collaborators: [], isOwner: false }
  }
}
