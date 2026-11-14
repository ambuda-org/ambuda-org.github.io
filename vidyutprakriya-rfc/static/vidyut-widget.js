// A widget that shows part of the output of a Lisp expression: a table, a row, one form, or the
// derivation of one word. It is for pages that embed the output. The Advanced tab of the demo does
// not use it, and the widget has none of its developer output (debug lines, the marker rows
// between phases, links into the source).
//
// Usage
// -----
//
// ```
// import { VidyutWidget } from "/static/vidyut-widget.js";
//
// VidyutWidget.render(document.getElementById("a"), { lispz: Z });
// VidyutWidget.render(document.getElementById("b"), { lispz: Z, view: "row", row: "saptamI" });
// VidyutWidget.render(document.getElementById("c"), { lispz: Z, view: "derivation", rules: "both" });
// ```
//
// Options (all but the expression are optional)
// ---------------------------------------------
//
// - `lispz`: a link made by the demo. Or `lisp`: the expression in SLP1. Give one; `lispz` wins.
// - `view`: `table` (default), `row`, `cell` or `derivation`.
// - `row`: a row label (`saptamI`) or a number (`7`). Needed by `row` and `cell`.
// - `col`: a column label (`eka`) or a number (`1`). Needed by `cell`.
// - `word`: a form (SLP1) of the table. For `derivation`. Without it, the form at `row` and `col`
//   is used, and without those the first form of the table.
// - `rules`: how a step names its rule: `both` (default: the text of the sutra, vartika or other
//   rule, and its number), `text` or `number`. A rule that has no text is shown by its number.
// - `ruleLinks`: whether a rule links to ashtadhyayi.com. On by default.
// - `linkTarget`: the `target` of those links. `_blank` by default.
// - `script`: `deva` (default), `slp1`, `iast`, `itrans`, `telugu` or `kannada`.
// - `dhatu`: whether to show a dhatu with its artha before its first step. On by default.
// - `interactive`: whether a form of a table is a link that opens its derivation in the widget, with
//   a button that goes back to the table. On by default.
// - `mainRules`: whether to leave out the minor rules (those that only prepare or tidy a term, such
//   as 1.3.9), as the "Main Sutras" box of the demo does. On by default.
// - `onSelect`: a function that is called with `{ word, row, col }` (the row and column are
//   1-based) when a form is chosen with the mouse. It only tells; the widget still opens the form.

import { stepRows } from "./lisp-steps.js";

const VIEWS = ["table", "row", "cell", "derivation"];
const RULES = ["number", "text", "both"];
const SCRIPTS = { deva: "devanagari", slp1: "slp1", iast: "iast", itrans: "itrans", telugu: "telugu", kannada: "kannada" };

// ===================================================
// Options
// ===================================================

/**
 * Returns the options with defaults filled in, or `{ error }` that says what is wrong.
 * `raw` is an object or a `URLSearchParams`.
 */
export function parseOptions(raw) {
    const get = (k) => {
        const v = raw instanceof URLSearchParams ? raw.get(k) : raw?.[k];
        return v === undefined || v === null || v === "" ? null : v;
    };
    const flag = (k, dflt) => {
        const v = get(k);
        if (v === null) return dflt;
        return !(v === false || v === "false" || v === "0");
    };
    const oneOf = (k, allowed, dflt) => {
        const v = get(k);
        return v === null ? dflt : allowed.includes(v) ? v : { error: `Unknown ${k} '${v}'; use ${allowed.join(", ")}.` };
    };

    const lispz = get("lispz");
    const lisp = get("lisp");
    if (lispz === null && lisp === null) {
        return { error: "Give an expression with `lispz` or `lisp`." };
    }
    const view = oneOf("view", VIEWS, "table");
    const rules = oneOf("rules", RULES, "both");
    const script = oneOf("script", Object.keys(SCRIPTS), "deva");
    for (const v of [view, rules, script]) {
        if (v.error) return v;
    }
    const opts = {
        lispz,
        lisp,
        view,
        row: get("row"),
        col: get("col"),
        word: get("word"),
        rules,
        ruleLinks: flag("ruleLinks", true),
        linkTarget: get("linkTarget") ?? "_blank",
        script,
        dhatu: flag("dhatu", true),
        interactive: flag("interactive", true),
        mainRules: flag("mainRules", true),
        // Set by the widget when a form was chosen in a table: where it is, and whether to offer
        // a way back.
        pos: raw instanceof URLSearchParams ? null : (raw?._pos ?? null),
        back: raw instanceof URLSearchParams ? false : !!raw?._back,
    };
    if ((view === "row" || view === "cell") && opts.row === null) {
        return { error: `\`view=${view}\` needs \`row\`.` };
    }
    if (view === "cell" && opts.col === null) {
        return { error: "`view=cell` needs `col`." };
    }
    return opts;
}

