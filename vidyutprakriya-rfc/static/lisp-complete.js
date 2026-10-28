// Suggestions for the Lisp expression editor (the Advanced tab).
//
// Everything here is pure: it takes the text and the cursor position and returns data. The only
// DOM code is `caretPosition`, which is used to place the pop-up.
//
// - `contextAt(text, cursor)` finds the open lists around the cursor and the word under it.
// - `slotAt(ctx)` says what the grammar expects at that position.
// - `suggest(text, cursor, data)` returns the candidates for that position.
//
// The grammar is in examples/lisp_expression.md. Free-text positions (such as the text of
// `(:prAtipadika TEXT)`) have no candidates.

const HEAD_ALIASES = {
    ':dhatu': ':DAtu',
    ':krdanta': ':kfdanta',
    'krt': 'kft',
    'taddhita': 'tadDita',
    ':namadhatu': ':nAmaDAtu',
    ':nAmaDatu': ':nAmaDAtu',
    ':stri': ':strI',
    'sanadi': 'sanAdi',
    'artha': 'arTa',
    'lakara': 'lakAra',
};

const COMMANDS = ['tiN', 'kft', 'tadDita', 'sup', 'samAsa', 'strI'];
const DHATU_HEADS = [':DAtu', ':nAmaDAtu'];
const PRATI_HEADS = [':prAtipadika', ':avyaya', ':nyAp', ':kfdanta', ':tadDitAnta', ':samAsa', ':strI'];
const KRT_OPTIONS = ['arTa', 'lakAra', 'prayoga', 'upapada'];
const TADDHITA_OPTIONS = ['arTa'];
const DHATU_OPTIONS = ['sanAdi', 'upasarga', 'antargana'];
const NAMA_OPTIONS = ['sanAdi', 'upasarga'];

// The upasargas (for `(upasarga ...)`).
export const UPASARGAS = [
    'pra', 'parA', 'apa', 'sam', 'anu', 'ava', 'nis', 'nir', 'dus', 'dur', 'vi', 'A', 'ni',
    'aDi', 'api', 'ati', 'su', 'ud', 'aBi', 'prati', 'pari', 'upa',
];

// The most candidates that the pop-up shows.
export const MAX_ITEMS = 30;

// Keys of `completions` whose values are Rust variant names (matched without regard to case).
const VARIANT_NAME_KEYS = ['krtArthas', 'taddhitaArthas'];

const GANA_BY_CODE = ['BvAdi', 'adAdi', 'juhotyAdi', 'divAdi', 'svAdi', 'tudAdi', 'ruDAdi', 'tanAdi',
    'kryAdi', 'curAdi'];

function isSpace(c) {
    return /\s/.test(c);
}

/**
 * Scans `text` up to `cursor`.
 *
 * Returns `{ stack, token }`:
 * - `stack` is the list of open lists, outermost first. Each is `{ items, start }`, where `items`
 *   are the completed elements so far: `{ text }` for a word, `{ list: true, head }` for a list.
 * - `token` is `{ text, start, end }`, the word under the cursor (`text` is the part before the
 *   cursor). It is empty if the cursor is between words.
 */
export function contextAt(text, cursor) {
    const stack = [];
    let tokStart = -1;
    const flush = (i) => {
        if (tokStart >= 0 && stack.length) {
            stack[stack.length - 1].items.push({ text: text.slice(tokStart, i) });
        }
        tokStart = -1;
    };
    for (let i = 0; i < cursor; i++) {
        const c = text[i];
        if (c === '(') {
            flush(i);
            stack.push({ items: [], start: i });
        } else if (c === ')') {
            flush(i);
            const closed = stack.pop();
            if (closed && stack.length) {
                const first = closed.items[0];
                stack[stack.length - 1].items.push({ list: true, head: first && first.text });
            }
        } else if (isSpace(c)) {
            flush(i);
        } else if (tokStart < 0) {
            tokStart = i;
        }
    }
    const start = tokStart >= 0 ? tokStart : cursor;
    let end = cursor;
    while (end < text.length && !isSpace(text[end]) && text[end] !== '(' && text[end] !== ')') {
        end++;
    }
    return { stack, token: { text: text.slice(start, cursor), start, end } };
}

