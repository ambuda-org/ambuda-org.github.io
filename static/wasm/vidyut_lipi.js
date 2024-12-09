let wasm;

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function getObject(idx) { return heap[idx]; }

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}
/**
 * Wrapper for `transliterate`.
 * @param {string} input
 * @param {Scheme} from
 * @param {Scheme} to
 * @returns {any}
 */
export function transliterate(input, from, to) {
    const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.transliterate(ptr0, len0, from, to);
    return takeObject(ret);
}

/**
 * Wrapper for `detect`.
 *
 * `wasm_bindgen` struggles when returning optional types, so our default option here is just
 * Harvard-Kyoto.
 * @param {string} input
 * @returns {Scheme}
 */
export function detect(input) {
    const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.detect(ptr0, len0);
    return ret;
}

/**
 * A method of encoding text.
 *
 * Schemes vary on various dimensions, including:
 *
 * - writing system (alphabet vs. abugida)
 * - text encoding (ASCII vs. Unicode)
 * - support for Sanskrit (complete vs. partial)
 * @enum {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49}
 */
export const Scheme = Object.freeze({
    /**
     * Assamese script.
     *
     * The Assamese script uses the same characters as the Bengali script, with a few minor
     * differences.
     *
     * Docs: <https://unicode.org/charts/PDF/U0980.pdf>
     */
    Assamese: 0, "0": "Assamese",
    /**
     * Balinese script.
     *
     * Docs: <https://unicode.org/charts/PDF/U1B00.pdf>
     */
    Balinese: 1, "1": "Balinese",
    /**
     * Bengali script.
     *
     * Docs: <https://unicode.org/charts/PDF/U0980.pdf>
     */
    Bengali: 2, "2": "Bengali",
    /**
     * Bhaiksuki script.
     *
     * Docs: <https://www.unicode.org/charts/PDF/U11C00.pdf>
     */
    Bhaiksuki: 3, "3": "Bhaiksuki",
    /**
     * Brahmi script.
     *
     * Docs: <https://unicode.org/charts/PDF/U11000.pdf>
     */
    Brahmi: 4, "4": "Brahmi",
    /**
     * Burmese script.
     *
     * Docs: <https://unicode.org/charts/PDF/U1000.pdf>
     */
    Burmese: 5, "5": "Burmese",
    /**
     * Cham script.
     *
     * <https://unicode.org/charts/PDF/UAA00.pdf>
     */
    Cham: 6, "6": "Cham",
    /**
     * Devanagari script.
     *
     * Docs:
     * - <https://unicode.org/charts/PDF/U0900.pdf>
     * - <https://unicode.org/charts/PDF/UA8E0.pdf> (Devanagari Extended)
     * - <https://unicode.org/charts/PDF/U11B00.pdf> (Devanagari Extended-A)
     * - <https://unicode.org/charts/PDF/U1CD0.pdf> (Vedic Extensions)
     */
    Devanagari: 7, "7": "Devanagari",
    /**
     * Dogra script.
     *
     * Docs: <https://unicode.org/charts/PDF/U11800.pdf>
     */
    Dogra: 8, "8": "Dogra",
    /**
     * Grantha script.
     *
     * Docs:
     * - <http://www.unicode.org/charts/PDF/U11300.pdf>
     * - <https://unicode.org/L2/L2009/09372-grantha.pdf>
     */
    Grantha: 9, "9": "Grantha",
    /**
     * Gujarati script.
     *
     * Docs: <https://unicode.org/charts/PDF/U0A80.pdf>
     */
    Gujarati: 10, "10": "Gujarati",
    /**
     * Gunjala Gondi script.
     *
     * Docs: <https://www.unicode.org/charts/PDF/U11D60.pdf>
     */
    GunjalaGondi: 11, "11": "GunjalaGondi",
    /**
     * Gurmukhi script.
     *
     * Docs: <https://unicode.org/charts/PDF/U0A00.pdf>
     */
    Gurmukhi: 12, "12": "Gurmukhi",
    /**
     * Javanese script.
     *
     * Docs: <https://unicode.org/charts/PDF/UA980.pdf>
     */
    Javanese: 13, "13": "Javanese",
    /**
     * Kaithi script.
     *
     * Docs: <https://unicode.org/charts/PDF/U11080.pdf>
     */
    Kaithi: 14, "14": "Kaithi",
    /**
     * Kannada script.
     *
     * Docs: <https://unicode.org/charts/PDF/U0C80.pdf>
     */
    Kannada: 15, "15": "Kannada",
    /**
     * Kharoshthi script.
     *
     * Docs: <https://unicode.org/charts/PDF/U10A00.pdf>
     */
    Kharoshthi: 16, "16": "Kharoshthi",
    /**
     * Khmer script.
     *
     * Docs: <https://unicode.org/charts/PDF/U1780.pdf>
     */
    Khmer: 17, "17": "Khmer",
    /**
     * Khudawadi script.
     *
     * Docs: <https://www.unicode.org/charts/PDF/U112B0.pdf>
     */
    Khudawadi: 18, "18": "Khudawadi",
    /**
     * Lepcha script.
     *
     * Docs: <https://unicode.org/charts/PDF/U1C00.pdf>
     * Limbu script.
     *
     * Docs: <https://www.unicode.org/charts/PDF/U1900.pdf>
     */
    Limbu: 19, "19": "Limbu",
    /**
     * Mahajani script.
     *
     * Docs: <https://www.unicode.org/charts/PDF/U11150.pdf>
     * Mahajani,
     * Malayalam script.
     *
     * Docs: <https://unicode.org/charts/PDF/U0D00.pdf>
     */
    Malayalam: 20, "20": "Malayalam",
    /**
     * Meetei script, known as Meetei Mayek.
     *
     * Docs: <https://unicode.org/charts/PDF/UABC0.pdf>
     */
    MeeteiMayek: 21, "21": "MeeteiMayek",
    /**
     * Masaram Gondi script.
     *
     * Docs: <https://www.unicode.org/charts/PDF/U11D00.pdf>
     */
    MasaramGondi: 22, "22": "MasaramGondi",
    /**
     * Modi script.
     *
     * Docs: <https://unicode.org/charts/PDF/U11600.pdf>
     */
    Modi: 23, "23": "Modi",
    /**
     * Mon script.
     *
     * Docs: <https://unicode.org/charts/PDF/U1000.pdf>
     */
    Mon: 24, "24": "Mon",
    /**
     * Lao script.
     *
     * Docs:
     * - <https://unicode.org/charts/PDF/U0E80.pdf>
     * - <https://www.unicode.org/wg2/docs/n4861-17106r-lao-for-pali.pdf>
     * Nandinagari script.
     *
     * Docs: <https://unicode.org/charts/PDF/U119A0.pdf>
     */
    Nandinagari: 25, "25": "Nandinagari",
    /**
     * Newa script.
     *
     * Docs: <https://unicode.org/charts/PDF/U11400.pdf>
     */
    Newa: 26, "26": "Newa",
    /**
     * Odia script.
     *
     * Docs: <https://unicode.org/charts/PDF/U0B00.pdf>
     */
    Odia: 27, "27": "Odia",
    /**
     * Ol Chiki (Santali) script.
     *
     * Docs: <https://www.unicode.org/charts/PDF/U1C50.pdf>
     */
    OlChiki: 28, "28": "OlChiki",
    /**
     * `Phags-pa script.
     *
     * Docs: <https://www.unicode.org/charts/PDF/UA840.pdf>
     * Saurashtra script.
     *
     * Docs: <https://www.unicode.org/charts/PDF/UA880.pdf>
     */
    Saurashtra: 29, "29": "Saurashtra",
    /**
     * Sharada script.
     *
     * Docs: <https://unicode.org/charts/PDF/U11180.pdf>
     */
    Sharada: 30, "30": "Sharada",
    /**
     * Siddham script.
     *
     * Docs: <https://unicode.org/charts/PDF/U11580.pdf>
     */
    Siddham: 31, "31": "Siddham",
    /**
     * Sinhala script.
     *
     * Docs: <https://unicode.org/charts/PDF/U0D80.pdf>
     */
    Sinhala: 32, "32": "Sinhala",
    /**
     * Soyombo script.
     *
     * Docs: <https://unicode.org/charts/PDF/U11A50.pdf>
     */
    Soyombo: 33, "33": "Soyombo",
    /**
     * Tai Tham script (Lanna)
     *
     * Docs: <https://unicode.org/charts/PDF/U1A20.pdf>
     */
    TaiTham: 34, "34": "TaiTham",
    /**
     * Takri script.
     *
     * Docs: <https://www.unicode.org/charts/PDF/U11680.pdf>
     */
    Takri: 35, "35": "Takri",
    /**
     * Tamil script.
     *
     * Docs: <https://unicode.org/charts/PDF/U0B80.pdf>
     */
    Tamil: 36, "36": "Tamil",
    /**
     * Telugu script.
     *
     * Docs: <https://unicode.org/charts/PDF/U0C00.pdf>
     */
    Telugu: 37, "37": "Telugu",
    /**
     * Thai script.
     *
     * Docs: <https://unicode.org/charts/PDF/U0E00.pdf>
     */
    Thai: 38, "38": "Thai",
    /**
     * Tibetan script.
     *
     * **Status: buggy and partial.**
     *
     * Docs: <https://unicode.org/charts/PDF/U0F00.pdf>
     */
    Tibetan: 39, "39": "Tibetan",
    /**
     * Tirhuta script.
     *
     * Docs: <https://www.unicode.org/charts/PDF/U11480.pdf>
     */
    Tirhuta: 40, "40": "Tirhuta",
    /**
     * Zanabazar Square script.
     *
     * Docs: <https://www.unicode.org/charts/PDF/U11A00.pdf>
     */
    ZanabazarSquare: 41, "41": "ZanabazarSquare",
    /**
     * Baraha transliteration.
     *
     * Docs:
     * - <https://baraha.com/help//Keyboards/dev-phonetic.htm> (Baraha North)
     * - <https://baraha.com/help/special-symbols.htm>
     */
    BarahaSouth: 42, "42": "BarahaSouth",
    /**
     * Harvard-Kyoto transliteration.
     *
     * TODO: find documentation link for HK.
     */
    HarvardKyoto: 43, "43": "HarvardKyoto",
    /**
     * IAST transliteration.
     *
     * TODO: find documentation link for IAST.
     */
    Iast: 44, "44": "Iast",
    /**
     * ISO 15919 transliteration.
     *
     * TODO: find a free documentation link for ISO 15919.
     */
    Iso15919: 45, "45": "Iso15919",
    /**
     * ITRANS 5.3 transliteration.
     *
     * Docs:
     * - <https://www.aczoom.com/itrans/> (official ITRANS site for version 5.3)
     * - <https://www.aczoom.com/itrans/html/dvng/node3.html> (DEVNAG table)
     * - <http://www.sanskritweb.net/itrans/itmanual2003.pdf> (Itranslator 2003 manual)
     *
     * ITRANS appears in various versions, some of which conflict with each other. Version 5.3
     * seems to be the most widely used, and it is supported by software like Itranslator 2003.
     */
    Itrans: 46, "46": "Itrans",
    /**
     * SLP1 transliteration.
     *
     * Docs: <https://www.sanskritlibrary.org/pub/SLP1LiesAppendixB.pdf>
     */
    Slp1: 47, "47": "Slp1",
    /**
     * Velthuis transliteration.
     *
     * Docs:
     * - <https://mirrors.mit.edu/CTAN/language/devanagari/velthuis/doc/manual.pdf> (Devanagari)
     * - <https://ctan.math.illinois.edu/language/bengali/pandey/doc/bengdoc.pdf> (Bengali)
     */
    Velthuis: 48, "48": "Velthuis",
    /**
     * WX transliteration.
     *
     * TODO: find documentation link for WX.
     */
    Wx: 49, "49": "Wx",
});

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_error_7534b8e9a36f1ab4 = function(arg0, arg1) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_new_8a6f238a6ece86ea = function() {
        const ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_0ed75d68575b0f3c = function(arg0, arg1) {
        const ret = getObject(arg1).stack;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function __wbg_init_memory(imports, memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;



    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('vidyut_lipi_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