// ===================================================
// Tables
// ===================================================

/** Returns the first table of an evaluated expression, or null. */
export function firstTable(result) {
    for (const block of result?.blocks || []) {
        for (const section of block.sections || []) {
            if (section.kind === "table" && section.table) return section.table;
        }
    }
    return null;
}

// An index in `labels` for a label (compared without case) or a 1-based number. Else -1.
function indexOfLabel(labels, key) {
    const k = String(key).trim();
    if (/^\d+$/.test(k)) {
        const n = Number(k);
        return n >= 1 && n <= labels.length ? n - 1 : -1;
    }
    // A label may start with its number, as in `1 praTamA`.
    const plain = (l) => l.replace(/^\d+\s+/, "").toLowerCase();
    return labels.findIndex((l) => l.toLowerCase() === k.toLowerCase() || plain(l) === k.toLowerCase());
}

// A label without its number: `1 praTamA` is `praTamA`.
const plainLabel = (l) => l.replace(/^\d+\s+/, "");

/** Returns the index of the row `key` of `table`, or -1. */
export function rowIndex(table, key) {
    return indexOfLabel(table.rowLabels, key);
}

/** Returns the index of the column `key` of `table`, or -1. */
export function colIndex(table, key) {
    return indexOfLabel(table.colLabels, key);
}

/**
 * Returns the derivation that `opts` asks for, as `{ derivation, i, j, k }`, or `{ error }`.
 * `opts.word` wins over `row` and `col`. With none of them, it is the first form of the table.
 */
export function pickDerivation(table, opts) {
    const at = (i, j, k) => ({ derivation: table.derivations?.[i]?.[j]?.[k], i, j, k });
    const found = (r) => (r.derivation ? r : { error: "That form has no derivation." });

    if (opts.pos) {
        return found(at(opts.pos.i, opts.pos.j, opts.pos.k));
    }
    if (opts.word) {
        for (let i = 0; i < table.cells.length; i++) {
            for (let j = 0; j < table.cells[i].length; j++) {
                const k = table.cells[i][j].indexOf(opts.word);
                if (k >= 0) return found(at(i, j, k));
            }
        }
        return { error: `The expression does not derive '${opts.word}'.` };
    }
    if (opts.row !== null) {
        const i = rowIndex(table, opts.row);
        if (i < 0) return { error: unknownRow(table, opts.row) };
        let js = table.colLabels.map((_, j) => j);
        if (opts.col !== null) {
            const j = colIndex(table, opts.col);
            if (j < 0) return { error: unknownCol(table, opts.col) };
            js = [j];
        }
        for (const j of js) {
            if (table.cells[i][j]?.length > 0) return found(at(i, j, 0));
        }
        return { error: "That cell is empty." };
    }
    for (let i = 0; i < table.cells.length; i++) {
        for (let j = 0; j < table.cells[i].length; j++) {
            if (table.cells[i][j].length > 0) return found(at(i, j, 0));
        }
    }
    return { error: "The expression has no forms." };
}

export function unknownRow(table, key) {
    return `Unknown row '${key}'; use ${plainLabel(table.rowLabels[0])} or 1–${table.rowLabels.length}.`;
}

export function unknownCol(table, key) {
    return `Unknown column '${key}'; use ${table.colLabels.join(", ")} or 1–${table.colLabels.length}.`;
}

// ===================================================
// Derivations
// ===================================================

/**
 * Returns the derivation `d` and the derivations of its bases, in the order that they enter the
 * word, each as `{ text, history, dhatus, base }`.
 */
export function chainOf(d) {
    const part = (x, base) => ({ text: x.text, history: x.history, dhatus: x.dhatus || [], base });
    const bases = (x) => (x.bases || []).flatMap((b) => [...bases(b), part(b, true)]);
    return [...bases(d), part(d, false)];
}

