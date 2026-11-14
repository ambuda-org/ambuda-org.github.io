/**
 * A simple demo interface for vidyut-prakriya.
 *
 *
 * Outline
 * =======
 *
 * Focus on `App`, which contains the main code. We use the Alpine framework,
 * which you can think of as a lightweight version of Vue.
 *
 *
 * Constraints
 * ===========
 * - This demo is served on GitHub pages. So, no databases -- everything should
 *   be done client side!
 * - This demo should use our wasm build's public API.
 * - Although this is a production site, the stakes are low -- do things the
 *   hacky way if that fixes the problem.
 */

import { isAlwaysShownStep, stepRows } from './lisp-steps.js';
import { VidyutWidget } from './vidyut-widget.js';
import { parseShabdas, filterShabdas } from './shabdapatha.js';
import { suggest, applySuggestion, caretPosition, parenSegments, newlineWithIndent, closeParenIndent, formatLisp } from "./lisp-complete.js";
import { initWasm, Krt, Gana, Vidyut, Lakara, Prayoga, Purusha, Vacana, DhatuPada, Sanadi, Antargana } from "./vidyut-prakriya.js";

// ===================================================
// vidyut-prakriya
// ===================================================

// Turn the TSV file sutrapatha.tsv into a map.
function parseSutras(tsv) {
    let sutras = {};
    tsv.split(/\r?\n/).forEach(line => {
        const [id, text] = line.split(/\t/);
        sutras[id] = text;
    });
    return sutras;
}
const sutras = fetch("static/data/sutrapatha.tsv").then(resp => resp.text()).then(text => parseSutras(text));
const varttikas = fetch("static/data/varttikas.tsv").then(resp => resp.text()).then(text => parseSutras(text));
const kaumudi = fetch("static/data/kaumudi.tsv").then(resp => resp.text()).then(text => parseSutras(text));
const dhatuGanaSutras = fetch("static/data/dhatupatha-ganasutras.tsv").then(resp => resp.text()).then(text => parseSutras(text));
const linganushasanam = fetch("static/data/linganushasanam.tsv").then(resp => resp.text()).then(text => parseSutras(text));
const unadipatha = fetch("static/data/unadipatha.tsv").then(resp => resp.text()).then(text => parseSutras(text));

// Parse a dhatupatha string into separate objects.
function parseDhatus(vidyut, tsvText) {
    const ganaMap = {
        "01": Gana.Bhvadi,
        "02": Gana.Adadi,
        "03": Gana.Juhotyadi,
        "04": Gana.Divadi,
        "05": Gana.Svadi,
        "06": Gana.Tudadi,
        "07": Gana.Rudhadi,
        "08": Gana.Tanadi,
        "09": Gana.Kryadi,
        "10": Gana.Curadi,
    }
    let dhatus = [];
    tsvText.split(/\r?\n/).forEach((line) => {
        const [code, aupadeshika, artha] = line.split(/\t/);
        // Ignore TSV header, which is just the string "code".
        if (!!code && code !== 'code') {
            const [ganaCode, antarganaCode] = code.split(".");
            const gana = ganaMap[ganaCode];
            let antargana = null;
            if (antarganaCode) {
                const codeNum = parseInt(antarganaCode);
                if (ganaCode === "01" && codeNum >= 867 && codeNum <= 932) {
                    antargana = Antargana.Ghatadi
                } else if (ganaCode === "10") {
                    if (codeNum >= 279 && codeNum <= 337) antargana = Antargana.Asvadiya;
                    else if (codeNum >= 192 && codeNum <= 236) antargana = Antargana.Akusmiya;
                    else if (codeNum >= 338 && codeNum <= 388) antargana = Antargana.Adhrshiya;
                }
            }
            let normalDhatu = "";
            if (aupadeshika !== "-") {
                // TODO: more than 1? for now, just take the first.
                normalDhatu = vidyut.deriveDhatus({ aupadeshika, gana })[0].text
            }
            dhatus.push({
                kind: "mula",
                code,
                aupadeshika,
                title: aupadeshika,
                aupadeshikaNoSvaras: removeSlpSvaras(aupadeshika),
                normalDhatu,
                gana,
                antargana,
                artha
            });
        }
    });
    // Add kandvadi gana dhatus here
    let i = 0;
   [["kaRqUY", "gAtraviGarzaRe"],
       ["mantu", "aparADe"],
       ["valgu", "pUjAmADuryayoH"],
       ["asu", "upatApe"],
       ["mahIN", "pUjAyAm"],
       ["lew", "DOrtye pUrvaBAve svapne ca"],
       ["low", "DOrtye pUrvaBAve svapne ca"],
       ["lelA", "dIptO"],
       ["iraY", "IrzyAyAm"],
       ["iraj", "IrzyAyAm"],
       ["iraY", "IrzyAyAm"]
   ].forEach((x) => {
       i++;
       let code = `kaRqvAdi-${i}`;
       dhatus.push({
           kind: "mula",
           code,
           aupadeshika: x[0],
           title: x[0],
           aupadeshikaNoSvaras: removeSlpSvaras(x[0]),
           normalDhatu: "",
           gana: Gana.Kandvadi,
           antargana: "",
           artha: x[1]
       })
   })
    return dhatus;
}

// Parse a namadhatu list (namadhatu.tsv) into separate objects.
//
// The TSV has the columns `code`, `pratipadika`, `sanadi`, `artha`. `sanadi` is the sanadi pratyaya
// that follows the pratipadika directly (kyac, kyaN, kAmyac, Ric), or "-" if the rules in 3.1
// should choose it.
function parseNamadhatus(vidyut, tsvText) {
    let namadhatus = [];
    tsvText.split(/\r?\n/).forEach((line) => {
        const [code, pratipadika, sanadi, artha] = line.split(/\t/);
        // Ignore TSV header, which is just the string "code".
        if (!code || code === 'code' || !pratipadika) {
            return;
        }
        const namaSanadi = (!sanadi || sanadi === "-") ? null : sanadi;
        if (namaSanadi !== null && Sanadi[namaSanadi] === undefined) {
            console.warn(`namadhatu ${code}: unknown sanadi "${namaSanadi}"; skipping.`);
            return;
        }

        // Used only to make the list searchable by the derived dhatu (e.g. putrIya).
        let normalDhatu = "";
        try {
            const prakriyas = vidyut.deriveDhatus({
                pratipadika: { basic: pratipadika },
                namaSanadi: namaSanadi === null ? null : Sanadi[namaSanadi],
            });
            if (prakriyas.length > 0) {
                normalDhatu = prakriyas[0].text;
            }
        } catch (e) {
            console.warn(`namadhatu ${code}: could not derive a dhatu`, e);
        }

        namadhatus.push({
            kind: "nama",
            code,
            pratipadika,
            pratipadikaNoSvaras: removeSlpSvaras(pratipadika),
            namaSanadi,
            title: namaSanadi === null ? pratipadika : `${pratipadika} + ${namaSanadi}`,
            normalDhatu,
            artha: artha || "",
        });
    });
    return namadhatus;
}