function canon(head) {
    if (head === undefined || head === null) return null;
    return HEAD_ALIASES[head] || head;
}

/**
 * Says what the grammar expects at the cursor.
 *
 * Returns one of:
 * - `{ kind: 'none' }`: nothing to suggest (free text, or outside any list).
 * - `{ kind: 'heads', heads, atHead }`: the heads of a list. `atHead` is true if the cursor is the
 *   first word of a list that is already open (so no parenthesis is inserted).
 * - `{ kind: 'enum', key }`: a value from `completions[key]`, or from `UPASARGAS` (`upasargas`).
 * - `{ kind: 'dhatu-entry', atHead }`: a dhatu from the dhatupatha, as `UPADESHA GANA`.
 * - `{ kind: 'dhatu-expr', heads }`: a DHATU expression. A word typed here searches the dhatupatha.
 * - `{ kind: 'prati-expr', heads }`: a PRATIPADIKA expression. Free text is also allowed.
 * - `{ kind: 'words', words }`: a fixed set of words.
 */
export function slotAt(ctx, toSlp1 = (s) => s) {
    const stack = ctx.stack;
    if (!stack.length) {
        return { kind: 'none' };
    }
    const frame = stack[stack.length - 1];
    const parent = stack.length > 1 ? stack[stack.length - 2] : null;
    const i = frame.items.length;
    const headOf = (f) => {
        const first = f.items[0];
        return first && !first.list ? canon(toSlp1(first.text)) : null;
    };
    const pi = parent ? parent.items.length : -1;
    const ph = parent ? headOf(parent) : null;

    // A list whose first word is not a head.
    if (ph === 'tiN' && pi === 2) {
        // (LAKARA PRAYOGA [PURUSHA] [VACANA])
        const keys = ['lakaras', 'prayogas', 'purushas', 'vacanas'];
        return i < keys.length ? { kind: 'enum', key: keys[i] } : { kind: 'none' };
    }
    if (ph === ':DAtu' && pi === 1) {
        // (UPADESHA GANA)
        if (i === 0) return { kind: 'dhatu-entry', atHead: true };
        if (i === 1) return { kind: 'enum', key: 'ganas' };
        return { kind: 'none' };
    }

    // The first word of a list: a head.
    if (i === 0) {
        if (ph === null && !parent) return { kind: 'heads', heads: COMMANDS, atHead: true };
        let heads = null;
        switch (ph) {
            case 'tiN':
                heads = pi === 1 ? DHATU_HEADS : null;
                break;
            case 'kft':
            case ':kfdanta':
                heads = pi === 1 ? DHATU_HEADS : pi >= 3 ? KRT_OPTIONS : null;
                break;
            case 'tadDita':
            case ':tadDitAnta':
                heads = pi === 1 ? PRATI_HEADS : pi >= 3 ? TADDHITA_OPTIONS : null;
                break;
            case 'sup':
            case ':sup':
            case 'strI':
            case ':strI':
                heads = pi === 1 ? PRATI_HEADS : null;
                break;
            case 'samAsa':
            case ':samAsa':
                heads = pi >= 2 ? [':sup', 'stri'] : null;
                break;
            case ':DAtu':
                heads = pi >= 2 ? DHATU_OPTIONS : null;
                break;
            case ':nAmaDAtu':
                heads = pi === 1 ? PRATI_HEADS : NAMA_OPTIONS;
                break;
            case ':prAtipadika':
                heads = COMMANDS;
                break;
            default:
                break;
        }
        return heads ? { kind: 'heads', heads, atHead: true } : { kind: 'none' };
    }

    // A later word: an argument.
    const h = headOf(frame);
    const parentHead = ph;
    switch (h) {
        case 'tiN':
            return i === 1 ? { kind: 'dhatu-expr', heads: DHATU_HEADS } : { kind: 'none' };
        case 'kft':
        case ':kfdanta':
            if (i === 1) return { kind: 'dhatu-expr', heads: DHATU_HEADS };
            if (i === 2) return { kind: 'enum', key: 'krts' };
            return { kind: 'heads', heads: KRT_OPTIONS, atHead: false };
        case 'tadDita':
        case ':tadDitAnta':
            if (i === 1) return { kind: 'prati-expr', heads: PRATI_HEADS };
            if (i === 2) return { kind: 'enum', key: 'taddhitas' };
            return { kind: 'heads', heads: TADDHITA_OPTIONS, atHead: false };
        case 'sup':
        case ':sup': {
            if (i === 1) return { kind: 'prati-expr', heads: PRATI_HEADS };
            const keys = [null, null, 'lingas', 'vibhaktis', 'vacanas'];
            return keys[i] ? { kind: 'enum', key: keys[i] } : { kind: 'none' };
        }
        case 'stri':
            // The `(stri true)` option of a samAsa.
            if (parentHead === 'samAsa' || parentHead === ':samAsa') {
                return { kind: 'words', words: ['true', 'false'] };
            }
            return { kind: 'none' };
        case 'strI':
            return i === 1 ? { kind: 'prati-expr', heads: PRATI_HEADS } : { kind: 'none' };
        case ':strI':
            return i === 1 ? { kind: 'prati-expr', heads: PRATI_HEADS } : { kind: 'none' };
        case 'samAsa':
        case ':samAsa':
            if (i === 1) return { kind: 'enum', key: 'samasaTypes' };
            return { kind: 'heads', heads: [':sup', 'stri'], atHead: false };
        case ':DAtu':
            if (i === 1) return { kind: 'dhatu-entry', atHead: false };
            return { kind: 'heads', heads: DHATU_OPTIONS, atHead: false };
        case ':nAmaDAtu':
            if (i === 1) return { kind: 'prati-expr', heads: PRATI_HEADS };
            if (i === 2) {
                return { kind: 'enum', key: 'namaSanadis', heads: NAMA_OPTIONS };
            }
            return { kind: 'heads', heads: NAMA_OPTIONS, atHead: false };
        case 'sanAdi':
            return { kind: 'enum', key: 'sanadis' };
        case 'upasarga':
            return { kind: 'enum', key: 'upasargas' };
        case 'antargana':
            return { kind: 'enum', key: 'antaganas' };
        case 'lakAra':
            return { kind: 'enum', key: 'lakaras' };
        case 'prayoga':
            return { kind: 'enum', key: 'prayogas' };
        case 'arTa':
            if (parentHead === 'kft' || parentHead === ':kfdanta') {
                return { kind: 'enum', key: 'krtArthas' };
            }
            if (parentHead === 'tadDita' || parentHead === ':tadDitAnta') {
                return { kind: 'enum', key: 'taddhitaArthas' };
            }
            return { kind: 'none' };
        default:
            // `(:prAtipadika TEXT)`, `(:avyaya TEXT)`, `(upapada TEXT)`, ...: free text.
            return { kind: 'none' };
    }
}

