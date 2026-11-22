function splitCsvLine(line) {
  const cells = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && line[index + 1] === '"' && quoted) { cell += '"'; index += 1; }
    else if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) { cells.push(cell.trim()); cell = ""; }
    else cell += character;
  }
  cells.push(cell.trim());
  return cells;
}

function isNumber(value) { return value !== "" && Number.isFinite(Number(value)); }
function isDate(value) { return value !== "" && !isNumber(value) && !Number.isNaN(Date.parse(value)); }

export function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length < 2) throw new Error("CSV files need a header and at least one data row.");
  const headers = splitCsvLine(lines[0]).map((header) => header.trim());
  if (!headers.length || headers.some((header) => !header)) throw new Error("Every CSV column needs a name.");
  if (new Set(headers).size !== headers.length) throw new Error("CSV column names must be unique.");
  const rows = lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
  const columns = headers.map((name) => {
    const values = rows.map((row) => row[name]).filter(Boolean);
    const type = values.length && values.every(isNumber) ? "number" : values.length && values.every(isDate) ? "date" : "text";
    return { name, type };
  });
  return { headers, rows, columns };
}
