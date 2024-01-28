let wasm;

const cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
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

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = new TextEncoder('utf-8');

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
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

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
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}
/**
* Wrapper for `transliterate`.
* @param {string} input
* @param {number} from
* @param {number} to
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
* @returns {number}
*/
export function detect(input) {
    const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.detect(ptr0, len0);
    return ret >>> 0;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}
/**
* A method of encoding text.
*
* Schemes vary on various dimensions, including:
*
* - writing system (alphabet vs. abugida)
* - text encoding (ASCII vs. Unicode)
* - support for Sanskrit (complete vs. partial)
*/
export const Scheme = Object.freeze({
/**
* Balinese script.
*
* Docs: <https://unicode.org/charts/PDF/U1B00.pdf>
*/
Balinese:0,"0":"Balinese",
/**
* Bengali script.
*
* Docs: <https://unicode.org/charts/PDF/U0980.pdf>
*/
Bengali:1,"1":"Bengali",
/**
* Brahmi script.
*
* Docs: <https://unicode.org/charts/PDF/U11000.pdf>
*/
Brahmi:2,"2":"Brahmi",
/**
* Burmese script.
*
* Docs: <https://unicode.org/charts/PDF/U1000.pdf>
*/
Burmese:3,"3":"Burmese",
/**
* Cham script.
*
* <https://unicode.org/charts/PDF/UAA00.pdf>
* Devanagari script.
*
* Docs:
* - <https://unicode.org/charts/PDF/U0900.pdf>
* - <https://unicode.org/charts/PDF/UA8E0.pdf> (Devanagari Extended)
* - <https://unicode.org/charts/PDF/U11B00.pdf> (Devanagari Extended-A)
* - <https://unicode.org/charts/PDF/U1CD0.pdf> (Vedic Extensions)
*/
Devanagari:4,"4":"Devanagari",
/**
* Gujarati script.
*
* Docs: <https://unicode.org/charts/PDF/U0A80.pdf>
*/
Gujarati:5,"5":"Gujarati",
/**
* Grantha script.
*
* Docs:
* - <http://www.unicode.org/charts/PDF/U11300.pdf>
* - <https://unicode.org/L2/L2009/09372-grantha.pdf>
*/
Grantha:6,"6":"Grantha",
/**
* Gurmukhi script.
*
* Docs: <https://unicode.org/charts/PDF/U0A00.pdf>
*/
Gurmukhi:7,"7":"Gurmukhi",
/**
* Javanese script.
*
* Docs: <https://unicode.org/charts/PDF/UA980.pdf>
*/
Javanese:8,"8":"Javanese",
/**
* Kannada script.
*
* Docs: <https://unicode.org/charts/PDF/U0C80.pdf>
*/
Kannada:9,"9":"Kannada",
/**
* Khmer script.
*
* <https://unicode.org/charts/PDF/U1780.pdf>
*/
Khmer:10,"10":"Khmer",
/**
* Malayalam script.
*
* Docs: <https://unicode.org/charts/PDF/U0D00.pdf>
*/
Malayalam:11,"11":"Malayalam",
/**
* Modi script.
*
* <https://unicode.org/charts/PDF/U11600.pdf>
*/
Modi:12,"12":"Modi",
/**
* Lao script.
*
* Documentation:
* - <https://unicode.org/charts/PDF/U0E80.pdf>
* - <https://www.unicode.org/wg2/docs/n4861-17106r-lao-for-pali.pdf>
* Newa script.
*
* <https://unicode.org/charts/PDF/U11400.pdf>
*/
Newa:13,"13":"Newa",
/**
* Odia script.
*
* Docs: <https://unicode.org/charts/PDF/U0B00.pdf>
*/
Odia:14,"14":"Odia",
/**
* Saurashtra script.
*
* Docs: <https://www.unicode.org/charts/PDF/UA880.pdf>
*/
Saurashtra:15,"15":"Saurashtra",
/**
* Sharada script.
*
* Docs: <https://unicode.org/charts/PDF/U11180.pdf>
*/
Sharada:16,"16":"Sharada",
/**
* Siddham script.
*
* Docs: <https://unicode.org/charts/PDF/U11580.pdf>
*/
Siddham:17,"17":"Siddham",
/**
* Sinhala script.
*
* Docs: <https://unicode.org/charts/PDF/U0D80.pdf>
*/
Sinhala:18,"18":"Sinhala",
/**
* Tamil script.
*
* Docs: <https://unicode.org/charts/PDF/U0B80.pdf>
*/
Tamil:19,"19":"Tamil",
/**
* Telugu script.
*
* Docs: <https://unicode.org/charts/PDF/U0C00.pdf>
*/
Telugu:20,"20":"Telugu",
/**
* Thai script.
*
* <https://unicode.org/charts/PDF/U0E00.pdf>
*/
Thai:21,"21":"Thai",
/**
* Tibetan script.
*
* **Status: buggy and partial.**
*
* Docs: <https://unicode.org/charts/PDF/U0F00.pdf>
*/
Tibetan:22,"22":"Tibetan",
/**
* Tirhuta script.
*
* Docs: <https://www.unicode.org/charts/PDF/U11480.pdf>
*/
Tirhuta:23,"23":"Tirhuta",
/**
* Baraha transliteration.
*
* Docs:
* - <https://baraha.com/help//Keyboards/dev-phonetic.htm> (Baraha North)
* - <https://baraha.com/help/special-symbols.htm>
*/
BarahaSouth:24,"24":"BarahaSouth",
/**
* Harvard-Kyoto transliteration.
*
* TODO: find documentation link for HK.
*/
HarvardKyoto:25,"25":"HarvardKyoto",
/**
* IAST transliteration.
*
* TODO: find documentation link for IAST.
*/
Iast:26,"26":"Iast",
/**
* ISO 15919 transliteration.
*
* TODO: find a free documentation link for ISO 15919.
*/
Iso15919:27,"27":"Iso15919",
/**
* ITRANS 5.3 transliteration.
*
* Docs:
* - https://www.aczoom.com/itrans/ (official ITRANS site for version 5.3)
* - https://www.aczoom.com/itrans/html/dvng/node3.html (DEVNAG table)
* - http://www.sanskritweb.net/itrans/itmanual2003.pdf (Itranslator 2003 manual)
*
* ITRANS appears in various versions, some of which conflict with each other. Version 5.3
* seems to be the most widely used, and it is supported by software like Itranslator 2003.
*/
Itrans:28,"28":"Itrans",
/**
* SLP1 transliteration.
*
* Docs: <https://www.sanskritlibrary.org/pub/SLP1LiesAppendixB.pdf>
*/
Slp1:29,"29":"Slp1",
/**
* Velthuis transliteration.
*
* Docs: <https://mirrors.mit.edu/CTAN/language/devanagari/velthuis/doc/manual.pdf>
*/
Velthuis:30,"30":"Velthuis",
/**
* WX transliteration.
*
* TODO: find documentation link for WX.
*/
Wx:31,"31":"Wx", });

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

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

function getImports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_abda76e883ba8a5f = function() {
        const ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_658279fe44541cf6 = function(arg0, arg1) {
        const ret = getObject(arg1).stack;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_error_f851667af71bcfc6 = function(arg0, arg1) {
        try {
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(arg0, arg1);
        }
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function initMemory(imports, maybe_memory) {

}

function finalizeInit(instance, module) {
    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;
    cachedInt32Memory0 = null;
    cachedUint8Memory0 = null;


    return wasm;
}

function initSync(module) {
    const imports = getImports();

    initMemory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return finalizeInit(instance, module);
}

async function init(input) {
    if (typeof input === 'undefined') {
        input = new URL('vidyut_lipi_bg.wasm', import.meta.url);
    }
    const imports = getImports();

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    initMemory(imports);

    const { instance, module } = await load(await input, imports);

    return finalizeInit(instance, module);
}

export { initSync }
export default init;