// Matches `q` against `s`. Returns a rank (smaller is better) or -1. SLP1 is case-sensitive (`T`
// and `t` are different letters), so the match is too.
function rank(s, q) {
    if (s === q) return 0;
    if (s.startsWith(q)) return 1;
    if (s.includes(q)) return 2;
    return -1;
}

/**
 * Returns the dhatus of `dhatus` that match `query` (SLP1, without svaras), best first.
 *
 * A dhatu matches on its aupadeshika without svaras, its form as a dhatu (`normalDhatu`), or, for
 * a query of three or more letters, its artha.
 */
export function searchDhatus(dhatus, query, limit = MAX_ITEMS) {
    const q = query;
    if (!q) return [];
    const hits = [];
    for (const d of dhatus) {
        let best = -1;
        const a = rank(d.aupadeshikaNoSvaras, q);
        if (a >= 0) best = a;
        const n = d.normalDhatu ? rank(d.normalDhatu, q) : -1;
        if (n >= 0 && (best < 0 || n + 0.5 < best)) best = n + 0.5;
        if (best < 0 && q.length >= 3 && d.artha && d.artha.includes(q)) best = 4;
        if (best >= 0) hits.push({ d, best });
    }
    // Among equal ranks, the shorter form (fewer anubandhas) comes first.
    hits.sort((x, y) => x.best - y.best
        || x.d.aupadeshikaNoSvaras.length - y.d.aupadeshikaNoSvaras.length
        || (x.d.code < y.d.code ? -1 : x.d.code > y.d.code ? 1 : 0));
    return hits.slice(0, limit).map((h) => h.d);
}

