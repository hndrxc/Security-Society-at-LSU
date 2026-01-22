'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { createEvent, updateEvent } from '@/app/admin/events/actions'

// Common US timezones
const TIMEZONES = [
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'UTC', label: 'UTC' },
]

function formatDateForInput(dateString, timezone) {
  if (!dateString) return ''
  const date = new Date(dateString)
  // Format date in the specified timezone for the datetime-local input
  const options = {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }
  const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(date)
  const get = (type) => parts.find((p) => p.type === type)?.value || ''
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`
}

// Detect user's timezone or default to Central
function getDefaultTimezone(eventTimezone) {
  if (eventTimezone) return eventTimezone
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone
  // Check if user's timezone is in our list
  if (TIMEZONES.some((tz) => tz.value === userTz)) {
    return userTz
  }
  return 'America/Chicago' // Default to Central Time
}

export default function EventForm({ event }) {
  const router = useRouter()
  const isEditing = !!event
  const defaultTz = getDefaultTimezone(event?.timezone)

  const [state, formAction, pending] = useActionState(async (prevState, formData) => {
    const action = isEditing ? updateEvent : createEvent
    const result = await action(prevState, formData)

    if (result.success && !isEditing) {
      router.push('/admin/events')
    }

    return result
  }, null)

  return (
    <form action={formAction} className="space-y-6">
      {isEditing && <input type="hidden" name="id" value={event.id} />}

      {/* Title */}
      <div>
        <label className="mb-2 block font-terminal text-xs uppercase text-slate-400">
          Title *
        </label>
        <input
          name="title"
          type="text"
          required
          maxLength={200}
          defaultValue={event?.title || ''}
          placeholder="Weekly Meetup"
          className="w-full rounded-lg border border-purple-900/60 bg-black/60 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-2 block font-terminal text-xs uppercase text-slate-400">
          Description
        </label>
        <textarea
          name="description"
          rows={3}
          defaultValue={event?.description || ''}
          placeholder="Event details and what to expect..."
          className="w-full rounded-lg border border-purple-900/60 bg-black/60 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
        />
      </div>

      {/* Location */}
      <div>
        <label className="mb-2 block font-terminal text-xs uppercase text-slate-400">
          Location
        </label>
        <input
          name="location"
          type="text"
          defaultValue={event?.location || ''}
          placeholder="PFT 1200 or Virtual (Discord)"
          className="w-full rounded-lg border border-purple-900/60 bg-black/60 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
        />
      </div>

      {/* Timezone */}
      <div>
        <label className="mb-2 block font-terminal text-xs uppercase text-slate-400">
          Timezone
        </label>
        <select
          name="timezone"
          defaultValue={defaultTz}
          className="w-full rounded-lg border border-purple-900/60 bg-black/60 px-4 py-3 text-white focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      {/* Start and End Dates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block font-terminal text-xs uppercase text-slate-400">
            Start Date/Time *
          </label>
          <input
            name="starts_at"
            type="datetime-local"
            required
            defaultValue={formatDateForInput(event?.starts_at, defaultTz)}
            className="w-full rounded-lg border border-purple-900/60 bg-black/60 px-4 py-3 text-white focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
          />
        </div>
        <div>
          <label className="mb-2 block font-terminal text-xs uppercase text-slate-400">
            End Date/Time
          </label>
          <input
            name="ends_at"
            type="datetime-local"
            defaultValue={formatDateForInput(event?.ends_at, defaultTz)}
            className="w-full rounded-lg border border-purple-900/60 bg-black/60 px-4 py-3 text-white focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
          />
        </div>
      </div>

      {/* Visibility Toggle */}
      <div className="flex items-center gap-3">
        <input
          id="is_visible"
          name="is_visible"
          type="checkbox"
          defaultChecked={event?.is_visible !== false}
          value="true"
          className="h-4 w-4 cursor-pointer rounded border-purple-900/60 bg-black/60 text-amber-400 focus:ring-1 focus:ring-amber-400/30"
        />
        <label htmlFor="is_visible" className="font-terminal text-sm uppercase text-slate-400">
          Make event visible to users
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-amber-400 px-6 py-3 font-semibold text-black shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5 hover:bg-amber-300 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {pending ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
        </button>

        {state?.message && (
          <span className={`font-terminal text-sm ${
            state.success ? 'text-[#39ff14]' : 'text-rose-400'
          }`}>
            {state.message}
          </span>
        )}
      </div>
    </form>
  )
}