/**
 * Returns whether the widget leaves out a step. A step without a sutra is developer output: a debug
 * line or a marker between phases.
 */
export function isDeveloperStep(step) {
    return step.rule.code.trim() === "";
}

// Rules that only prepare or tidy a term. The demo's "Main Sutras" box hides them.
const MINOR_RULES = new Set([
    "1.1.37", "1.1.51", "1.3.1", "1.3.2", "1.3.3", "1.3.4", "1.3.5", "1.3.6", "1.3.7", "1.3.8", "1.3.9",
    "1.2.45", "3.4.114", "1.1.43", "1.4.58", "1.4.59", "1.4.60", "1.4.80", "6.1.4", "6.1.5", "8.4.68",
    "3.4.113", "2.3.48", "1.4.17", "2.3.49", "1.4.7",
]);
// Rules that name something (a samjna), and a rule that can be undone. The demo marks them.
const SAMJNA_RULES = new Set(["1.2.46", "1.4.14", "3.1.32"]);
const REVERSIBLE_RULES = new Set(["7.2.67"]);

/** Returns whether a rule is one of the minor rules. */
export function isMinorRule(rule) {
    return MINOR_RULES.has(rule.code);
}

/** Returns the class that marks a step's row: `vw-samjna`, `vw-reversible`, `vw-minor` or "". */
export function stepClass(rule) {
    if (MINOR_RULES.has(rule.code)) return "vw-minor";
    if (SAMJNA_RULES.has(rule.code)) return "vw-samjna";
    if (REVERSIBLE_RULES.has(rule.code)) return "vw-reversible";
    return "";
}

/**
 * Returns the rows of a part: see `stepRows`. `labelOf` renders the text of a finished base. A
 * step without a sutra is left out, and so is a minor rule if `mainRules` is true.
 */
export function widgetStepRows(part, labelOf, mainRules = false) {
    const hidden = (step) => isDeveloperStep(step) || (mainRules && isMinorRule(step.rule));
    return stepRows(part.history, part.dhatus, hidden, labelOf);
}

// ===================================================
// Rule names and links
// ===================================================

// Where each source of a rule lives on ashtadhyayi.com.
const SITE = "https://ashtadhyayi.com/";

/** Returns the page of a rule, or the home page of the site for a rule of an unknown source. */
export function ruleUrl(rule) {
    switch (rule.source) {
        case "ashtadhyayi":
        case "varttika":
            return `${SITE}sutraani/${rule.code}`;
        case "kaumudi":
            return `${SITE}sutraani/sk${rule.code}`;
        case "unadi":
            return `${SITE}unaadi/?scroll=unaadi-${codeToNumber(rule.code)}`;
        case "dhatupatha":
            return `${SITE}dhatu/${rule.code}`;
        case "linganushasanam":
            return `${SITE}linganushasanam?scroll=linganushasanam-${rule.code}`;
        case "anyatra":
            return rule.code.split(",")[2] || SITE;
    }
    return SITE;
}

// "1.235:2" -> 1235. A variant suffix is ignored.
function codeToNumber(code) {
    const [major, minor] = code.split(":")[0].split(".").map(Number);
    return major * 1000 + minor;
}

/** Returns the rule's name in SLP1: its number, with a word for the book if it is not the Ashtadhyayi. */
export function ruleNumber(rule) {
    const prefix = {
        varttika: "vArttika ",
        kaumudi: "kOmudI ",
        unadi: "uRAdi ",
        linganushasanam: "liNgA ",
        dhatupatha: "DAtupAWa ",
        phit: "Piw ",
    }[rule.source];
    if (rule.source === "anyatra") return rule.code.split(",")[0].replaceAll("।", ".");
    return ((prefix || "") + rule.code).replaceAll("।", ".");
}

/**
 * Returns the text of a rule in SLP1 from `texts`, a map of `sutras`, `varttikas`, `kaumudi`,
 * `dhatuGanaSutras`, `linganushasanam` and `unadipatha` to `{ code: text }`. Returns "" if the rule
 * has no text.
 */
