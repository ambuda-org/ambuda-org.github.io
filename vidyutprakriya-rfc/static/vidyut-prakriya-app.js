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

import { suggest, applySuggestion, caretPosition, parenSegments } from "./lisp-complete.js";
import { initWasm, Krt, Unadi, Gana, Vidyut, Lakara, Prayoga, Purusha, Vacana, DhatuPada, Sanadi, Linga, Vibhakti, Antargana } from "./vidyut-prakriya.js";

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
    SupActivePratipadika: "supActivePratipadika",
    Tab: "tab",
    DhatuPada: "pada",
    Prayoga: "prayoga",
    Sanadi: "sanadi",
    ActivePada: "activePada",
    Upasarga: "upasarga",
    SkipAtAgama: "skipAtAgama",
    Lisp: "lisp",
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

function codeToNumber(code) {
    const [major, minor] = code.split('.').map(Number);
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
    supActivePratipadika: null,
    supParadigm: null,
    supPrakriya: null,


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
    // A filter to apply to the sup list.
    supFilter: null,
    // Skip AtAgama
    skipAtAgama: false,
    // Skip Comman Sutras
    skipCommonSutras: true,

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

        // TODO: set state earlier. But, our current implemenation needs to
        // wait for the dhatus to load so that we can set activeDhatu.
        this.readUrlState();

        // Save important properties to the URL when they change.
        const watched = ['activeDhatu', 'activeNamadhatu', 'activeTab', 'sanadi', 'prayoga', 'upasarga', 'activePada', 'skipAtAgama', 'supActivePratipadika'];
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
        const supActivePratipadika = params.get(Params.SupActivePratipadika)
        const lisp = params.get(Params.Lisp);

        console.log(`realUrlState, prayoga=${prayoga}, upasarga=${upasarga}, sanadi=${sanadi},  dhatuCode=${dhatuCode}`);
        if (tab) {
            this.setTab(tab);
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
        if (supActivePratipadika) {
            this.supActivePratipadika = JSON.parse(supActivePratipadika);
            this.supParadigm = this.createSubantaParadigm();
        }
        if (activePada) {
            this.setActivePada(JSON.parse(activePada));
        }
        if (lisp) {
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
        setParam(url, Params.Prayoga, this.prayoga);
        setParam(url, Params.Sanadi, this.sanadi);
        setParam(url, Params.Upasarga, this.upasarga);
        setParam(url, Params.SkipAtAgama, this.skipAtAgama);
        setParam(url, Params.Lisp, this.activeTab === 'advanced' ? this.lispInput.trim() : null);
        if (this.supActivePratipadika) {
            setParam(url, Params.SupActivePratipadika, JSON.stringify(this.supActivePratipadika));
        } else {
            setParam(url, Params.SupActivePratipadika, null);
        }
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
        const accents = digits.replace(/\u0952/g, '\\').replace(/\u0951/g, '^');
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

    // Returns the label or detail of a suggestion for display: in Devanagari if that script is
    // chosen, otherwise in SLP1. Keywords such as `:dhatu` and `tiN` are always as typed. What a
    // suggestion inserts is SLP1 in every case.
    lispShow(text, item) {
        if (!text || this.script !== 'devanagari' || item.kind === 'head') {
            return text;
        }
        return this.deva(text);
    },

    // The text of the expression editor in pieces, so that a matching pair of parentheses can be
    // highlighted behind the text area.
    lispSegments() {
        return parenSegments(this.lispInput, this.lispCaret).map((seg, i) => ({ ...seg, key: i }));
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

    // Inserts the `index`-th suggestion. The text area keeps the focus.
    lispAccept(textarea, index) {
        const item = this.lispSuggest.items[index];
        const result = this.lispSuggest.result;
        if (!item || !result) {
            return;
        }
        const out = applySuggestion(textarea.value, result, item);
        this.lispInput = out.text;
        textarea.value = out.text;
        textarea.setSelectionRange(out.cursor, out.cursor);
        textarea.focus();
        this.lispCloseSuggest();
        // Offer the next slot right away.
        this.lispUpdateSuggest(textarea);
    },

    // Evaluates the expression in the text area and shows the result below it.
    evaluateLisp() {
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
        window.scrollTo({ top: 0 });
    },

    // Goes back from a form's prakriya to the table.
    lispCloseForm() {
        this.lispActiveForm = null;
    },

    // Returns `d` and the derivations of its bases, innermost first. Each has a `caption`.
    lispChain(d) {
        const chain = [];
        for (let cur = d.base; cur; cur = cur.base) {
            chain.unshift(cur);
        }
        return chain.map(x => ({ caption: 'Base: ' + this.deva(x.text), text: x.text, history: x.history }))
            .concat([{ caption: this.deva(d.text), text: d.text, history: d.history }]);
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
        if (p.type === "subanta") {
            this.supPrakriya = this.createPrakriya();
        } else {
            this.dhatuPrakriya = this.createPrakriya();
            window.scrollTo({ top: 0 });
        }
    },

    // Create the active pada (and show all forms for the dhatu)
    clearActivePada() {
        this.activePada = null;
        this.dhatuPrakriya = null;
        this.supPrakriya = null;
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

    filteredSupPratipadikas() {
        if (this.supFilter !== null) {
            const slpQuery = Sanscript.t(this.supFilter, 'devanagari', 'slp1');
            const hkQuery = Sanscript.t(this.supFilter, 'hk', 'slp1');
            return this.supPratipadikas().filter(s =>
                s.text.includes(slpQuery) || s.text.includes(hkQuery)
            );
        } else {
            return this.supPratipadikas();
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
        } else if (pada.type === "subanta") {
            allPrakriyas = this.vidyut.deriveSubantas(pada.args);
        }

        return allPrakriyas.find((p) => p.text === target_text);
    },

    // Render the given SLP1 text in Devanagari.
    deva(s) {
        return Sanscript.t(fixSvaras(s), 'slp1_accented', this.script);
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
                text = this.devaNoSvara(this.unadipatha[rule.code] || "");
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

    getLingaTitle(value) {
        const mapping = {
            [Linga.Pum]: "puMliNgaH",
            [Linga.Stri]: "strIliNgaH",
            [Linga.Napumsaka]: "napuMsakaliNgaH",
        };
        const text = mapping[value];
        return this.deva(text || "missing");
    },

    supPratipadikas() {
        return [
            { text: "a", linga: Linga.Pum },
            { text: "deva", linga: Linga.Pum },
            { text: "rAma", linga: Linga.Pum },
            { text: "sarva", linga: Linga.Pum },
            { text: "viSva", linga: Linga.Pum },
            { text: "i", linga: Linga.Pum },
            { text: "hari", linga: Linga.Pum },
            { text: "kavi", linga: Linga.Pum },
            { text: "hari", linga: Linga.Pum },
            { text: "saKi", linga: Linga.Pum },
            { text: "pati", linga: Linga.Pum },
            { text: "u", linga: Linga.Pum },
            { text: "SamBu", linga: Linga.Pum },
            { text: "guru", linga: Linga.Pum },
            { text: "krozwu", linga: Linga.Pum },
            { text: "hUhU", linga: Linga.Pum },
            { text: "pitf", linga: Linga.Pum },
            { text: "jAmAtf", linga: Linga.Pum },
            { text: "BrAtf", linga: Linga.Pum },
            { text: "go", linga: Linga.Pum },
            { text: "rE", linga: Linga.Pum },
            { text: "glO", linga: Linga.Pum },
            { text: "janO", linga: Linga.Pum },
            { text: "rAjan", linga: Linga.Pum },
            { text: "yajvan", linga: Linga.Pum },
            { text: "aryaman", linga: Linga.Pum },
            { text: "brahman", linga: Linga.Pum },
            { text: "SarNgin", linga: Linga.Pum },
            { text: "Atman", linga: Linga.Pum },
            { text: "guRin", linga: Linga.Pum },
            { text: "Svan", linga: Linga.Pum },
            { text: "paTin", linga: Linga.Pum },
            { text: "yaSasvin", linga: Linga.Pum },
            { text: "pUzan", linga: Linga.Pum },
            { text: "yuvan", linga: Linga.Pum },
            { text: "maTin", linga: Linga.Pum },
            { text: "arvan", linga: Linga.Pum },
            { text: "fBukzin", linga: Linga.Pum },
            { text: "ftvij", linga: Linga.Pum },
            { text: "tyad", linga: Linga.Pum },
            { text: "tad", linga: Linga.Pum },
            { text: "yad", linga: Linga.Pum },
            { text: "etad", linga: Linga.Pum },
            { text: "yuzmad", linga: Linga.Pum },
            { text: "asmad", linga: Linga.Pum },
            { text: "kim", linga: Linga.Pum },
            { text: "idam", linga: Linga.Pum },
            { text: "adas", linga: Linga.Pum },
            { text: "eka", linga: Linga.Pum, vacana: Vacana.Eka },
            { text: "dvi", linga: Linga.Pum, vacana: Vacana.Dvi },
            { text: "tri", linga: Linga.Pum, vacana: Vacana.Bahu },
            { text: "zaz", linga: Linga.Pum, vacana: Vacana.Bahu },
            {
                text: "senAnI (kvip)",
                linga: Linga.Pum,
                krdanta: {
                    dhatu: Object.assign({},this.dhatus.find( d => d.code === "01.1049"), {prefixes: ["senA"]}),
                    krt: Krt.kvip
                }
            },
            {
                text: "vAtapramI (uRAdi)",
                linga: Linga.Pum,
                krdanta: {
                    dhatu: Object.assign({},this.dhatus.find( d => d.code === "03.0007"), {prefixes : ["pra"]} ),
                    unadi: Unadi.I,
                    upapada: {
                        stem: "vAta",
                    },
                }
            },
            {
                text: "vftraGna (kvip)",
                linga: Linga.Pum,
                krdanta: {
                    dhatu: this.dhatus.find( d => d.code === "02.0002"),
                    krt: Krt.kvip,
                    upapada: {
                        stem: "vftra",
                    },
                }
            },
            {
                text: "brahmapUzan (uRAdi)",
                linga: Linga.Pum,
                krdanta: {
                    dhatu: this.dhatus.find( d => d.code === "01.0769"),
                    unadi: Unadi.kanin,
                    upapada: {
                        stem: "brahma",
                    }
                }
            },
            {
                text: "aryaman (uRAdi)",
                linga: Linga.Pum,
                krdanta: {
                    dhatu: this.dhatus.find( d => d.code === "03.0007"),
                    unadi: Unadi.kanin,
                    upapada: {
                        stem: "arya",
                    }
                }
            },
            {
                text: "vidvas, vidat (Satf)",
                linga: Linga.Pum,
                krdanta: {
                    dhatu: this.dhatus.find( d => d.code === "02.0059"),
                    krt: Krt.Satf
                }
            },
            {
                text: "praSAn (kvip)",
                linga: Linga.Pum,
                krdanta: {
                    dhatu: Object.assign({},this.dhatus.find( d => d.code === "04.0098"), {prefixes : ["pra"]} ),
                    krt: Krt.kvip
                }
            },
            {
                text: "sedivas (kvasu)",
                linga: Linga.Pum,
                krdanta: {
                    dhatu: this.dhatus.find( d => d.code === "01.0990"),
                    krt: Krt.kvasu
                }
            },
            {
                text: "antaryAmin (Rini)",
                linga: Linga.Pum,
                krdanta: {
                    dhatu: Object.assign({},this.dhatus.find( d => d.code === "01.1031"), {prefixes: ["antar"]}),
                    krt: Krt.Rini
                }
            },
            { text: "u", linga: Linga.Stri },
            { text: "tad", linga: Linga.Stri },
            { text: "yad", linga: Linga.Stri },
            { text: "etad", linga: Linga.Stri },
            { text: "kim", linga: Linga.Stri },
            { text: "idam", linga: Linga.Stri },
            { text: "adas", linga: Linga.Stri },
            { text: "eka", linga: Linga.Stri, vacana: Vacana.Eka },
            { text: "dvi", linga: Linga.Stri, vacana: Vacana.Dvi },
            { text: "tri", linga: Linga.Stri, vacana: Vacana.Bahu },
            { text: "DI", linga: Linga.Stri },
            {
                text: "kAmaDuh (kvip)",
                linga: Linga.Stri,
                krdanta: {
                    dhatu: Object.assign({},this.dhatus.find( d => d.code === "02.0004"), {prefixes: ["kAma"]}),
                    krt: Krt.kvip
                }
            },
            {
                text: "prAvfz (kvip)",
                linga: Linga.Stri,
                krdanta: {
                    dhatu: Object.assign({},this.dhatus.find( d => d.code === "01.0803"), {prefixes: ["pra", "AN"]}),
                    krt: Krt.kvip
                }
            },
            {
                text: "suDI (kvip)",
                linga: Linga.Stri,
                krdanta: {
                    dhatu: Object.assign({},this.dhatus.find( d => d.code === "01.1056"), {prefixes: ["su"]}),
                    krt: Krt.kvip
                }
            },
            {
                text: "tasTuzI (kvasu)",
                linga: Linga.Stri,
                krdanta: {
                    dhatu: this.dhatus.find( d => d.code === "01.1077"),
                    krt: Krt.kvasu
                }
            },
            {
                text: "pipAsA (a)",
                linga: Linga.Stri,
                krdanta: {
                    dhatu: Object.assign({},this.dhatus.find( d => d.code === "01.1074"), {sanadi: [Sanadi.san]}),
                    krt: Krt.a
                }
            },
            {
                text: "kurvatI (Satf)",
                linga: Linga.Stri,
                krdanta: {
                    dhatu: this.dhatus.find( d => d.code === "08.0010"),
                    krt: Krt.Satf
                }
            },
            { text: "lakzmI", linga: Linga.Stri },
            { text: "svasf", linga: Linga.Stri },
            { text: "mAtf", linga: Linga.Stri },
            { text: "duhitf", linga: Linga.Stri },
            { text: "go", linga: Linga.Stri },
            { text: "dyo", linga: Linga.Stri },
            { text: "rE", linga: Linga.Stri },
            { text: "nO", linga: Linga.Stri },
            {
                text: "ap (uRAdi)",
                linga: Linga.Stri,
                krdanta: {
                    dhatu: this.dhatus.find( d => d.code === "05.0016"),
                    unadi: Unadi.kvip,
                },
                vacana: Vacana.Bahu
            },
            {
                text: "akzara (uRAdi)",
                linga: Linga.Napumsaka,
                krdanta: {
                    dhatu: this.dhatus.find( d => d.code === "05.0020"),
                    unadi: Unadi.sara,
                },
            },
            {
                text: "Danuz (uRAdi)",
                linga: Linga.Napumsaka,
                krdanta: {
                    dhatu: this.dhatus.find( d => d.code === "03.0024"),
                    unadi: Unadi.usi,
                },
            },
            { text: "Pala", linga: Linga.Napumsaka },
            { text: "puzpa", linga: Linga.Napumsaka },
            { text: "sarva", linga: Linga.Napumsaka },
            { text: "viSva", linga: Linga.Napumsaka },
            { text: "eka", linga: Linga.Napumsaka, vacana: Vacana.Eka },
            { text: "dvi", linga: Linga.Napumsaka, vacana: Vacana.Dvi },
            { text: "tri", linga: Linga.Napumsaka, vacana: Vacana.Bahu },
            { text: "pUrva", linga: Linga.Napumsaka },
            { text: "para", linga: Linga.Napumsaka },
            { text: "avara", linga: Linga.Napumsaka },
            { text: "dakziRa", linga: Linga.Napumsaka },
            { text: "uttara", linga: Linga.Napumsaka },
            { text: "apara", linga: Linga.Napumsaka },
            { text: "aDara", linga: Linga.Napumsaka },
            { text: "hfdaya", linga: Linga.Napumsaka },
            { text: "asTi", linga: Linga.Napumsaka },
            { text: "sakTi", linga: Linga.Napumsaka },
            { text: "akzi", linga: Linga.Napumsaka },
            { text: "maDu", linga: Linga.Napumsaka },
            { text: "ambu", linga: Linga.Napumsaka },
            { text: "vasu", linga: Linga.Napumsaka },
            { text: "aSru", linga: Linga.Napumsaka },
            { text: "laGu", linga: Linga.Napumsaka },
            { text: "bahu", linga: Linga.Napumsaka },
            { text: "vastu", linga: Linga.Napumsaka },
            { text: "pIlu", linga: Linga.Napumsaka },
            { text: "sAnu", linga: Linga.Napumsaka },
            { text: "yakft", linga: Linga.Napumsaka },
            { text: "tad", linga: Linga.Napumsaka },
            { text: "yad", linga: Linga.Napumsaka },
            { text: "etad", linga: Linga.Napumsaka },
            { text: "kim", linga: Linga.Napumsaka },
            { text: "idam", linga: Linga.Napumsaka },
            { text: "adas", linga: Linga.Napumsaka },
            { text: "guRin", linga: Linga.Napumsaka },
            {
                text: "praSAn (kvip)",
                linga: Linga.Napumsaka,
                krdanta: {
                    dhatu: Object.assign({},this.dhatus.find( d => d.code === "04.0098"), {prefixes : ["pra"]} ),
                    krt: Krt.kvip
                }
            },
            {
                text: "kzIrapa (ka)",
                linga: Linga.Napumsaka,
                krdanta: {
                    dhatu: this.dhatus.find( d => d.code === "01.1074"),
                    krt: Krt.ka,
                    upapada: {
                        stem: "kzIra",
                    }
                }
            },
            {
                text: "mAzavAp (aR)",
                linga: Linga.Napumsaka,
                krdanta: {
                    dhatu: this.dhatus.find( d => d.code === "01.1158"),
                    krt: Krt.aR,
                    upapada: {
                        stem: "mAza",
                    }
                }
            },
        ];
    },

    setPratipadika(pratipadika) {
        this.supActivePratipadika = pratipadika;
        this.supParadigm = this.createSubantaParadigm();
    },

    clearSupPratipadika() {
        this.supParadigm = null;
        this.supActivePratipadika = null;
        this.supPrakriya = null;
    },

    createSubantaParadigm() {
        const vibhaktis = Object.values(Vibhakti).filter(Number.isInteger);
        const vacanas = Object.values(Vacana).filter(Number.isInteger);

        const vibhaktiTitles = {
            [Vibhakti.Prathama]: "praTamA",
            [Vibhakti.Dvitiya]: "dvitIyA",
            [Vibhakti.Trtiya]: "tftIyA",
            [Vibhakti.Caturthi]: "caturTI",
            [Vibhakti.Panchami]: "paYcamI",
            [Vibhakti.Sasthi]: "zazWI",
            [Vibhakti.Saptami]: "saptamI",
            [Vibhakti.Sambodhana]: "samboDanam",
        };

        let paradigm = [];
        vibhaktis.forEach((vibhakti) => {
            let row = [];
            vacanas.forEach((vacana) => {
                let pratipadika = {
                    basic: this.supActivePratipadika.text,
                }
                if (this.supActivePratipadika.krdanta) {
                    pratipadika = { krdanta: this.supActivePratipadika.krdanta }
                }
                const args = {
                    pratipadika: pratipadika,
                    linga: this.supActivePratipadika.linga,
                    vibhakti: vibhakti,
                    vacana: vacana,
                };

                const prakriyas = this.vidyut.deriveSubantas(args);

                let vvPadas = [];
                prakriyas.forEach((p) => {
                    let text = p.text;
                    let displayText = text;
                    // Use `==` for int/string cast.
                    if (vibhakti == Vibhakti.Sambodhana) {
                        displayText = "he " + text;
                    }
                    if ( this.supActivePratipadika.vacana !== undefined && this.supActivePratipadika.vacana !== vacana) {
                        displayText = ""; // No display if filtered by vacana. E.g. "eka"
                    }
                    vvPadas.push({
                        displayText,
                        text,
                        type: "subanta",
                        args,
                    })
                })
                row.push(vvPadas);
            });

            paradigm.push({
                title: vibhaktiTitles[vibhakti],
                cells: row,
            });
        });

        return paradigm;
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
