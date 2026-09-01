'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../../utils/supabase/server'

const STORAGE_BUCKET = 'event-media'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function isMissingTimezoneColumn(error) {
  return Boolean(
    error &&
      (error.code === '42703' || error.code === 'PGRST204') &&
      error.message?.includes('timezone')
  )
}

async function insertEvent(supabase, values) {
  let result = await supabase
    .from('events')
    .insert(values)
    .select('id')
    .single()

  // Migration 009 adds timezone. Retry without that optional field while an
  // environment is being upgraded so event management remains usable.
  if (isMissingTimezoneColumn(result.error)) {
    const legacyValues = { ...values }
    delete legacyValues.timezone
    result = await supabase
      .from('events')
      .insert(legacyValues)
      .select('id')
      .single()
  }

  return result
}

async function updateEventRow(supabase, id, values) {
  let result = await supabase
    .from('events')
    .update(values)
    .eq('id', id)

  if (isMissingTimezoneColumn(result.error)) {
    const legacyValues = { ...values }
    delete legacyValues.timezone
    result = await supabase
      .from('events')
      .update(legacyValues)
      .eq('id', id)
  }

  return result
}

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

// Upload image to storage
async function uploadEventImage(supabase, eventId, file) {
  if (!file || !(file instanceof File) || file.size === 0) {
    return null
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP, GIF')
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum size is 5MB')
  }

  // Generate unique filename
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 50)
  const storagePath = `${eventId}/${timestamp}-${safeName}`

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false
    })

  if (uploadError) {
    throw new Error(`Failed to upload image: ${uploadError.message}`)
  }

  return storagePath
}

// Delete image from storage
async function deleteEventImage(supabase, imagePath) {
  if (!imagePath) return

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([imagePath])

  if (error) {
    console.error('Failed to delete image:', error.message)
  }
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
    const imageFile = formData.get('image')

    // Validation
    if (!title || !startsAtLocal) {
      return { success: false, message: 'Title and start date are required' }
    }

    // Convert to UTC ISO strings
    const startsAt = toISOWithTimezone(startsAtLocal, timezone)
    const endsAt = toISOWithTimezone(endsAtLocal, timezone)

    // Insert event first to get the ID
    const { data, error } = await insertEvent(supabase, {
      title,
      description,
      starts_at: startsAt,
      ends_at: endsAt,
      location,
      timezone,
      is_visible: isVisible,
      created_by: user.id
    })

    if (error) {
      return { success: false, message: 'Failed to create event' }
    }

    // Upload image if provided
    let imagePath = null
    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      try {
        imagePath = await uploadEventImage(supabase, data.id, imageFile)
        // Update event with image path
        await supabase
          .from('events')
          .update({ image_path: imagePath })
          .eq('id', data.id)
      } catch (uploadError) {
        // Event created but image failed - return partial success
        revalidatePath('/admin/events')
        revalidatePath('/events')
        return {
          success: true,
          message: `Event created, but image upload failed: ${uploadError.message}`,
          id: data.id
        }
      }
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
    const imageFile = formData.get('image')
    const removeImage = formData.get('remove_image') === 'true'

    // Validation
    if (!id || !title || !startsAtLocal) {
      return { success: false, message: 'ID, title, and start date are required' }
    }

    // Convert to UTC ISO strings
    const startsAt = toISOWithTimezone(startsAtLocal, timezone)
    const endsAt = toISOWithTimezone(endsAtLocal, timezone)

    // Get current event to check for existing image
    const { data: existingEvent } = await supabase
      .from('events')
      .select('image_path')
      .eq('id', id)
      .single()

    let imagePath = existingEvent?.image_path || null

    // Handle image removal
    if (removeImage && imagePath) {
      await deleteEventImage(supabase, imagePath)
      imagePath = null
    }

    // Handle new image upload
    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      try {
        // Delete old image first if exists
        if (existingEvent?.image_path) {
          await deleteEventImage(supabase, existingEvent.image_path)
        }
        imagePath = await uploadEventImage(supabase, id, imageFile)
      } catch (uploadError) {
        return { success: false, message: `Image upload failed: ${uploadError.message}` }
      }
    }

    // Update event
    const { error } = await updateEventRow(supabase, id, {
      title,
      description,
      starts_at: startsAt,
      ends_at: endsAt,
      location,
      timezone,
      is_visible: isVisible,
      image_path: imagePath,
      updated_at: new Date().toISOString()
    })

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

    // Get event to check for image
    const { data: event } = await supabase
      .from('events')
      .select('image_path')
      .eq('id', id)
      .single()

    // Delete image from storage if exists
    if (event?.image_path) {
      await deleteEventImage(supabase, event.image_path)
    }

    // Delete event
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
