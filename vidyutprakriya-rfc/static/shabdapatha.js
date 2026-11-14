// The list of words of the Subantani tab, from `data/shabdapatha.tsv`.
//
// The file is tab-separated and has three columns: the word (SLP1), its arTa (Devanagari, may be
// empty) and the Lisp expression that the widget shows for it. The Lisp expression is last. The
// first line is a header. Blank lines are skipped.
//
// The linga of a word is not a column. It is the linga of the expression, `puM`, `strI` or
// `napuMsaka` in `(sup STEM LINGA)`, so that the file has one source for it.

const LINGAS = ["puM", "strI", "napuMsaka"];

/**
 * Returns the linga of a `(sup STEM LINGA ...)` expression, or null if it is not one. The stem may
 * be a nested expression, such as a krdanta.
 */
export function lingaOf(lisp) {
    const text = lisp.trim();
    if (!text.startsWith("(") || !text.endsWith(")")) return null;
    const parts = [];
    let depth = 0;
    let current = "";
    for (const ch of text.slice(1, -1)) {
        if (ch === "(") depth++;
        if (ch === ")") depth--;
        if (depth < 0) return null;
        if (/\s/.test(ch) && depth === 0) {
            if (current !== "") parts.push(current);
            current = "";
        } else {
            current += ch;
        }
    }
    if (depth !== 0) return null;
    if (current !== "") parts.push(current);
    return parts[0] === "sup" && LINGAS.includes(parts[2]) ? parts[2] : null;
}

/**
 * Parses the text of `shabdapatha.tsv`.
 *
 * Returns `{ entries, warnings }`. Each entry is `{ shabda, linga, artha, lisp, key }`. `linga` is
 * that of the expression, and `artha` is "" if the column is empty. `key` names the entry in a
 * link: the word, or `word:linga` if another line has the same word. A line that has no word or
 * expression, or an expression that has no linga, is left out and named in `warnings`; so is a line
 * in the old layout, which had a linga column. A line that repeats a word and a linga that an
 * earlier line has is left out too.
 */
export function parseShabdas(tsv) {
    const warnings = [];
    const rows = [];
    tsv.split(/\r?\n/).forEach((line, n) => {
        if (line.trim() === "") return;
        const where = `shabdapatha.tsv line ${n + 1}`;
        const cols = line.split("\t").map((x) => x.trim());
        const [shabda, artha = "", lisp = ""] = cols;
        if (n === 0 && shabda === "shabda") return;
        if ((LINGAS.includes(artha) || artha === "sarva") && cols.slice(2).some((c) => c.startsWith("("))) {
            warnings.push(`${where}: the columns are now word, arTa, expression. The linga is the one in the expression.`);
            return;
        }
        if (!shabda || !lisp) {
            warnings.push(`${where}: expected 3 columns (word, arTa, expression).`);
            return;
        }
        const linga = lingaOf(lisp);
        if (linga === null) {
            warnings.push(`${where}: ${shabda} has no linga: the expression must be (sup STEM puM|strI|napuMsaka).`);
            return;
        }
        if (rows.some((r) => r.shabda === shabda && r.linga === linga)) {
            warnings.push(`${where}: ${shabda} (${linga}) is already listed.`);
            return;
        }
        rows.push({ shabda, linga, artha, lisp });
    });
    const count = new Map();
    rows.forEach((r) => count.set(r.shabda, (count.get(r.shabda) || 0) + 1));
    const entries = rows.map((r) => ({ ...r, key: count.get(r.shabda) > 1 ? `${r.shabda}:${r.linga}` : r.shabda }));
    return { entries, warnings };
}

// The arTa is searched only for a query of at least this many characters, so that one or two
// letters do not match nearly every arTa.
export const MIN_ARTHA_QUERY = 3;

/**
 * Returns the entries that match `query`: those whose word contains it, whose linga does, or (if
 * the query has at least `MIN_ARTHA_QUERY` characters) whose arTa does. `forms` turns the query into the spellings (SLP1) to look for in the word; the page
 * reads Devanagari and Harvard-Kyoto as well as SLP1. `devaForms` does the same for the arTa, which
 * is in Devanagari; the query itself is always tried there. An empty or missing query matches
 * everything.
 */
export function filterShabdas(entries, query, forms = (q) => [q], devaForms = () => []) {
    if (query === null || query === undefined || query.trim() === "") return entries;
    const q = query.trim();
    const spellings = [q, ...forms(q)].filter((x) => x !== "");
    const arthaSpellings = [...q].length >= MIN_ARTHA_QUERY ? [q, ...devaForms(q)].filter((x) => x !== "") : [];
    return entries.filter(
        (e) =>
            spellings.some((s) => e.shabda.includes(s)) ||
            e.linga.toLowerCase().includes(q.toLowerCase()) ||
            (e.artha !== "" && arthaSpellings.some((s) => e.artha.includes(s))),
    );
}