export function ruleText(rule, texts) {
    const from = (map, code) => (texts?.[map] && texts[map][code]) || "";
    switch (rule.source) {
        case "ashtadhyayi":
            return from("sutras", rule.code);
        case "kaumudi":
            return from("kaumudi", rule.code);
        case "varttika":
            return from("varttikas", rule.code);
        case "dhatupatha":
            return from("dhatuGanaSutras", rule.code);
        case "linganushasanam":
            return from("linganushasanam", rule.code);
        case "unadi":
            return from("unadipatha", rule.code.split(":")[0]);
        case "anyatra":
            return rule.code.split(",")[1] || "";
    }
    return "";
}

/**
 * Returns what the two rule columns of a step show, in SLP1: `{ text, number }`, each a
 * `{ text, link }` or null. `link` is true if `text` links to the rule. `mode` is `number`, `text`
 * or `both`; a rule without text is shown by its number in every mode.
 */
export function ruleCells(rule, mode, texts) {
    const number = ruleNumber(rule);
    const text = ruleText(rule, texts);
    if (mode === "number" || text === "") return { text: null, number: { text: number, link: true } };
    if (mode === "text") return { text: { text, link: true }, number: null };
    return { text: { text, link: false }, number: { text: number, link: true } };
}

// ===================================================
// Script
// ===================================================

const removeSvaras = (s) => s.replaceAll(/[\^\\]/g, "");

/** Returns `slp1` (without its accent marks) in `script` (a key of `SCRIPTS`). */
export function transliterate(slp1, script, sanscript) {
    const text = removeSvaras(slp1);
    if (script === "slp1" || !sanscript) return text;
    return sanscript.t(text, "slp1", SCRIPTS[script]);
}

// ===================================================
// The engine: wasm, the sutra texts and Sanscript. One per page.
// ===================================================

const SANSCRIPT_URL = "https://cdn.jsdelivr.net/npm/@indic-transliteration/sanscript@1.2.7/sanscript.min.js";

function loadScript(url) {
    return new Promise((resolve, reject) => {
        const el = document.createElement("script");
        el.src = url;
        el.onload = resolve;
        el.onerror = () => reject(new Error(`Could not load ${url}`));
        document.head.appendChild(el);
    });
}

const here = (path) => new URL(path, import.meta.url).href;

async function fetchTsv(path) {
    const resp = await fetch(here(path));
    if (!resp.ok) return {};
    const map = {};
    (await resp.text()).split(/\r?\n/).forEach((line) => {
        const [id, text] = line.split(/\t/);
        map[id] = text;
    });
    return map;
}

let enginePromise = null;

/** Loads the engine once, and returns it as `{ vidyut, texts, sanscript }`. */
export function loadEngine() {
    if (!enginePromise) {
        enginePromise = (async () => {
            const wasm = await import("./vidyut-prakriya.js");
            await wasm.initWasm();
            const vidyut = new wasm.Vidyut();
            const resp = await fetch(here("./data/dhatupatha.tsv"));
            vidyut.loadDhatupatha(await resp.text());
            // Only the texts of the rules are needed, and only for `rules=text` and `both`, but
            // they are small.
            const [sutras, varttikas, kaumudi, dhatuGanaSutras, linganushasanam, unadipatha] = await Promise.all(
                ["sutrapatha", "varttikas", "kaumudi", "dhatupatha-ganasutras", "linganushasanam", "unadipatha"].map((n) =>
                    fetchTsv(`./data/${n}.tsv`),
                ),
            );
            let sanscript = globalThis.Sanscript;
            if (!sanscript) {
                try {
                    await loadScript(SANSCRIPT_URL);
                    sanscript = globalThis.Sanscript;
                } catch (e) {
                    console.warn("Showing SLP1: could not load Sanscript.", e);
                }
            }
            return {
                vidyut,
                sanscript,
                texts: { sutras, varttikas, kaumudi, dhatuGanaSutras, linganushasanam, unadipatha },
            };
        })();
        enginePromise.catch(() => {
            enginePromise = null;
        });
    }
    return enginePromise;
}

/** Evaluates the expression of `opts`: returns the result of `evaluateLisp` or `{ error }`. */
export function evaluate(engine, opts) {
    let input = opts.lisp;
    if (opts.lispz !== null) {
        const decoded = engine.vidyut.decodeLisp(opts.lispz);
        if (decoded.value === null) {
            return { error: `Cannot open this link: ${decoded.error}.` };
        }
        input = decoded.value;
    }
    try {
        const result = engine.vidyut.evaluateLisp(input);
        return result.error ? { error: result.error } : result;
    } catch (e) {
        return { error: `Internal error while deriving this expression: ${e}` };
    }
}

