'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../../utils/supabase/server'

// Convert datetime-local value to ISO string with timezone
function toISOWithTimezone(dateTimeLocal, timezone) {
  if (!dateTimeLocal) return null
  // Parse the datetime-local value (YYYY-MM-DDTHH:mm)
  const [datePart, timePart] = dateTimeLocal.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)

  // Create a date string that we can parse with the timezone
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`

  // Use Intl to get the UTC offset for this timezone at this specific date
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'shortOffset',
  })
  const tempDate = new Date(dateStr + 'Z')
  // Adjust by finding the offset
  const parts = formatter.formatToParts(tempDate)
  const tzPart = parts.find((p) => p.type === 'timeZoneName')?.value || ''

  // Parse offset like "GMT-6" or "GMT+5:30"
  let offsetMinutes = 0
  const offsetMatch = tzPart.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/)
  if (offsetMatch) {
    const sign = offsetMatch[1] === '+' ? 1 : -1
    const hours = parseInt(offsetMatch[2], 10)
    const mins = parseInt(offsetMatch[3] || '0', 10)
    offsetMinutes = sign * (hours * 60 + mins)
  }

  // Create date in UTC by subtracting the offset
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0) - offsetMinutes * 60 * 1000)
  return utcDate.toISOString()
}

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

// Create event
export async function createEvent(prevState, formData) {
  try {
    const { supabase, user } = await requireAdmin()

    const title = formData.get('title')?.toString().trim()
    const description = formData.get('description')?.toString().trim() || null
    const startsAtLocal = formData.get('starts_at')?.toString()
    const endsAtLocal = formData.get('ends_at')?.toString() || null
    const timezone = formData.get('timezone')?.toString() || 'America/Chicago'
    const location = formData.get('location')?.toString().trim() || null
    const isVisible = formData.get('is_visible') === 'true'

    // Validation
    if (!title || !startsAtLocal) {
      return { success: false, message: 'Title and start date are required' }
    }

    // Convert to UTC ISO strings
    const startsAt = toISOWithTimezone(startsAtLocal, timezone)
    const endsAt = toISOWithTimezone(endsAtLocal, timezone)

    // Insert event
    const { data, error } = await supabase
      .from('events')
      .insert({
        title,
        description,
        starts_at: startsAt,
        ends_at: endsAt,
        location,
        timezone,
        is_visible: isVisible,
        created_by: user.id
      })
      .select('id')
      .single()

    if (error) {
      return { success: false, message: 'Failed to create event' }
    }

    // Revalidate paths
    revalidatePath('/admin/events')
    revalidatePath('/events')

    return { success: true, message: 'Event created', id: data.id }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

// Update event
export async function updateEvent(prevState, formData) {
  try {
    const { supabase } = await requireAdmin()

    const id = formData.get('id')?.toString()
    const title = formData.get('title')?.toString().trim()
    const description = formData.get('description')?.toString().trim() || null
    const startsAtLocal = formData.get('starts_at')?.toString()
    const endsAtLocal = formData.get('ends_at')?.toString() || null
    const timezone = formData.get('timezone')?.toString() || 'America/Chicago'
    const location = formData.get('location')?.toString().trim() || null
    const isVisible = formData.get('is_visible') === 'true'

    // Validation
    if (!id || !title || !startsAtLocal) {
      return { success: false, message: 'ID, title, and start date are required' }
    }

    // Convert to UTC ISO strings
    const startsAt = toISOWithTimezone(startsAtLocal, timezone)
    const endsAt = toISOWithTimezone(endsAtLocal, timezone)

    // Update event
    const { error } = await supabase
      .from('events')
      .update({
        title,
        description,
        starts_at: startsAt,
        ends_at: endsAt,
        location,
        timezone,
        is_visible: isVisible,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      return { success: false, message: 'Failed to update event' }
    }

    // Revalidate paths
    revalidatePath('/admin/events')
    revalidatePath(`/admin/events/${id}`)
    revalidatePath('/events')

    return { success: true, message: 'Event updated' }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

// Delete event
export async function deleteEvent(id) {
  try {
    const { supabase } = await requireAdmin()

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, message: 'Failed to delete event' }
    }

    // Revalidate paths
    revalidatePath('/admin/events')
    revalidatePath('/events')

    return { success: true, message: 'Event deleted' }
  } catch (error) {
    return { success: false, message: error.message }
  }
}