// The `GANA` label of a dhatu and, if it needs one, its `(antargana ...)` label.
export function ganaAndAntargana(d) {
    const code = d.code || '';
    if (code.startsWith('kaRqvAdi')) {
        return { gana: 'kaRqvAdi', antargana: null };
    }
    const [g, n] = code.split('.');
    const gana = GANA_BY_CODE[parseInt(g, 10) - 1] || null;
    const num = parseInt(n, 10);
    let antargana = null;
    if (g === '01' && num >= 867 && num <= 932) antargana = 'GawAdi';
    else if (g === '10') {
        if (num >= 279 && num <= 337) antargana = 'AsvadIya';
        else if (num >= 192 && num <= 236) antargana = 'AkusmIya';
        else if (num >= 338 && num <= 388) antargana = 'ADfzIya';
    }
    return { gana, antargana };
}

// `ignoreCase` is for the values that are Rust variant names, which the evaluator matches without
// regard to case.
function filterWords(words, query, limit, ignoreCase = false) {
    const q = ignoreCase ? query.toLowerCase() : query;
    const ranked = [];
    for (const w of words) {
        const r = q ? rank(ignoreCase ? w.toLowerCase() : w, q) : 1;
        if (r >= 0) ranked.push({ w, r });
    }
    ranked.sort((a, b) => a.r - b.r);
    return ranked.slice(0, limit).map((x) => x.w);
}

/**
 * Returns the suggestions at `cursor`.
 *
 * `data` is `{ dhatus, completions, toSlp1 }`:
 * - `dhatus`: the entries of dhatupatha.tsv, as built by the app (`code`, `aupadeshika`,
 *   `aupadeshikaNoSvaras`, `normalDhatu`, `artha`).
 * - `completions`: the result of `Vidyut.lispCompletions()`.
 * - `toSlp1`: converts what the user typed (SLP1 or Devanagari) to SLP1. Optional.
 *
 * Returns `{ range, items, hint, total }`. `range` is `{ start, end }`, the part of the text that
 * a choice replaces. Each item is `{ kind, label, detail, insert, afterClose }`, where `kind` is
 * `head` (a keyword such as `:DAtu`), `word` (a pratyaya or other value) or `dhatu`; `label` and
 * `detail` are SLP1 and are only for display; and `insert` replaces
 * the range and `afterClose` (if set) is added after the `)` that closes the dhatu entry.
 */