// ===================================================
// Rendering
// ===================================================

const STYLE_ID = "vidyut-widget-style";
const STYLE = `
.vw { font-family: inherit; color: inherit; }
.vw table { border-collapse: collapse; width: 100%; margin: .5em 0; }
.vw th, .vw td { border: 1px solid #cbd5e1; padding: .35em .7em; text-align: left; vertical-align: top; }
.vw th { background: #f1f5f9; }
.vw .vw-rowlabel { background: #f8fafc; color: #334155; }
.vw .vw-changed { color: #b91c1c; }
.vw .vw-plus { color: #9ca3af; font-size: .875rem; }
.vw .vw-artha { color: #f97316; }
/* The 8 by 3 table of forms, in the look of the Subantani tab. */
.vw table.vw-paradigm { width: 100%; table-layout: fixed; margin: 1rem 0; border: 1px solid #e5e7eb; text-align: left; font-size: 1.25rem; line-height: 1.75rem; }
.vw table.vw-paradigm th, .vw table.vw-paradigm td { border: 0; padding: .5rem; }
.vw table.vw-paradigm thead tr { background: #f1f5f9; }
.vw table.vw-paradigm th { background: #f1f5f9; }
.vw table.vw-paradigm td.vw-rowlabel { background: #f1f5f9; font-weight: 700; color: inherit; }
.vw table.vw-paradigm a.vw-form { color: inherit; text-decoration: none; }
.vw table.vw-paradigm a.vw-form:hover { text-decoration: underline; }
/* The prakriya, in the look of the Subantani tab. */
.vw table.vw-prakriya { border: 1px solid #e5e7eb; margin: .5rem 0 1.5rem; }
.vw table.vw-prakriya th, .vw table.vw-prakriya td { border: 0; }
.vw table.vw-prakriya caption { font-weight: 700; font-size: 1.5rem; line-height: 2rem; text-align: left; margin-bottom: .5rem; }
.vw table.vw-prakriya thead { font-weight: 700; border-bottom: 1px solid #e5e7eb; }
.vw table.vw-prakriya thead th { background: #f1f5f9; padding: .5rem 1rem; }
.vw table.vw-prakriya tr.vw-step:hover { background: #f0f9ff; }
.vw table.vw-prakriya td.vw-result { padding: .5rem 1rem; font-size: 1.25rem; line-height: 1.75rem; border-right: 1px solid #e5e7eb; }
.vw table.vw-prakriya td.vw-rule { padding: .5rem 1rem; font-size: 1.125rem; line-height: 1.75rem; }
.vw table.vw-prakriya td.vw-rule a { color: inherit; text-decoration: none; }
.vw table.vw-prakriya td.vw-number { font-size: .875rem; text-align: right; padding: 0; }
.vw table.vw-prakriya a.vw-number-link { color: #3b82f6; text-decoration: underline; display: block; padding: .5rem 1rem .5rem 0; }
.vw table.vw-prakriya a.vw-number-link:hover { color: #1e3a8a; }
.vw table.vw-prakriya .vw-src-green { color: #22c55e; }
.vw table.vw-prakriya .vw-src-orange { color: #f97316; }
.vw table.vw-prakriya tr.vw-minor { opacity: .4; }
.vw table.vw-prakriya tr.vw-samjna { background: #d9f99d; }
.vw table.vw-prakriya tr.vw-reversible { background: #ffedd5; }
.vw table.vw-prakriya tr.vw-dhatu td { background: #f8fafc; padding: .5rem 1rem; font-size: 1.125rem; line-height: 1.75rem; font-weight: 600; }
.vw table.vw-prakriya tr.vw-break td { background: #e2e8f0; height: 1.5rem; padding: 0 1rem; font-size: .875rem; font-weight: 600; color: #334155; }
.vw table.vw-prakriya tr.vw-final td { border-top: 1px solid #e5e7eb; padding: .5rem 1rem; font-size: 1.25rem; line-height: 1.75rem; font-weight: 700; }
.vw .vw-back { background: #475569; color: #fff; border: 0; border-radius: .25rem; padding: .5rem; cursor: pointer; margin: .5rem 0; }
.vw .vw-back:hover { background: #1e293b; }
.vw .vw-error { border: 1px solid #fca5a5; background: #fef2f2; color: #991b1b; padding: .5em .7em; }
.vw .vw-loading { color: #64748b; }
.vw a { color: #2563eb; }
.vw-cell { display: inline; }
@media (prefers-color-scheme: dark) {
  .vw th { background: #1e293b; } .vw .vw-rowlabel { background: #0f172a; color: #cbd5e1; }
  .vw th, .vw td { border-color: #475569; } .vw table.vw-prakriya tr.vw-dhatu td { background: #0f172a; } .vw table.vw-prakriya tr.vw-break td { background: #334155; color: #e2e8f0; }
  .vw table.vw-prakriya thead th { background: #1e293b; } .vw table.vw-prakriya, .vw table.vw-prakriya thead, .vw table.vw-prakriya td.vw-result, .vw table.vw-prakriya tr.vw-final td { border-color: #475569; }
  .vw table.vw-prakriya tr.vw-step:hover { background: #1e293b; } .vw table.vw-prakriya tr.vw-samjna, .vw table.vw-prakriya tr.vw-reversible { color: #0f172a; }
  .vw table.vw-paradigm, .vw table.vw-paradigm th, .vw table.vw-paradigm thead tr, .vw table.vw-paradigm td.vw-rowlabel { background: #1e293b; border-color: #475569; }
  .vw a { color: #93c5fd; } .vw .vw-error { background: #450a0a; color: #fecaca; border-color: #7f1d1d; }
}
`;

