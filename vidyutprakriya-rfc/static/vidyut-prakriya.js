// An ergonomic wrapper over web-assembly calls to wasm/vidyut_prakriya.js.
//
// Installation
// ------------
//
// If you want to use this file from `static`, then use the following directory structure:
//
// - static/vidyut-prakriya.js (this file -- high-level API)
// - static/wasm/vidyut_prakriya.js (low-level bindings to wasm file)
// - static/wasm/vidyut_prakriya_bg.wasm (wasm file)
//
// Usage
// -----
//
// ```
// import { initWasm, Vidyut } from "/static/vidyut-prakriya.js";
// await initWasm();
// const vidyut = new Vidyut();
// ```
//
// Examples
// --------
//
// For various examples, see the tests in www/unit-tests.html
// 
// Notes for maintainers
// ---------------------
// 
// wasm enums (Purusha, Vacana, ...) map ints to strings and strings to ints:
// 
// - Vacana.Eka is an int.
// - Vacana[Vacana.Eka] is a string.
//
// Rust generally expects strings, but enums are good for ergonomics and documentation.
// So, do some goofy enum juggling so that clients have a clean API and Rust gets what it needs.
import init, { BaseKrt, Unadi, Vidyut as VidyutWasm, Lakara, Prayoga, Purusha, Vacana, DhatuPada, Sanadi,
    Linga, Vibhakti, Gana, Antargana } from "./wasm/vidyut_prakriya.js";

export {
    init as initWasm,
    Lakara,
    Prayoga,
    Purusha,
    Vacana,
    DhatuPada,
    Sanadi,
    Linga,
    Vibhakti,
    Gana,
    Antargana,
    BaseKrt as Krt,
    Unadi,
    createWasmKrdanta
};


function isMissing(x) {
    return x === null || x === undefined;
}

function createWasmDhatu({aupadeshika, pratipadika, namaSanadi, gana, antargana, sanadi, prefixes}) {
    return {
        aupadeshika,
        pratipadika,
        // For nama-dhatus: the sanadi that follows the pratipadika directly. If missing, the rules
        // in 3.1 choose it.
        nama_sanadi: isMissing(namaSanadi) ? null : Sanadi[namaSanadi],
        gana: Gana[gana],
        antargana: isMissing(antargana) ? null : Antargana[antargana],
        sanadi: (sanadi || []).map(x => Sanadi[x]),
        prefixes: prefixes || [],
    };
}

function createWasmKrdanta({ dhatu, krt, lakara = null, prayoga = null , unadi = null, upapada = null }) {
    // console.log(`Calling WasmKrdanta ${ isMissing(upapada) ? "null": upapada["linga"]}`);
    let upapada_tmp = {}
    if (upapada !== null) {
        if (isMissing(upapada["stem"])) {
            upapada_tmp = null
        } else {
            upapada_tmp["stem"] = upapada["stem"];
            upapada_tmp["vacana"] = isMissing(upapada["vacana"]) ? Vacana[Vacana.Eka] : Vacana[upapada["vacana"]];
            upapada_tmp["linga"] = isMissing(upapada["linga"]) ? Linga[Linga.Pum] : Linga[upapada["linga"]];
            upapada_tmp["vibhakti"] = isMissing(upapada["vibhakti"]) ? Vibhakti[Vibhakti.Prathama] : Vibhakti[upapada["vibhakti"]];
        }
    }
    return {
        dhatu: createWasmDhatu(dhatu),
        krt: BaseKrt[krt],
        unadi: Unadi[unadi],
        lakara: isMissing(lakara) ? null : Lakara[lakara],
        prayoga: isMissing(prayoga) ? null : Prayoga[prayoga],
        upapada:  upapada_tmp
    }
}

function createWasmPratipadika({ basic, krdanta }) {
    if (basic) {
        return { basic };
    } else {
        return { krdanta: createWasmKrdanta(krdanta) };
    }
}

