export function toCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0]);

  const escaped = (value: unknown): string => {
    const normalized = String(value ?? "");
    const quoted = normalized.replaceAll("\"", "\"\"");
    return `\"${quoted}\"`;
  };

  const headerRow = headers.join(",");
  const dataRows = rows.map((row) => headers.map((header) => escaped(row[header])).join(","));

  return [headerRow, ...dataRows].join("\n");
}