function ensureStyle(doc) {
    if (doc.getElementById(STYLE_ID)) return;
    const el = doc.createElement("style");
    el.id = STYLE_ID;
    el.textContent = STYLE;
    doc.head.appendChild(el);
}

function el(doc, tag, props = {}, ...children) {
    const e = doc.createElement(tag);
    const { className, text, ...attrs } = props;
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    for (const c of children) if (c) e.appendChild(c);
    return e;
}

// A text that is a mix of forms and ` / `, one piece at a time (a `/` is a svara mark in SLP1).
function slashed(s, show) {
    return s.split(" / ").map(show).join(" / ");
}

// The label of the samboDanam row, with or without its number ("8 samboDanam").
export function isSambodhana(rowLabel) {
    return /^(\d+\s+)?samboDanam$/.test(rowLabel);
}

// `onPick({ i, j, k })`, if given, makes each form a link. A form of the samboDanam row is shown
// after "he", as in the Subantani tab.
function renderTable(doc, table, rowIdxs, show, onPick) {
    const formCell = (cell, i, j) => {
        const td = el(doc, "td");
        const shown = (form) => show(isSambodhana(table.rowLabels[i]) ? `he ${form}` : form);
        if (cell.length === 0) {
            td.textContent = "-";
        }
        cell.forEach((form, k) => {
            if (k > 0) td.appendChild(doc.createTextNode(" / "));
            if (!onPick) {
                td.appendChild(doc.createTextNode(shown(form)));
                return;
            }
            const a = el(doc, "a", { href: "#", className: "vw-form", title: "Show the prakriya", text: shown(form) });
            a.addEventListener("click", (event) => {
                event.preventDefault();
                onPick({ i, j, k });
            });
            td.appendChild(a);
        });
        return td;
    };
    // As in the Subantani tab: "praTamA" without its number, and "ekavacanam" for "eka".
    const colTitle = (c) => ({ eka: "ekavacanam", dvi: "dvivacanam", bahu: "bahuvacanam" })[c] || c;
    const rowTitle = (r) => r.replace(/^\d+\s+/, "");
    const thead = el(doc, "thead", {}, el(doc, "tr", {}, el(doc, "th", { text: "\u00a0" }), ...table.colLabels.map((c) => el(doc, "th", { text: show(colTitle(c)) }))));
    const rows = rowIdxs.map((i) =>
        el(
            doc,
            "tr",
            {},
            el(doc, "td", { className: "vw-rowlabel", text: show(rowTitle(table.rowLabels[i])) }),
            ...table.cells[i].map((cell, j) => formCell(cell, i, j)),
        ),
    );
    return el(doc, "table", { className: "vw-paradigm" }, thead, el(doc, "tbody", {}, ...rows));
}