export function suggest(text, cursor, data) {
    const toSlp1 = data.toSlp1 || ((s) => s);
    const ctx = contextAt(text, cursor);
    const slot = slotAt(ctx, toSlp1);
    const range = { start: ctx.token.start, end: ctx.token.end };
    const none = { range, items: [], hint: '', total: 0, slot };
    if (slot.kind === 'none') return none;

    const query = toSlp1(ctx.token.text).replace(/[\\^]/g, '');
    const comp = data.completions || {};
    const items = [];
    let hint = '';

    const addHeads = (heads, atHead) => {
        for (const h of filterWords(heads, query, MAX_ITEMS)) {
            items.push({ kind: 'head', label: h, detail: '', insert: (atHead ? '' : '(') + h + ' ' });
        }
    };
    const addWords = (words, ignoreCase = false) => {
        for (const w of filterWords(words, query, MAX_ITEMS, ignoreCase)) {
            items.push({ kind: 'word', label: w, detail: '', insert: w });
        }
    };
    const addDhatus = (wrap) => {
        for (const d of searchDhatus(data.dhatus || [], query)) {
            const { gana, antargana } = ganaAndAntargana(d);
            if (!gana) continue;
            const pair = `${d.aupadeshika} ${gana}`;
            const detail = [gana, d.artha, d.code].filter(Boolean).join(' · ');
            if (wrap === 'entry') {
                items.push({
                    kind: 'dhatu',
                    label: d.aupadeshika,
                    detail,
                    insert: pair,
                    afterClose: antargana ? ` (antargana ${antargana})` : '',
                });
            } else {
                const opt = antargana ? ` (antargana ${antargana})` : '';
                items.push({
                    kind: 'dhatu',
                    label: d.aupadeshika,
                    detail,
                    insert: `(:DAtu (${pair})${opt})`,
                });
            }
        }
    };

    switch (slot.kind) {
        case 'heads':
            addHeads(slot.heads, slot.atHead);
            break;
        case 'enum': {
            const words = slot.key === 'upasargas' ? UPASARGAS : comp[slot.key] || [];
            addWords(words, VARIANT_NAME_KEYS.includes(slot.key));
            if (slot.heads && !query) {
                addHeads(slot.heads, false);
            }
            break;
        }
        case 'dhatu-entry':
            if (!query) {
                hint = 'Type part of a dhatu (SLP1 or Devanagari, svaras optional).';
            } else {
                addDhatus('entry');
            }
            break;
        case 'dhatu-expr':
            if (query && /^[A-Za-z~]/.test(ctx.token.text)) {
                // A bare word: search the dhatupatha and insert a whole `(:DAtu ...)`.
                if (!ctx.token.text.startsWith(':')) addDhatus('expr');
            }
            if (!query || ctx.token.text.startsWith(':')) {
                addHeads(slot.heads, false);
            }
            break;
        case 'prati-expr':
            // A bare word is the text of a basic pratipadika, and has no list to pick from.
            if (!query || ctx.token.text.startsWith(':')) {
                addHeads(slot.heads, false);
            }
            break;
        case 'words':
            addWords(slot.words);
            break;
        default:
            break;
    }
    return { range, items: items.slice(0, MAX_ITEMS), hint, total: items.length, slot };
}

/**
 * Applies `item` (from `suggest`) to `text`. Returns `{ text, cursor }`.
 *
 * A word is followed by a space unless a space, `)` or the end of the text comes next. A dhatu
 * entry is closed with `)` if it was not closed already.
 */
export function applySuggestion(text, result, item) {
    const { start, end } = result.range;
    let before = text.slice(0, start);
    let after = text.slice(end);
    let insert = item.insert;
    const isEntry = result.slot && result.slot.kind === 'dhatu-entry';
    let extra = '';
    if (isEntry) {
        const m = /^\s*\)/.exec(after);
        if (m) {
            if (item.afterClose) {
                const close = m[0].length;
                extra = after.slice(0, close) + item.afterClose;
                after = after.slice(close);
            }
        } else {
            insert += ')' + (item.afterClose || '');
        }
        const cursor = (before + insert + extra).length;
        return { text: before + insert + extra + after, cursor };
    }
    const next = after.length ? after[0] : '';
    if (!insert.endsWith(' ') && !isSpace(next) && next !== ')') {
        insert += ' ';
    }
    return { text: before + insert + after, cursor: (before + insert).length };
}

// The width of one level of nesting when the editor indents a line.
export const INDENT = '  ';

/** Returns the number of lists that are open (not yet closed by `)`) before `pos`. */
export function depthAt(text, pos) {
    let depth = 0;
    for (let i = 0; i < pos && i < text.length; i++) {
        if (text[i] === '(') {
            depth++;
        } else if (text[i] === ')' && depth > 0) {
            depth--;
        }
    }
    return depth;
}

/**
 * Replaces the selection `[start, end)` with a newline and the indent for the new line: two
 * spaces for each list that is open at that point.
 *
 * Returns `{ text, cursor }`.
 */
export function newlineWithIndent(text, start, end = start) {
    const insert = '\n' + INDENT.repeat(depthAt(text, start));
    return { text: text.slice(0, start) + insert + text.slice(end), cursor: start + insert.length };
}

