const EVENT_BASE_COLUMNS = [
  "id",
  "title",
  "description",
  "starts_at",
  "ends_at",
  "location",
];
const EVENT_OPTIONAL_COLUMNS = ["timezone", "image_path", "ctf_competition_id"];

function isMissingColumn(error, column) {
  return Boolean(
    error &&
    (error.code === "42703" || error.code === "PGRST204") &&
    error.message?.includes(column),
  );
}

function createVisibleEventsQuery(supabase, now, columns) {
  return supabase
    .from("events")
    .select(columns)
    .eq("is_visible", true)
    .or(`ends_at.gte.${now},and(ends_at.is.null,starts_at.gte.${now})`)
    .order("starts_at", { ascending: true });
}

export async function getVisibleEvents(supabase, now) {
  const availableOptionalColumns = new Set(EVENT_OPTIONAL_COLUMNS);
  let result;

  // Migrations 009–011 add the optional display fields. Keep listings
  // available while an environment is upgraded instead of failing all events.
  for (
    let attempt = 0;
    attempt <= EVENT_OPTIONAL_COLUMNS.length;
    attempt += 1
  ) {
    const columns = [...EVENT_BASE_COLUMNS, ...availableOptionalColumns].join(
      ",",
    );
    result = await createVisibleEventsQuery(supabase, now, columns);

    const missingColumn = EVENT_OPTIONAL_COLUMNS.find(
      (column) =>
        availableOptionalColumns.has(column) &&
        isMissingColumn(result.error, column),
    );

    if (!missingColumn) return result;
    availableOptionalColumns.delete(missingColumn);
  }

  return result;
}