function renderStepResult(doc, step, show) {
    const td = el(doc, "td", { className: "vw-result" });
    let first = true;
    for (const term of step.result) {
        if (term.text.length === 0) continue;
        if (!first) td.appendChild(el(doc, "span", { className: "vw-plus", text: " + " }));
        first = false;
        td.appendChild(el(doc, "span", { className: term.wasChanged ? "vw-changed" : "", text: show(term.text) }));
    }
    return td;
}

// The text of a rule is coloured by its book, as in the demo: the Ashtadhyayi in the text colour,
// the Kaumudi and the varttikas in green, the others in orange.
const SOURCE_CLASS = {
    kaumudi: "vw-src-green",
    varttika: "vw-src-green",
    dhatupatha: "vw-src-orange",
    linganushasanam: "vw-src-orange",
    unadi: "vw-src-orange",
    anyatra: "vw-src-orange",
};

// The two rule cells of a step: the text of the rule, and its number.
function renderRuleCells(doc, rule, opts, engine, show) {
    const { text, number } = ruleCells(rule, opts.rules, engine.texts);
    const label = (part) => show(part.text).replaceAll("\u0964", ".");
    const linked = (part, className) =>
        opts.ruleLinks && part.link
            ? el(doc, "a", { href: ruleUrl(rule), target: opts.linkTarget, rel: "noopener", className, text: label(part) })
            : doc.createTextNode(label(part));

    const textTd = el(doc, "td", { className: `vw-rule ${SOURCE_CLASS[rule.source] || ""}` });
    if (text) textTd.appendChild(linked(text, ""));
    const numberTd = el(doc, "td", { className: "vw-number" });
    if (number) numberTd.appendChild(linked(number, "vw-number-link"));
    return [textTd, numberTd];
}

function renderDerivation(doc, derivation, opts, engine, show) {
    const wrap = el(doc, "div");
    for (const part of chainOf(derivation)) {
        const table = el(doc, "table", { className: "vw-prakriya" });
        table.appendChild(el(doc, "caption", { text: (part.base ? "Base: " : "") + show(part.text) }));
        table.appendChild(
            el(doc, "thead", {}, el(doc, "tr", {}, el(doc, "th", { text: "Result" }), el(doc, "th", { colspan: "2", text: show("sUtram") }))),
        );
        const dhatus = opts.dhatu ? part.dhatus : [];
        for (const row of widgetStepRows({ ...part, dhatus }, show, opts.mainRules)) {
            const tbody = el(doc, "tbody");
            if (row.breakBefore) {
                tbody.appendChild(el(doc, "tr", { className: "vw-break" }, el(doc, "td", { colspan: "3", text: row.breakLabel })));
            }
            for (const d of row.dhatus) {
                const text = d.artha ? slashed(d.artha, show) : "";
                tbody.appendChild(
                    el(doc, "tr", { className: "vw-dhatu" },
                        el(doc, "td", { colspan: "3" },
                            el(doc, "span", { text: show(d.upadesha) }),
                            doc.createTextNode(" "),
                            el(doc, "span", { className: "vw-artha", text })),
                    ),
                );
            }
            const hidden = isDeveloperStep(row.step) || (opts.mainRules && isMinorRule(row.step.rule));
            if (!hidden) {
                const [textTd, numberTd] = renderRuleCells(doc, row.step.rule, opts, engine, show);
                tbody.appendChild(el(doc, "tr", { className: `vw-step ${stepClass(row.step.rule)}` }, renderStepResult(doc, row.step, show), textTd, numberTd));
            }
            table.appendChild(tbody);
        }
        table.appendChild(
            el(doc, "tbody", {}, el(doc, "tr", { className: "vw-final" }, el(doc, "td", { text: show(part.text) }), el(doc, "td"), el(doc, "td"))),
        );
        wrap.appendChild(table);
    }
    return wrap;
}

/**
 * Fills `container` with the view that `opts` asks for, from the evaluated `result`. `engine` is
 * `{ texts, sanscript }`. `hooks` is `{ onPick({ i, j, k }), onBack() }`: the first is called when a
 * form of a table is chosen, and the second when the button back to the table is pressed. Returns `{ error }` if the view cannot be shown, and then shows the
 * error.
 */