// Ergonomic wrapper over vidyut-prakriya wasm build.
//
// This class is used in three ways:
// - as the interface for our wasm unit tests (see unit-tests.html)
// - as the interface for our debugger (see `make debugger`)
// - as sample code for developers who want to use vidyut-prakriya in their projects.
//
// In the methods below, `dhatu` and `pratipadika` are complex objects. Here are some examples
// of each.
//
// Dhatus require `aupadeshika` and `gana` and may optionally take `sanadi`, `prefixes`, or
// `antargana`:
// 
// - { aupadeshika: "BU", gana: Gana.Bhvadi }
// - { aupadeshika: "BU", gana: Gana.Bhvadi, sanadi: [Sanadi.san] }
// - { aupadeshika: "BU", gana: Gana.Bhvadi, prefixes: ["pari"], sanadi: [Sanadi.san] }
// - { aupadeshika: "Gawa~", gana: Gana.Bhvadi, antargana: Antargana.Ghatadi }
//
// Nama-dhatus use `pratipadika` instead of `aupadeshika` and `gana`, and may optionally take
// `namaSanadi` (one of Sanadi.kyac, kyaN, kAmyac, Ric). If `namaSanadi` is missing, the rules in
// 3.1 choose the sanadi. `sanadi` and `prefixes` work as above, and `sanadi` applies after
// `namaSanadi`:
//
// - { pratipadika: { basic: "putra" }, namaSanadi: Sanadi.kyac }
// - { pratipadika: { basic: "lohita" } }
// - { pratipadika: { basic: "putra" }, namaSanadi: Sanadi.kyac, prefixes: ["pra"] }
//
// Pratipadikas have one key that is either `basic` or `krdanta`. `basic` defines a simple
// pratipadika, and `krdanta` defines a krdanta as an object with two keys `dhatu` and `krt`:
// - { basic: "deva" }
// - { krdanta: { dhatu: { aupadeshika: "BU", gana: Gana.Bhvadi }, krt: Krt.lyuw } }
//
// For more examples, see unit-tests.html in the Vidyut repository.
export class Vidyut {
    // Call `init()` before using Vidyut so that you correctly initialize the WASM environment.
    //
    // Example:
    //
    // ```
    // // NOTE: `init()` is async!
    // await init();
    // const vidyut = new Vidyut();
    // ```
    constructor() {
        this.wasm = VidyutWasm.init();
        this.logger = new CircularBufferLogger('info', 200);
    }

    /**
     * Derives all dhatus that match the input conditions.
     *
     * dhatu: an object that defines a dhatu. For details, see the comments on `class Vidyut`.
     * linga: a `Linga`
     * vibhakti: a `Vibhakti`
     * vacana: a `Vacana`
     */
    deriveDhatus({ aupadeshika, pratipadika, namaSanadi, gana, antargana, sanadi, prefixes }) {
        // For argument order, see wasm.rs.
        return this.wasm.deriveDhatus(createWasmDhatu({
            aupadeshika,
            pratipadika,
            namaSanadi,
            gana,
            antargana,
            sanadi,
            prefixes
        }));
    }

    /**
     * Derives all krdantas that match the input conditions.
     *
     * dhatu: an object that defines a dhatu. For details, see the comments on `class Vidyut`.
     * krt: a `Krt`.
     *
     * lakara?: (for Satf and SAnac only) the lakAra to use.
     * prayoga?: (for Satf and SAnac only) the prayoga to use.
     */
    deriveKrdantas({ dhatu, krt, lakara = null, prayoga = null, unadi = null, upapada = null }) {
        return this.wasm.deriveKrdantas(createWasmKrdanta({
            dhatu,
            krt,
            lakara,
            prayoga,
            unadi,
            upapada
        }));
    }

    /**
     * Derives all subantas that match the input conditions.
     *
     * pratipadika: an object that defines a pratipadika.
     *              For details, see the comments on `class Vidyut`.
     * linga: a `Linga`
     * vibhakti: a `Vibhakti`
     * vacana: a `Vacana`
     */
    deriveSubantas({ pratipadika, linga, vibhakti, vacana }) {
        // For argument order, see wasm.rs.
        return this.wasm.deriveSubantas({
            pratipadika: createWasmPratipadika(pratipadika),
            linga: Linga[linga],
            vibhakti: Vibhakti[vibhakti],
            vacana: Vacana[vacana],
        });
    }

    /**
     * Loads the text of `dhatupatha.tsv`. `evaluateLisp` uses it to resolve a dhatu whose svara
     * markers were left out (for example, `jYA` for `jYA\\`). Returns true if the text is valid.
     */
    loadDhatupatha(tsv) {
        return this.wasm.loadDhatupatha(tsv);
    }

    /**
     * Returns the values that `evaluateLisp` accepts in its enum-valued slots, for an editor that
     * suggests them. All labels are SLP1 (the lakaras and prayogas are variant names).
     *
     * Returns `{ krts, taddhitas, lakaras, prayogas, purushas, vacanas, vibhaktis, lingas, ganas,
     * antaganas, sanadis, namaSanadis, samasaTypes, krtArthas, taddhitaArthas }`, each a list of
     * strings.
     */
    lispCompletions() {
        return this.wasm.lispCompletions();
    }