/**
 * Handles typing `)` at `cursor`. If only spaces come before the cursor on its line, the line is
 * re-indented to the level of the list that the `)` closes, so that the `)` lines up with that
 * list's `(`.
 *
 * Returns `{ start, end, replacement }` (replace `[start, end)` with `replacement`) or null if the
 * `)` is not at the start of a line and needs no special handling.
 */
export function closeParenIndent(text, cursor) {
    const lineStart = text.lastIndexOf('\n', cursor - 1) + 1;
    if (!/^[ \t]*$/.test(text.slice(lineStart, cursor))) {
        return null;
    }
    const depth = depthAt(text, cursor);
    if (depth === 0) {
        return null;
    }
    return { start: lineStart, end: cursor, replacement: INDENT.repeat(depth - 1) + ')' };
}

// The line width that `formatLisp` breaks lines at.
export const FORMAT_WIDTH = 72;

// Parses `text` into a list of nodes: an atom is a string, a list is an array. Returns null if
// the parentheses do not balance.
function parseNodes(text) {
    const root = [];
    const stack = [root];
    let tok = '';
    const flush = () => {
        if (tok) {
            stack[stack.length - 1].push(tok);
        }
        tok = '';
    };
    for (const c of text) {
        if (c === '(') {
            flush();
            const list = [];
            stack[stack.length - 1].push(list);
            stack.push(list);
        } else if (c === ')') {
            flush();
            if (stack.length === 1) {
                return null;
            }
            stack.pop();
        } else if (isSpace(c)) {
            flush();
        } else {
            tok += c;
        }
    }
    flush();
    return stack.length === 1 ? root : null;
}

function flatten(node) {
    return Array.isArray(node) ? '(' + node.map(flatten).join(' ') + ')' : node;
}

function layout(node, indent, width) {
    const flat = flatten(node);
    if (!Array.isArray(node) || indent + flat.length <= width) {
        return flat;
    }
    const pad = ' '.repeat(indent + INDENT.length);
    const lines = [];
    let i = 0;
    let first = '(';
    if (typeof node[0] === 'string') {
        // The head and the atoms that directly follow it stay on the first line.
        let j = 0;
        while (j < node.length && typeof node[j] === 'string') {
            j++;
        }
        first += node.slice(0, j).join(' ');
        i = j;
    } else if (node.length) {
        first += layout(node[0], indent + 1, width);
        i = 1;
    }
    lines.push(first);
    while (i < node.length) {
        if (typeof node[i] === 'string') {
            // A run of atoms shares a line.
            let j = i;
            while (j < node.length && typeof node[j] === 'string') {
                j++;
            }
            lines.push(pad + node.slice(i, j).join(' '));
            i = j;
        } else {
            lines.push(pad + layout(node[i], indent + INDENT.length, width));
            i++;
        }
    }
    return lines.join('\n') + ')';
}

/**
 * Lays out the expression(s) in `text`: a list that fits within `width` columns stays on one
 * line; a longer one keeps its head on the first line, and each of its sublists goes on its own
 * line, indented by two spaces. Each top-level expression starts a new line.
 *
 * Returns null if the parentheses do not balance, so the caller can leave the text alone.
 */
export function formatLisp(text, width = FORMAT_WIDTH) {
    const nodes = parseNodes(text);
    return nodes ? nodes.map((n) => layout(n, 0, width)).join('\n') : null;
}

/**
 * Returns the `{ left, top, height }` of the caret at `position` in `textarea`, relative to the
 * textarea's top-left corner. It mirrors the text in a hidden element that has the same style.
 */
export function caretPosition(textarea, position) {
    const doc = textarea.ownerDocument;
    const style = doc.defaultView.getComputedStyle(textarea);
    const div = doc.createElement('div');
    const props = ['boxSizing', 'width', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle',
        'letterSpacing', 'lineHeight', 'textTransform', 'wordSpacing', 'textIndent', 'tabSize',
        'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderTopWidth',
        'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'];
    for (const p of props) div.style[p] = style[p];
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordWrap = 'break-word';
    div.style.overflow = 'hidden';
    div.textContent = textarea.value.slice(0, position);
    const span = doc.createElement('span');
    span.textContent = textarea.value.slice(position) || '.';
    div.appendChild(span);
    doc.body.appendChild(div);
    const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2;
    const ret = {
        left: span.offsetLeft - textarea.scrollLeft,
        top: span.offsetTop - textarea.scrollTop,
        height: lineHeight,
    };
    doc.body.removeChild(div);
    return ret;
}