export function renderView(container, result, opts, engine, hooks = {}) {
    const doc = container.ownerDocument;
    ensureStyle(doc);
    const show = (s) => transliterate(s, opts.script, engine.sanscript);
    const fail = (message) => {
        container.replaceChildren(el(doc, "div", { className: "vw vw-error", role: "alert", text: message }));
        return { error: message };
    };

    const table = firstTable(result);
    if (!table) return fail("This expression has no table of forms.");

    const onPick = opts.interactive ? hooks.onPick : undefined;
    let content;
    if (opts.view === "table") {
        content = renderTable(doc, table, table.rowLabels.map((_, i) => i), show, onPick);
    } else if (opts.view === "row") {
        const i = rowIndex(table, opts.row);
        if (i < 0) return fail(unknownRow(table, opts.row));
        content = renderTable(doc, table, [i], show, onPick);
    } else if (opts.view === "cell") {
        const i = rowIndex(table, opts.row);
        if (i < 0) return fail(unknownRow(table, opts.row));
        const j = colIndex(table, opts.col);
        if (j < 0) return fail(unknownCol(table, opts.col));
        const forms = table.cells[i][j];
        content = el(doc, "span", { className: "vw-cell", text: forms.length === 0 ? "-" : forms.map((f) => show(isSambodhana(table.rowLabels[i]) ? `he ${f}` : f)).join(" / ") });
    } else {
        const picked = pickDerivation(table, opts);
        if (picked.error) return fail(picked.error);
        content = renderDerivation(doc, picked.derivation, opts, engine, show);
        if (opts.back && hooks.onBack) {
            const button = el(doc, "button", { type: "button", className: "vw-back", text: "\u00d7 " + show(picked.derivation.text) });
            button.addEventListener("click", hooks.onBack);
            content = el(doc, "div", {}, button, content);
        }
    }
    container.replaceChildren(el(doc, opts.view === "cell" ? "span" : "div", { className: "vw" }, content));
    return {};
}

export const VidyutWidget = {
    /**
     * Shows a view of an expression in `container`. `options` is as in the comment at the top of
     * this file. `env.engine`, if given, is used in place of the one that is loaded from this
     * file's directory (for tests).
     *
     * Returns `{ ready, update(options), destroy(), result }`. `ready` is a promise that is
     * resolved when the first view is shown. `result` is the evaluated expression, or null.
     */
    render(container, options, env = {}) {
        const doc = container.ownerDocument;
        ensureStyle(doc);
        let current = options;
        const handle = { result: null };

        // A form chosen in a table opens its derivation. The view that was asked for is kept for the way back.
        const hooks = {
            onPick: ({ i, j, k }) => {
                const table = firstTable(handle.result);
                const word = table?.cells?.[i]?.[j]?.[k];
                if (typeof current.onSelect === "function") {
                    current.onSelect({ word, row: i + 1, col: j + 1 });
                }
                current = { ...current, _pos: { i, j, k }, _back: true };
                handle.ready = show();
            },
            onBack: () => {
                current = { ...current, _pos: null, _back: false };
                handle.ready = show();
            },
        };

        const show = async () => {
            // The form that was chosen in a table is shown by the derivation view.
            const opts = parseOptions(current._pos ? { ...current, view: "derivation" } : current);
            const failWith = (message) => {
                container.replaceChildren(el(doc, "div", { className: "vw vw-error", role: "alert", text: message }));
            };
            if (opts.error) return failWith(opts.error);
            container.replaceChildren(el(doc, "div", { className: "vw vw-loading", text: "…" }));
            let engine;
            try {
                engine = env.engine ?? (await loadEngine());
            } catch (e) {
                return failWith(`Could not load the engine: ${e.message ?? e}`);
            }
            const result = evaluate(engine, opts);
            if (result.error) {
                handle.result = null;
                return failWith(result.error);
            }
            handle.result = result;
            renderView(container, result, opts, engine, hooks);
        };

        handle.ready = show();
        handle.update = (next) => {
            // A new expression or view drops the form that was chosen in a table.
            const resets = ("lisp" in next && next.lisp !== current.lisp) || ("lispz" in next && next.lispz !== current.lispz) || "view" in next;
            current = { ...current, ...next, ...(resets ? { _pos: null, _back: false } : {}) };
            handle.ready = show();
            return handle.ready;
        };
        handle.destroy = () => container.replaceChildren();
        return handle;
    },
};