    /**
     * Evaluates a Lisp-style expression such as
     * `(sup (:pratipadika rAma) puM tftIyA eka)`. All text is SLP1. For the grammar, see
     * examples/lisp_expression.md.
     *
     * Returns `{ error, warnings, blocks }`.
     *
     * - `error` is a string if the expression could not be evaluated, and otherwise null.
     * - `blocks[i]` is `{ title, sections }`.
     * - `sections[j]` is `{ heading, kind, table, derivations }`. If `kind` is `"table"`, then
     *   `table` is `{ rowLabels, colLabels, cells }`, and `cells[row][col]` is a list of forms.
     *   If `kind` is `"derivations"`, then `derivations` is a list of
     *   `{ text, history, base }`, where `history` has the same format as the other `derive*`
     *   methods and `base` (if set) is the derivation of the stem that this one is built on.
     */
    evaluateLisp(input) {
        return this.wasm.evaluateLisp(input);
    }

    /**
     * Derives all tinantas that match the input conditions.
     *
     * dhatu: an object that defines a dhatu. For details, see the comments on `class Vidyut`.
     * lakara: a `Lakara`
     * purusha: a `Purusha`
     * vacana: a `Vacana`
     * pada: a `DhatuPada`
     * skipAtAgama: whether to skip AtAgama or not (for "mAN")
     * sanadi: a list of strings. Valid values are "san", "Ric", "yaN", and "yaNluk".
     * upasargas: a list of strings. For the upasarga "A", pass "AN".
     */
    deriveTinantas({ dhatu, lakara, prayoga, purusha, vacana, pada = null, skipAtAgama = false }) {
        return this.wasm.deriveTinantas({
            dhatu: createWasmDhatu(dhatu),
            lakara: Lakara[lakara],
            prayoga: Prayoga[prayoga],
            purusha: Purusha[purusha],
            vacana: Vacana[vacana],
            skip_at_agama: skipAtAgama,
            pada: isMissing(pada) ? null : DhatuPada[pada],
        });
    }

    logPrakriya(results) {
        const logger = this.logger;
        for (const x of results) {
            logger.info(x.text);
            for (const y of x.history) {
                if (y.rule.code === "    ") {
                    logger.debug(y.result[0].text);
                } else {
                    const res = y.result.map(item => item.wasChanged ? `${item.text}*` : item.text).join(' + ');
                    logger.info(`${res.padEnd(35,' ')} ${y.rule.code} `);
                }
            }
        }
        return logger.getLogsAsText();
    }
}

export class CircularBufferLogger {
    static LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

    constructor(minLevel = 'info', maxSize = 200) {
        this.maxSize = maxSize;
        this.buffer = new Array(maxSize); // Pre-allocate memory
        this.pointer = 0;                 // Tracks current insertion index
        this.isFull = false;              // Tracks if we have wrapped around
        this.setMinLevel(minLevel);
    }

    setMinLevel(level) {
        this.minLevelWeight = CircularBufferLogger.LEVELS[level] ?? 1;
    }

    log(level, message) {
        const weight = CircularBufferLogger.LEVELS[level] ?? 1;
        if (weight < this.minLevelWeight) return;

        // Pad  column limit
        const paddedMessage = String(message).padEnd(60, ' ');

        const entry = {
            timestamp: new Date().toISOString(),
            level: level.toUpperCase().padEnd(5),
            message: paddedMessage
        };

        // Insert at current pointer slot
        this.buffer[this.pointer] = entry;

        // Advance pointer circularly
        this.pointer++;
        if (this.pointer >= this.maxSize) {
            this.pointer = 0;
            this.isFull = true; // Buffer has wrapped around at least once
        }
    }

    // Helper to read logs chronologically (oldest to newest)
    getLogs() {
        if (!this.isFull) {
            // Buffer hasn't wrapped yet, return everything up to the pointer
            return this.buffer.slice(0, this.pointer);
        }
        // Buffer has wrapped, stitch oldest part (pointer to end) to newest part (start to pointer)
        return [
            ...this.buffer.slice(this.pointer),
            ...this.buffer.slice(0, this.pointer)
        ];
    }

    getLogsAsText() {
        // 1. Generate the formatted text from the current buffer data
        const outputText = this.getLogs()
            .map(e => `[${e.timestamp}] [${e.level}] |${e.message}|`)
            .join('\n');

        // 2. Clear out the buffer data to reset memory
        this.clear();

        // 3. Return the generated text string
        return outputText;
    }

    // Convenience methods
    debug(msg) { this.log('debug', msg); }
    info(msg)  { this.log('info', msg); }
    warn(msg)  { this.log('warn', msg); }
    error(msg) { this.log('error', msg); }

    clear() {
        this.buffer = new Array(this.maxSize);
        this.pointer = 0;
        this.isFull = false;
    }
}