/**
 * Finds the parenthesis pair to highlight for a caret at `cursor`.
 *
 * The parenthesis just before the caret counts first, then the one just after it. Returns
 * `{ at, match }` where `at` is the index of that parenthesis and `match` is the index of its
 * partner, or -1 if it has none. Returns null if the caret is not next to a parenthesis.
 */
export function matchingParen(text, cursor) {
    let at = -1;
    if (cursor > 0 && (text[cursor - 1] === '(' || text[cursor - 1] === ')')) {
        at = cursor - 1;
    } else if (cursor < text.length && (text[cursor] === '(' || text[cursor] === ')')) {
        at = cursor;
    }
    if (at < 0) return null;
    const step = text[at] === '(' ? 1 : -1;
    let depth = 0;
    for (let i = at; i >= 0 && i < text.length; i += step) {
        if (text[i] === '(') depth += step;
        else if (text[i] === ')') depth -= step;
        if (depth === 0) return { at, match: i };
    }
    return { at, match: -1 };
}

// The option names, for colouring: `(sanAdi san)`, `(arTa Karta)` and so on. `stri` is the option
// of `samAsa`, not the command `strI`.
const OPTION_NAMES = new Set([
    ...KRT_OPTIONS, ...TADDHITA_OPTIONS, ...DHATU_OPTIONS, ...NAMA_OPTIONS, 'stri',
    ...Object.entries(HEAD_ALIASES).filter(([, v]) => !v.startsWith(':') && !COMMANDS.includes(v)).map(([k]) => k),
]);

/**
 * Says how to colour the first word of a list: `'command'` (`tiN`, `kft`, ...), `'base'` (any
 * word that starts with a colon, such as `:DAtu`), `'option'` (`sanAdi`, `arTa`, ...) or `''`.
 * `toSlp1` converts the word first, so Devanagari is coloured the same way.
 */
export function headKind(word, toSlp1 = (w) => w) {
    const w = canon(toSlp1(word));
    if (COMMANDS.includes(w)) return 'command';
    if (w.startsWith(':')) return 'base';
    if (OPTION_NAMES.has(w)) return 'option';
    return '';
}

/**
 * Splits `text` into `{ text, mark, kind }` segments for drawing behind the editor. `mark` is
 * `'match'` for a parenthesis of a matched pair, `'unmatched'` for one without a partner, and
 * `''` for the rest. `kind` is the `headKind` of the word that starts a list, and `''` for other
 * text. A final newline is added so that the last line has the height that the text area gives it.
 */
export function parenSegments(text, cursor, toSlp1 = (w) => w) {
    const n = text.length;
    const marks = new Array(n).fill('');
    const kinds = new Array(n).fill('');
    const m = matchingParen(text, cursor);
    if (m) {
        marks[m.at] = m.match < 0 ? 'unmatched' : 'match';
        if (m.match >= 0) marks[m.match] = 'match';
    }
    for (let i = 0; i < n; i++) {
        if (text[i] !== '(') continue;
        let a = i + 1;
        while (a < n && isSpace(text[a])) a++;
        let b = a;
        while (b < n && !isSpace(text[b]) && text[b] !== '(' && text[b] !== ')') b++;
        if (b > a) kinds.fill(headKind(text.slice(a, b), toSlp1), a, b);
    }
    const out = [];
    let from = 0;
    for (let i = 1; i <= n; i++) {
        if (i < n && marks[i] === marks[from] && kinds[i] === kinds[from]) continue;
        out.push({ text: text.slice(from, i), mark: marks[from], kind: kinds[from] });
        from = i;
    }
    out.push({ text: '\n', mark: '', kind: '' });
    return out;
}