// ===================================================
// Frontend
// ===================================================

// What to call these params in the URL.
const Params = {
    Dhatu: "dhatu",
    Namadhatu: "namadhatu",
    Tab: "tab",
    DhatuPada: "pada",
    Prayoga: "prayoga",
    Sanadi: "sanadi",
    ActivePada: "activePada",
    Upasarga: "upasarga",
    SkipAtAgama: "skipAtAgama",
    Lisp: "lisp",
    LispZ: "lispz",
    SubantaStem: "subantaStem",
}

function setParam(url, key, value) {
    if (value) {
        url.searchParams.set(key, value);
    } else {
        url.searchParams.delete(key);
    }
}

function removeSlpSvaras(s) {
    return s.replaceAll(/[\^\\]/g, '');
}

function fixSvaras(s) {
    return s.replaceAll('^', " ̭");
}

// The height of the expression editor, in lines: at least the first, and at most the second once
// the Format button has grown it.
const LISP_MIN_ROWS = 6;
const LISP_MAX_ROWS = 60;

// Sutras that the Advanced tab shows even when they change nothing. It also shows every step
// whose rule comes from `anyatra` (a source cited by free text), whatever its code.
const ALWAYS_SHOWN_SUTRAS = new Set([
    "1.3.72", "1.2.46", "1.4.14", "5.4.156",
    // dvigu: these only add tags
    "2.1.51", "2.4.1", "2.4.17", "4.1.21.1", "4.1.21.2",
]);

function codeToNumber(code) {
    // Ignore a variant suffix: "1.235:2" is the same sutra as "1.235".
    const [major, minor] = code.split(':')[0].split('.').map(Number);
    // Multiply major by 1000 to "shift" it left, then add minor
    return (major * 1000) + minor;
}

function splitIfComma(str) {
    if (str.includes(',')) {
        return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
    } else {
        return [str.trim()];
    }
}
function parseStepText(input) {
    const regex = /^(.*?)@\[([^:]+):(\d+)\](.*)$/;
    const match = input.match(regex);

    if (!match) {
        return null; // input not in expected form
    }

    const [, text, filename, line, supporting_info] = match;
    return { text, filename, line: parseInt(line, 10), supporting_info };
}

// The widget of the Subantani tab. It is kept out of the Alpine state, which would wrap it.
let subantaHandle = null;

const App = () => ({
    activeTab: 'about',

    // The selected pada for the selected dhatu/pratipadika.
    activePada: null,

    // Dhatus
    // ------
    dhatus: [],
    // The selected dhatu.
    activeDhatu: null,
    // The prakriya for the selected pada.
    dhatuPrakriya: null,

    // Namadhatus
    // ----------
    namadhatus: [],
    // "loading", "ready", or "missing" (if namadhatu.tsv could not be loaded).
    namadhatuStatus: "loading",
    // The selected namadhatu.
    activeNamadhatu: null,

    // Subantas
    // --------

    // The Subantani tab, which shows its forms with the widget in `vidyut-widget.js`. The words come
    // from `data/shabdapatha.tsv` (copied to `static/data/` by `scripts/run-debugger.sh`).
    shabdas: [],
    shabdaFilter: null,
    // `loading`, `ready` or `missing`.
    shabdaStatus: 'loading',
    // The key of the chosen entry of `shabdas`, or null.
    subantaStem: null,


    // Advanced (Lisp expressions)
    // ---------------------------
    // The expression in the text area.
    lispInput: '',
    // The result of the last evaluation (see `Vidyut.evaluateLisp`), or null.
    lispResult: null,
    // The error message of the last evaluation, or null.
    lispError: null,
    // The suggestions pop-up of the expression editor. `items` are the choices, `active` is the
    // highlighted one, and `left` and `top` place the pop-up under the caret.
    lispSuggest: { open: false, items: [], active: 0, hint: '', left: 0, top: 0, result: null },
    // The form of a table whose prakriya is shown instead of the table (a derivation, see
    // `Vidyut.evaluateLisp`), or null.
    lispActiveForm: null,
    // The caret of the expression editor. Used to highlight the parenthesis that matches the one
    // next to the caret.
    lispCaret: 0,
    lispFormatError: '',
    // Values for the enum-valued slots (see `Vidyut.lispCompletions`).
    lispCompletions: null,

    // UI options
    // ----------
    // The desired prayoga.
    prayoga: null,
    // The desired upasarga.
    upasarga: null,
    // The desired sanAdi pratyaya.
    sanadi: null,
    // A filter to apply to the dhatu list.
    dhatuFilter: null,
    // A filter to apply to the namadhatu list.
    namadhatuFilter: null,
    // Skip AtAgama
    skipAtAgama: false,
    // Skip Comman Sutras
    skipCommonSutras: true,
    lispRows: LISP_MIN_ROWS,

    // data
    sutras: {},
    varttikas: {},
    kaumudi: {},
    dhatuGanaSutras: {},
    linganushasanam: {},
    unadipatha: {},

    // Transliteration script (devanagari, iast, telugu, etc.)
    script: 'devanagari',

    async init() {
        // Initialize WASM environment.
        await initWasm();

        const resp = await fetch("static/data/dhatupatha.tsv");
        const dhatupatha = await resp.text();

        // Vidyut needs its own copy of the dhatupatha.
        this.vidyut = new Vidyut();
        // Lisp expressions use this to resolve dhatus whose svaras were left out.
        this.vidyut.loadDhatupatha(dhatupatha);
        this.lispCompletions = this.vidyut.lispCompletions();
        console.log("Initialized vidyut-prakriya WASM bindings.");

        this.dhatus = parseDhatus(this.vidyut, dhatupatha);
        await this.loadNamadhatus();
        await this.loadShabdas();

        // TODO: set state earlier. But, our current implemenation needs to
        // wait for the dhatus to load so that we can set activeDhatu.
        this.readUrlState();

        // Save important properties to the URL when they change.
        const watched = ['activeDhatu', 'activeNamadhatu', 'activeTab', 'sanadi', 'prayoga', 'upasarga', 'activePada', 'skipAtAgama', 'subantaStem'];
        this.$watch('script', () => this.subantaRender());
        this.$watch('skipCommonSutras', () => this.subantaRender());
        watched.forEach(prop => {
            this.$watch(prop, () => this.updateUrlState());
        });

        this.sutras = await sutras;
        this.varttikas = await varttikas;
        this.dhatuGanaSutras = await dhatuGanaSutras;
        this.kaumudi = await kaumudi;
        this.linganushasanam = await linganushasanam;
        this.unadipatha = await unadipatha;
    },

    // Mutators

    // Load the application state from the URL, if applicable.
    readUrlState() {
        const params = new URLSearchParams(window.location.search);
        const dhatuCode = params.get(Params.Dhatu);
        const namadhatuCode = params.get(Params.Namadhatu);
        const tab = params.get(Params.Tab);
        const prayoga = params.get(Params.Prayoga);
        const upasarga = params.get(Params.Upasarga);
        const sanadi = params.get(Params.Sanadi);
        const activePada = params.get(Params.ActivePada);
        const skipAtAgama = params.get(Params.SkipAtAgama);
        const lisp = params.get(Params.Lisp);
        const lispz = params.get(Params.LispZ);
        const subantaStem = params.get(Params.SubantaStem);

        console.log(`realUrlState, prayoga=${prayoga}, upasarga=${upasarga}, sanadi=${sanadi},  dhatuCode=${dhatuCode}`);
        if (tab) {
            this.setTab(tab);
        }
        if (subantaStem && this.shabdas.some(x => x.key === subantaStem)) {
            this.subantaStem = subantaStem;
            this.subantaRender();
        }
        if (prayoga) {
            this.prayoga = parseInt(prayoga);
        }
        if (upasarga) {
            this.upasarga = upasarga;
        }
        if (skipAtAgama === "true") {
            this.skipAtAgama = true;
        }
        if (sanadi) {
            this.sanadi = sanadi;
        }
        if (dhatuCode) {
            this.setActiveDhatu(dhatuCode);
        }
        if (namadhatuCode) {
            this.setActiveNamadhatu(namadhatuCode);
        }
        if (activePada) {
            this.setActivePada(JSON.parse(activePada));
        }
        if (lispz) {
            // A compact link. If it was changed, say so and do not guess.
            const decoded = this.vidyut.decodeLisp(lispz);
            if (decoded.value !== null) {
                // Show it laid out, as if Format had been pressed. The text of a decoded link
                // is on one line.
                const shown = this.lispShow(decoded.value);
                this.lispInput = this.lispLayOut(shown) ?? shown;
                this.lispFitRows(this.lispInput);
                this.evaluateLisp();
            } else {
                this.lispFormatError = 'Cannot open this link: ' + decoded.error + '.';
            }
        } else if (lisp) {
            this.lispInput = lisp;
            this.evaluateLisp();
        }
    },

    // Encode the current application state in the URL so that it can be
    // referenced later.
    updateUrlState() {
        const url = new URL(window.location.href);
        let dhatuCode = null;
        if (this.activeDhatu) {
            dhatuCode = this.activeDhatu.code;
        }
        setParam(url, Params.Dhatu, dhatuCode);
        setParam(url, Params.Namadhatu, this.activeNamadhatu ? this.activeNamadhatu.code : null);
        setParam(url, Params.Tab, this.activeTab);
        setParam(url, Params.SubantaStem, this.subantaStem);
        setParam(url, Params.Prayoga, this.prayoga);
        setParam(url, Params.Sanadi, this.sanadi);
        setParam(url, Params.Upasarga, this.upasarga);
        setParam(url, Params.SkipAtAgama, this.skipAtAgama);
        // The expression goes in the URL as a compact string. If it cannot be encoded (it has a
        // parenthesis too many, for example), the text itself goes there.
        const lispText = this.activeTab === 'advanced' ? this.lispInput.trim() : '';
        const lispz = lispText && this.vidyut ? this.vidyut.encodeLisp(this.lispToSlp1(lispText)) : null;
        setParam(url, Params.LispZ, lispz && lispz.value !== null ? lispz.value : null);
        setParam(url, Params.Lisp, lispText && !(lispz && lispz.value !== null) ? lispText : null);
        if (this.activePada) {
            setParam(url, Params.ActivePada, JSON.stringify(this.activePada));
        } else {
            setParam(url, Params.ActivePada, null);
        }

        console.log(`updateUrlState to: atagama = ${this.skipAtAgama} , href=`, url.href);
        history.replaceState(null, document.title, url.toString());
    },

    // Lisp expressions
    // ----------------

    // Converts Devanagari in `input` to SLP1. Other text is unchanged, so SLP1 and Devanagari can
    // be mixed.
    //
    // Sanscript leaves the Vedic accent marks alone, so convert the two that SLP1 has ourselves:
    // anudatta (U+0952) is `\` and svarita (U+0951) is `^`. ASCII passes through Sanscript as-is.
    lispToSlp1(input) {
        const digits = input.replace(/[\u0966-\u096F]/g, d => String(d.charCodeAt(0) - 0x0966));
        const accents = digits.replace(/\u0952/g, '\\').replace(/[\u0951\u1CE1]/g, '^');
        return accents.replace(/[\u0900-\u097F]+/g, run => Sanscript.t(run, 'devanagari', 'slp1'));
    },

    // Returns a message for the first character in the SLP1 text `slp1` that is not ASCII, or null.
    // Such a character would otherwise reach Rust and fail there.
    lispNonAscii(slp1) {
        for (const ch of slp1) {
            if (ch.codePointAt(0) > 127) {
                const hex = ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
                return `Unsupported character "${ch}" (U+${hex}). Use SLP1 or Devanagari. ` +
                    'Some marks, such as most Vedic tone marks, have no SLP1 equivalent.';
            }
        }
        return null;
    },

    // The suggestions at the caret of the expression editor.
    lispSuggestAt(textarea) {
        return suggest(textarea.value, textarea.selectionStart, {
            dhatus: this.dhatus,
            completions: this.lispCompletions || {},
            toSlp1: (s) => this.lispToSlp1(s),
        });
    },

    // One SLP1 word in Devanagari. Not `deva`: it puts a space before the svarita to display it, and
    // a space would split the word in two. Sanscript writes `^` as U+1CE1, but `lispToSlp1` reads
    // U+0951, so use that.
    lispWord(word) {
        return Sanscript.t(word, 'slp1_accented', 'devanagari').replace(/\u1CE1/g, '\u0951');
    },

    // Writes expression text (a suggestion's label, detail or insert) in the chosen script: in
    // Devanagari if that script is chosen, otherwise as it is, in SLP1. Parentheses, colons and
    // spaces stay, and so do `true` and `false`, which are not Sanskrit. `lispToSlp1` reverses
    // this when the expression is evaluated.
    lispShow(text) {
        if (!text || this.script !== 'devanagari') {
            return text;
        }
        return text
            .split(/([\s():]+)/)
            .map((word, i) => (i % 2 === 1 || word === 'true' || word === 'false' ? word : this.lispWord(word)))
            .join('');
    },

    // The text of the expression editor in pieces, so that a matching pair of parentheses can be
    // highlighted behind the text area.
    lispSegments() {
        return parenSegments(this.lispInput, this.lispCaret, (w) => this.lispToSlp1(w)).map((seg, i) => ({ ...seg, key: i }));
    },

    // Copies the scroll position of the text area to the highlight layer behind it.
    lispSyncScroll(textarea) {
        const layer = this.$refs.lispMirror;
        if (layer && textarea) {
            layer.scrollTop = textarea.scrollTop;
            layer.scrollLeft = textarea.scrollLeft;
        }
    },

    // Opens, updates or closes the suggestions pop-up. Call it when the text or the caret changes.
    lispUpdateSuggest(textarea) {
        if (textarea) {
            this.lispCaret = textarea.selectionStart;
        }
        if (!textarea || textarea.selectionStart !== textarea.selectionEnd) {
            this.lispCloseSuggest();
            return;
        }
        const result = this.lispSuggestAt(textarea);
        if (!result.items.length && !result.hint) {
            this.lispCloseSuggest();
            return;
        }
        const pos = caretPosition(textarea, result.range.start);
        this.lispSuggest = {
            open: true,
            items: result.items,
            active: 0,
            hint: result.hint,
            left: Math.max(0, pos.left),
            top: pos.top + pos.height,
            result,
        };
    },

    lispCloseSuggest() {
        if (this.lispSuggest.open) {
            this.lispSuggest = { ...this.lispSuggest, open: false, items: [], hint: '' };
        }
    },

    // Handles a key in the expression editor. Returns nothing; it prevents the default action of
    // the keys that it uses.
    lispSuggestKey(event) {
        const textarea = event.target;
        const s = this.lispSuggest;
        if (event.key === ' ' && event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            this.lispUpdateSuggest(textarea);
            return;
        }
        const plain = !event.ctrlKey && !event.metaKey && !event.altKey && !event.isComposing;
        const accepting = s.open && s.items.length;
        if (plain && event.key === 'Enter' && !accepting) {
            // Indent the new line by the depth of nesting.
            event.preventDefault();
            const out = newlineWithIndent(textarea.value, textarea.selectionStart, textarea.selectionEnd);
            this.lispEdit(textarea, textarea.selectionStart, textarea.selectionEnd, out.text.slice(textarea.selectionStart, out.cursor));
            return;
        }
        if (plain && event.key === ')' && textarea.selectionStart === textarea.selectionEnd) {
            // A `)` at the start of a line lines up with its `(`.
            const fix = closeParenIndent(textarea.value, textarea.selectionStart);
            if (fix) {
                event.preventDefault();
                this.lispEdit(textarea, fix.start, fix.end, fix.replacement);
                return;
            }
        }
        if (!s.open || event.ctrlKey || event.metaKey || event.altKey) {
            return;
        }
        if (event.key === 'ArrowDown' && s.items.length) {
            event.preventDefault();
            s.active = (s.active + 1) % s.items.length;
        } else if (event.key === 'ArrowUp' && s.items.length) {
            event.preventDefault();
            s.active = (s.active - 1 + s.items.length) % s.items.length;
        } else if ((event.key === 'Enter' || event.key === 'Tab') && s.items.length) {
            event.preventDefault();
            this.lispAccept(textarea, s.active);
        } else if (event.key === 'Escape') {
            event.preventDefault();
            this.lispCloseSuggest();
        }
    },

    // Returns `text` laid out in the chosen script (Devanagari or SLP1), or null if its parentheses
    // do not balance. The layout is worked out in SLP1, so that it does not depend on the script.
    lispLayOut(text) {
        const laidOut = formatLisp(this.lispToSlp1(text));
        return laidOut === null ? null : this.lispShow(laidOut);
    },

    // Grows the editor to show `text`, from LISP_MIN_ROWS up to LISP_MAX_ROWS lines.
    lispFitRows(text) {
        this.lispRows = Math.min(Math.max(text.split('\n').length, LISP_MIN_ROWS), LISP_MAX_ROWS);
    },

    // Lays out the whole expression in the editor. Text with unbalanced parentheses is left as it is.
    lispFormat() {
        const textarea = this.$refs.lispEditor;
        const out = this.lispLayOut(textarea.value);
        if (out === null) {
            this.lispFormatError = 'Cannot format: the parentheses do not balance.';
            return;
        }
        this.lispFormatError = '';
        if (out !== textarea.value) {
            this.lispEdit(textarea, 0, textarea.value.length, out);
        }
        this.lispFitRows(textarea.value);
        // Dragging the resize handle sets an inline height, which wins over `rows`. Drop it so that
        // Format fits the editor to the text again.
        textarea.style.height = '';
    },

    // Replaces `[start, end)` of the editor with `text`. This goes through the browser's editing
    // command when possible, so that undo still works.
    lispEdit(textarea, start, end, text) {
        textarea.focus();
        textarea.setSelectionRange(start, end);
        if (!document.execCommand('insertText', false, text)) {
            textarea.setRangeText(text, start, end, 'end');
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
    },

    // Inserts the `index`-th suggestion. The text area keeps the focus.
    lispAccept(textarea, index) {
        const item = this.lispSuggest.items[index];
        const result = this.lispSuggest.result;
        if (!item || !result) {
            return;
        }
        // What is inserted follows the script, as what is shown does.
        const shown = { ...item, insert: this.lispShow(item.insert) };
        if (item.afterClose) {
            shown.afterClose = this.lispShow(item.afterClose);
        }
        const out = applySuggestion(textarea.value, result, shown);
        this.lispInput = out.text;
        textarea.value = out.text;
        textarea.setSelectionRange(out.cursor, out.cursor);
        textarea.focus();
        this.lispCloseSuggest();
        // Offer the next slot right away.
        this.lispUpdateSuggest(textarea);
    },

    // Evaluates the expression in the text area and shows the result below it.
    // If `scroll` is true, moves the page to the results afterwards (for Evaluate, not for the
    // evaluation that opens a shared link).
    evaluateLisp(scroll = false) {
        this.lispError = null;
        this.lispResult = null;
        this.lispActiveForm = null;
        const input = this.lispToSlp1(this.lispInput.trim());
        const nonAscii = this.lispNonAscii(input);
        if (nonAscii) {
            this.lispError = nonAscii;
        } else if (input) {
            try {
                const result = this.vidyut.evaluateLisp(input);
                if (result.error) {
                    this.lispError = result.error;
                } else {
                    this.lispResult = result;
                }
            } catch (e) {
                this.lispError = `Internal error while deriving this expression: ${e}`;
            }
        }
        this.updateUrlState();
        if (scroll) {
            this.lispScrollToResults();
        }
    },

    // Scrolls the results (or the error) into view and moves the focus to them, unless their top
    // is already in the upper part of the window.
    lispScrollToResults() {
        this.$nextTick(() => {
            const el = this.$refs.lispResults;
            if (!el) {
                return;
            }
            const top = el.getBoundingClientRect().top;
            if (top < 0 || top > window.innerHeight * 0.6) {
                el.scrollIntoView({ behavior: this.scrollBehavior(), block: 'start' });
            }
            el.focus({ preventScroll: true });
        });
    },

    // Goes back to the expression editor from the results.
    lispBackToTop() {
        const editor = this.$refs.lispEditor;
        editor.scrollIntoView({ behavior: this.scrollBehavior(), block: 'start' });
        editor.focus({ preventScroll: true });
    },

    // 'smooth', or 'auto' (a jump) for people who prefer reduced motion.
    scrollBehavior() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    },

    // Clears the text area and the result.
    clearLisp() {
        this.lispInput = '';
        this.lispActiveForm = null;
        this.lispCaret = 0;
        this.lispResult = null;
        this.lispError = null;
        this.updateUrlState();
    },

    // Shows the prakriya of a form of a table in place of the table.
    lispOpenForm(derivation) {
        if (!derivation) {
            return;
        }
        this.lispActiveForm = derivation;
        this.lispScrollToResults();
    },

    // Goes back from a form's prakriya to the table.
    lispCloseForm() {
        this.lispActiveForm = null;
    },

    // Returns `d` and the derivations of its bases, in the order that they enter the word, with the
    // bases of each base before it. Each has a `caption`.
    lispChain(d) {
        const part = (x, caption) => ({ caption, text: x.text, history: x.history, dhatus: x.dhatus || [] });
        const bases = (x) => (x.bases || []).flatMap(b => [...bases(b), part(b, 'Base: ' + this.deva(b.text))]);
        return [...bases(d), part(d, this.deva(d.text))];
    },

    // Set the active dhatu (and show its forms)
    setActiveDhatu(s) {
        this.activeDhatu = this.dhatus.find(d => d.code === s);
        console.log("activeDhatu:", this.activeDhatu);
        this.createAllTinantas();
        // Scroll position might be off if the user has scrolled far down the dhatu list.
        window.scrollTo({ top: 0 });
    },

    // Load the (optional) list of namadhatus.
    async loadNamadhatus() {
        try {
            const resp = await fetch("static/data/namadhatu.tsv");
            const namadhatu_text = await resp.text();
            if (!resp.ok) {
                console.warn(`Could not load namadhatu.tsv (HTTP ${resp.status}).`);
                this.namadhatuStatus = "missing";
                return;
            }
            this.namadhatus = parseNamadhatus(this.vidyut, namadhatu_text);
            this.namadhatuStatus = "ready";
        } catch (e) {
            console.warn("Could not load namadhatu.tsv.", e);
            this.namadhatuStatus = "missing";
        }
    },

    // Set the active namadhatu (and show its forms)
    setActiveNamadhatu(s) {
        this.activeNamadhatu = this.namadhatus.find(d => d.code === s) || null;
        console.log("activeNamadhatu:", this.activeNamadhatu);
        // Scroll position might be off if the user has scrolled far down the list.
        window.scrollTo({ top: 0 });
    },

    // Clear the active namadhatu (and show the full namadhatu list).
    clearActiveNamadhatu() {
        // As in `clearActiveDhatu`, clear the entry first.
        this.activeNamadhatu = null;
        this.sanadi = null;
        this.prayoga = null;
        this.skipAtAgama = false;
        this.clearActivePada();
    },

    // Returns the dhatu or namadhatu that is selected on the current tab, if any.
    currentEntry() {
        if (this.activeTab === 'dhatu') {
            return this.activeDhatu;
        } else if (this.activeTab === 'namadhatu') {
            return this.activeNamadhatu;
        }
        return null;
    },

    // Clear the active dhatu or namadhatu, depending on the current tab.
    clearActiveEntry() {
        if (this.activeTab === 'namadhatu') {
            this.clearActiveNamadhatu();
        } else {
            this.clearActiveDhatu();
        }
    },

    // Set the active pada (and show its prakriya)
    setActivePada(p) {
        this.activePada = p;
        this.dhatuPrakriya = this.createPrakriya();
        window.scrollTo({ top: 0 });
    },

    // Create the active pada (and show all forms for the dhatu)
    clearActivePada() {
        this.activePada = null;
        this.dhatuPrakriya = null;
    },

    // Clear the active dhatu (and show the full dhatu list).
    clearActiveDhatu() {
        // Breaks if we clear `activeDhatu` last -- not sure why. So, clear it first.
        this.activeDhatu = null;
        this.tinantas = null;
        this.sanadi = null;
        this.prayoga = null;
        this.skipAtAgama = false;
        this.clearActivePada();
    },

    // Loads the list of words of the Subantani tab.
    async loadShabdas() {
        try {
            const resp = await fetch("static/data/shabdapatha.tsv");
            if (!resp.ok) {
                console.warn(`Could not load shabdapatha.tsv (HTTP ${resp.status}).`);
                this.shabdaStatus = 'missing';
                return;
            }
            const { entries, warnings } = parseShabdas(await resp.text());
            warnings.forEach(w => console.warn(w));
            this.shabdas = entries;
            this.shabdaStatus = 'ready';
        } catch (e) {
            console.warn("Could not load shabdapatha.tsv.", e);
            this.shabdaStatus = 'missing';
        }
    },

    // The words that match the query of the search box. It may be Devanagari, Harvard-Kyoto or SLP1,
    // and is looked for in the word, the linga and, from three characters, the arTa (which is in Devanagari).
    filteredShabdas() {
        return filterShabdas(this.shabdas, this.shabdaFilter, q => [
            Sanscript.t(q, 'devanagari', 'slp1'),
            Sanscript.t(q, 'hk', 'slp1'),
        ], q => [
            Sanscript.t(q, 'hk', 'devanagari'),
            Sanscript.t(q, 'slp1', 'devanagari'),
        ]);
    },

    // The arTa of an entry in the script that was chosen for the page.
    shabdaArtha(entry) {
        return Sanscript.t(entry.artha || '', 'devanagari', this.script);
    },

    // The widget's name for the page's script.
    subantaScript() {
        return this.script === 'devanagari' ? 'deva' : this.script;
    },

    // The chosen entry of `shabdas`, or undefined.
    subantaEntry() {
        return this.shabdas.find(x => x.key === this.subantaStem);
    },

    // Chooses a word and shows its table.
    subantaPick(key) {
        this.subantaStem = key;
        this.subantaRender(true);
    },

    // Goes back from a word to the list.
    subantaClear() {
        this.subantaStem = null;
        if (subantaHandle) {
            subantaHandle.destroy();
            subantaHandle = null;
        }
    },

    // Shows the chosen word in the widget. If `reset` is true, shows the table even if a form was
    // open.
    subantaRender(reset = false) {
        const container = this.$refs.subantaWidget;
        const entry = this.subantaEntry();
        if (!container || !entry) {
            return;
        }
        // Choosing a form in the table opens its prakriya inside the widget, with a button back.
        const options = {
            lisp: entry.lisp,
            script: this.subantaScript(),
            // The "Main Sutras" box of the page.
            mainRules: this.skipCommonSutras,
            ...(reset ? { view: 'table' } : {}),
        };
        if (subantaHandle) {
            subantaHandle.update(options);
        } else {
            subantaHandle = VidyutWidget.render(container, options);
        }
    },

    // Set the app's active tab.
    setTab(s) {
        // Reset the prakriya so that we don't display a krt pratyaya for tin, etc.
        // The proper fix is to have separate prakriyas for each tab.
        this.clearActivePada();
        // The dhatu and namadhatu tabs share these options, which might not make sense for the
        // other kind of dhatu. So, reset them when moving between those two tabs.
        const kinds = ['dhatu', 'namadhatu'];
        if (kinds.includes(this.activeTab) && kinds.includes(s) && this.activeTab !== s) {
            this.sanadi = null;
            this.upasarga = null;
            this.prayoga = null;
            this.skipAtAgama = false;
        }
        this.activeTab = s;
    },

    // Computed properties

    tab(s) {
        if (s === this.activeTab) {
            return "font-bold p-2 bg-sky-100 rounded text-sky-800";
        } else {
            return "";
        }
    },

    /** A filtered list of dhatus according to a user query. */
    filteredDhatus() {
        if (this.dhatuFilter !== null) {
            let slpQuery = Sanscript.t(this.dhatuFilter, 'devanagari', 'slp1');
            let hkQuery = Sanscript.t(this.dhatuFilter, 'hk', 'slp1');
            return this.dhatus.filter(d =>
                d.code.includes(slpQuery)
                || d.aupadeshikaNoSvaras.includes(slpQuery)
                || d.artha.includes(slpQuery)
                || d.normalDhatu.includes(slpQuery)
                || d.aupadeshikaNoSvaras.includes(hkQuery)
                || d.artha.includes(hkQuery)
                || d.normalDhatu.includes(hkQuery)
            );
        } else {
            return this.dhatus;
        }
    },

    /** A filtered list of namadhatus according to a user query. */
    filteredNamadhatus() {
        if (this.namadhatuFilter !== null) {
            const slpQuery = Sanscript.t(this.namadhatuFilter, 'devanagari', 'slp1');
            const hkQuery = Sanscript.t(this.namadhatuFilter, 'hk', 'slp1');
            return this.namadhatus.filter(d =>
                d.code.includes(slpQuery)
                || d.pratipadikaNoSvaras.includes(slpQuery)
                || d.artha.includes(slpQuery)
                || d.normalDhatu.includes(slpQuery)
                || d.pratipadikaNoSvaras.includes(hkQuery)
                || d.artha.includes(hkQuery)
                || d.normalDhatu.includes(hkQuery)
            );
        } else {
            return this.namadhatus;
        }
    },

    display_dhatu_form(lakara) {
        console.log("lakara =", lakara);
        return (['luN', 'laN'].includes(this.to_slp1(lakara)) && this.skipAtAgama ? this.deva('mA') : "");
    },
    createPrakriya() {
        if (!this.activePada) {
            return null;
        }

        const pada = this.activePada;
        let target_text = pada.text;
        let allPrakriyas = [];
        if (pada.type === "tinanta") {
            if (this.skipAtAgama) {
                // Undo the mA before attempting the prakriya
                target_text = pada.text.replace("mA ", "").replace(" sma ", "").replace("[sma] ","");
                console.log("target_text =", target_text);
                // pada.text = target_text;
            }
            allPrakriyas = this.vidyut.deriveTinantas(pada.args);
        } else if (pada.type === "krdanta") {
            allPrakriyas = this.vidyut.deriveKrdantas(pada.args);
        }

        return allPrakriyas.find((p) => p.text === target_text);
    },

    // Render the given SLP1 text in Devanagari.
    deva(s) {
        return Sanscript.t(fixSvaras(s), 'slp1_accented', this.script);
    },
    // Render a vigraha-vakya in Devanagari. A word with several forms is written
    // `( form1 / form2 )`. The `/` is a svara mark in `slp1_accented`, so it is kept out of the
    // transliteration: each piece between the ` / ` marks is transliterated by itself.
    devaVigraha(s) {
        return s.split(' / ').map(piece => this.deva(piece)).join(' / ');
    },
    deva_bare(s) {
        return Sanscript.t(s, 'slp1_accented', this.script);
    },
    to_slp1(s) {
        return Sanscript.t(removeSlpSvaras(s), this.script, 'slp1');
    },

    // Render the given SLP1 text in Devanagari without svara marks.
    devaNoSvara(s) {
        return Sanscript.t(removeSlpSvaras(s), 'slp1', this.script);
    },

    renderStepRule(rule) {
        let text = '';
        let annotated_text = 'missing';
        switch (rule.source) {
            case "ashtadhyayi":
                text = this.devaNoSvara(this.sutras[rule.code] || "");
                annotated_text = text;
                break;
            case "kaumudi":
                text = this.devaNoSvara(this.kaumudi[rule.code] || "");
                annotated_text = `<span class="text-green-500">${text}</span>`;
                break;
            case "varttika":
                text = this.devaNoSvara(this.varttikas[rule.code] || "");
                annotated_text = `<span class="text-green-500">${text}</span>`;
                break;
            case "dhatupatha":
                text = this.devaNoSvara(this.dhatuGanaSutras[rule.code] || "");
                annotated_text = `<span class="text-orange-500">${text}</span>`;
                break;
            case "linganushasanam":
                text = this.devaNoSvara(this.linganushasanam[rule.code] || "");
                annotated_text = `<span class="text-orange-500">${text}</span>`;
                break;
            case "unadi":
                text = this.devaNoSvara(this.unadipatha[rule.code.split(":")[0]] || "");
                annotated_text = `<span class="text-orange-500">${text}</span>`;
                break;
            case "anyatra":
                text = this.devaNoSvara(rule.code.split(",")[1] || "");
                annotated_text = `<span class="text-orange-500">${text}</span>`;
                break;
        }
        return annotated_text;
    },

    renderStepRuleLinkText(rule) {
        let prefix = "";
        if (rule.code === "    ") { // For debug statements in prakriya
            return "👀 source";
        } else if (rule.source === "varttika") {
            prefix = "vArttika ";
        } else if (rule.source === "kaumudi") {
            prefix = "kOmudI ";
        } else if (rule.source === "unadi") {
            prefix = "uRAdi ";
        } else if (rule.source === "linganushasanam") {
            prefix = "liNgA ";
        } else if (rule.source === "dhatupatha") {
            prefix = "DAtupAWa ";
        } else if (rule.source === "phit") {
            prefix = "Piw ";
        } else if (rule.source === "anyatra") {
            prefix = rule.code.split(",")[0];
        }

        const text = (rule.source === "anyatra") ? prefix : prefix + rule.code;
        return this.devaNoSvara(text).replaceAll('।', '.')
    },

    renderStepRuleLink(step) {
        let rule = step.rule
        if (rule.code === "    ") { // For debug statements in prakriya
            let x = parseStepText(step.result[0].text);
            if (!x) {
                return '/vidyut-prakriya/src'
            } else {
                let text = x.text.split("---")
                return `/${x.filename}#:~:text=${text[0]}`
            }
        }
        let linkurl = "https://ashtadhyayi.com/"
        switch (rule.source) {
            case "ashtadhyayi":
            case "varttika":
                return `${linkurl}sutraani/${rule.code}`;
            case "kaumudi":
                return `${linkurl}sutraani/sk${rule.code}`;
            case "unadi":
                return `${linkurl}unaadi/?scroll=unaadi-${codeToNumber(rule.code)}`;
            case "dhatupatha":
                return `${linkurl}dhatu/${rule.code}`;
            case "linganushasanam":
                return `${linkurl}linganushasanam?scroll=linganushasanam-${rule.code}`;
            case "anyatra":
                return `${rule.code.split(",")[2]}`;
        }
        return linkurl;
    },

    entryString(entries) {
        let str = entries.map(x => x.text).join(', ');
        return this.devaNoSvara(str);
    },

    lakaraClass(title) {
        this.to_slp1(title)
    },

    // True if no term of the step differs from the previous step (in text or in tags). A term that
    // the step elided is not in `step.result`, so `anyChanged` counts it.
    stepHasNoChange(step) {
        return !step.anyChanged;
    },

    // The classes of a step in the Advanced tab. It hides a step that changed no term, as well as
    // the steps that `stepClasses` hides, except the sutras in `ALWAYS_SHOWN_SUTRAS` and the steps
    // of an `anyatra` rule. Debug lines (no rule code) are left to `skipCommonSutras`.
    lispStepClasses(step) {
        const code = step.rule.code.trim();
        const hide = code !== '' && !isAlwaysShownStep(step, ALWAYS_SHOWN_SUTRAS) && this.stepHasNoChange(step);
        return hide ? ['hidden'] : this.stepClasses(step);
    },

    // The rows of a part's table in the Advanced tab: each step, whether a blank row goes before
    // it, the text of that row, and the dhatus (with their arthas) that are shown before it. See
    // `stepRows` in lisp-steps.js. A samasa that was derived on its own (a member of the word)
    // names itself in the row that follows it.
    lispStepRows(part) {
        return stepRows(
            part.history,
            part.dhatus,
            step => this.lispStepClasses(step).includes('hidden'),
            text => this.deva(text),
        );
    },

    stepClasses(step) {
        const code = step.rule.code;
        if (code.trim() === "" && this.skipCommonSutras) {
            // Don't print debug messages
            return ["hidden"];
        }
        let minor = new Set(["1.1.37","1.1.51", "1.3.1", "1.3.2", "1.3.3", "1.3.4", "1.3.5", "1.3.6", "1.3.7", "1.3.8", "1.3.9", "1.2.45", "3.4.114", "1.1.43",
            "1.4.58", "1.4.59", "1.4.60", "1.4.80", "6.1.4", "6.1.5", "8.4.68", "3.4.113", "2.3.48", "1.4.17", "2.3.49", "1.4.7",
        ]);
        let samjna = new Set (["1.2.46", "1.4.14", "3.1.32"]);
        let reversible = new Set(["7.2.67"])
        if (minor.has(code)) {
            if (this.skipCommonSutras) {
                return ["hidden"];
            } else {
                return ["opacity-40"];
            }
        } else if (samjna.has(code)) {
            return ["bg-lime-200"];
        } else if (reversible.has(code)) {
            return ["bg-orange-100"];
        } else {
            return [];
        }
    },

    renderStepResult(step) {
        let res = "";
        step.result.forEach((term, i) => {
            // Skip empty terms since traditional prakriyas expect this to be done.
            if (term.text.length === 0) {
                return;
            }
            if (res.length !== 0) {
                res += ' <span class="text-sm text-gray-400">+</span> ';
            }
            let text = this.devaNoSvara(term.text);
            if (term.wasChanged) {
                text = `<span class="text-red-700">${text}</span>`
            }
            if (step.rule.code.trim() === "") {
                let x= parseStepText(term.text)
                if (!x) {
                    text = `<span class="text-blue-500">${term.text}</span>`
                } else {
                    text = `<span class="text-blue-800">${x.text} ${x.supporting_info}</span>`
                }
            }
            res += text;
        })
        return res;
    },

    /// Create all tinantas allowed by the given `args`.
    createTinantaParadigm({dhatu, lakara, prayoga, pada}) {
        let purushas = Object.values(Purusha).filter(Number.isInteger);
        let vacanas = Object.values(Vacana).filter(Number.isInteger);
        if (+prayoga === Prayoga.Bhave) {
            // BAve takes only praTama puruza and ekavacana.
            purushas = purushas.slice(0, 1);
            vacanas = vacanas.slice(0, 1);
        }
        let skipAtAgama = this.skipAtAgama;
        let paradigm = [];
        let lakaraAtAgama = [Lakara.Lun, Lakara.Lan].includes(+lakara);
        let includeSma = [Lakara.Lan].includes(+lakara);
        for (const purusha in purushas) {
            let row = [];
            for (const vacana in vacanas) {
                const args = {
                    dhatu,
                    lakara,
                    prayoga,
                    purusha,
                    vacana,
                    skipAtAgama,
                    pada,
                };
                let prakriyas = this.vidyut.deriveTinantas(args);

                let cell = [];
                let seen = new Set();
                prakriyas.forEach((p) => {
                    if (seen.has(p.text)) {
                        return;
                    }
                    seen.add(p.text);
                    cell.push({
                        text: lakaraAtAgama && skipAtAgama ? "mA " + (includeSma ? " sma " : "[sma] ")  + p.text : p.text,
                        type: "tinanta",
                        args
                    });
                });

                if (cell.length === 0) {
                    return [];
                }

                row.push(cell);
            }
            paradigm.push(row);
        }

        return paradigm;
    },

    // Get a nice human-readable name for the given lakara.
    getLakaraTitle(value) {
        const mapping = {
            "Lat": "law",
            "Lit": "liw",
            "Lut": "luw",
            "Lrt": "lfw",
            "Let": "lew",
            "Lot": "low",
            "Lan": "laN",
            "VidhiLin": "viDi-liN",
            "AshirLin": "ASIr-liN",
            "Lun": "luN",
            "Lrn": "lfN",
        };
        const text = mapping[Lakara[value]];
        return this.deva(text);
    },

    /// Creates the dhatu argument for vidyut-prakriya from a dhatu or namadhatu entry.
    buildDhatuArgs(entry, prefixes, sanadi) {
        if (entry.kind === "nama") {
            return {
                pratipadika: { basic: entry.pratipadika },
                namaSanadi: entry.namaSanadi === null ? null : Sanadi[entry.namaSanadi],
                prefixes,
                sanadi,
            };
        }
        return {
            aupadeshika: entry.aupadeshika,
            gana: entry.gana,
            antargana: entry.antargana,
            prefixes,
            sanadi,
        };
    },

    /// Creates a grid of krdantas to show for a specific dhatu.
    createKrdantas() {
        const entry = this.currentEntry();
        if (!entry) {
            return [];
        }

        const prefixes = this.upasarga ? splitIfComma(this.upasarga) : [];
        const sanadi = this.sanadi ? splitIfComma(this.sanadi).map(sanadi => Sanadi[sanadi]) : [];
        const dhatu = this.buildDhatuArgs(entry, prefixes, sanadi);

        let ret = [];
        const krts = Object.values(Krt).filter(Number.isInteger);

        krts.forEach((krt) => {
            const args = {
                dhatu,
                krt,
            };

            const prakriyas = this.vidyut.deriveKrdantas(args)
            let padas = [];
            prakriyas.forEach((p) => {
                padas.push({
                    text: p.text,
                    type: "krdanta",
                    args
                });
            });

            // Expansion for Satf/SAnac.
            if (krt == Krt.Satf || krt == Krt.SAnac) {
                let allArgs = [
                    { ...args, prayoga: Prayoga.Karmani, lakara: Lakara.Lat },
                    { ...args, prayoga: Prayoga.Kartari, lakara: Lakara.Lrt },
                    { ...args, prayoga: Prayoga.Karmani, lakara: Lakara.Lrt },
                ];
                allArgs.forEach((args) => {
                    const prakriyas = this.vidyut.deriveKrdantas(args)
                    prakriyas.forEach((p) => {
                        padas.push({
                            text: p.text,
                            type: "krdanta",
                            args
                        });
                    });
                });
            }

            if (padas.length !== 0) {
                ret.push({
                    title: Krt[krt],
                    padas,
                });
            }
        });
        return ret;
    },

    createAllTinantas() {
        const entry = this.currentEntry();
        if (!entry) {
            return [];
        }

        const lakaras = Object.values(Lakara).filter(Number.isInteger);
        const tinPadas = Object.values(DhatuPada).filter(Number.isInteger);
        const prayoga = this.prayoga !== null ? this.prayoga : Prayoga.Kartari;
        const prefixes = this.upasarga ? splitIfComma(this.upasarga) : [];
        console.log(`sanadi = ${this.sanadi}`);
        const sanadi = this.sanadi ? splitIfComma(this.sanadi).map(sanadi => Sanadi[sanadi]) : [];
        const dhatu = this.buildDhatuArgs(entry, prefixes, sanadi);

        let results = [];
        for (const lakara in lakaras) {
            let laResults = {
                title: this.getLakaraTitle(lakara),
            };

            for (const tinPada in tinPadas) {
                const padaKey = DhatuPada[tinPada];
                const paradigm = this.createTinantaParadigm({
                    dhatu,
                    lakara,
                    prayoga,
                    pada: tinPada,
                });

                if (paradigm.length !== 0) {
                    laResults[padaKey] = paradigm;
                }
            }
            results.push(laResults);
        }

        return results;
    },
});

window.Lakara = Lakara;
window.Prayoga = Prayoga;
window.Sanadi = Sanadi;

// Initialize the app.
window.addEventListener('alpine:init', () => {
    Alpine.data("app", App)
});
