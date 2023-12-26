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
* Bengali script.
*
* https://unicode.org/charts/PDF/U0980.pdf
*/
Bengali:0,"0":"Bengali",
/**
* Brahmi script.
*
* https://unicode.org/charts/PDF/U11000.pdf
*/
Brahmi:1,"1":"Brahmi",
/**
* Devanagari script.
*
* https://unicode.org/charts/PDF/U0900.pdf
*/
Devanagari:2,"2":"Devanagari",
/**
* Gujarati script.
*
* https://unicode.org/charts/PDF/U0A80.pdf
*/
Gujarati:3,"3":"Gujarati",
/**
* Gurmukhi script.
*
* https://unicode.org/charts/PDF/U0A00.pdf
*/
Gurmukhi:4,"4":"Gurmukhi",
/**
* Grantha script.
*
* http://www.unicode.org/charts/PDF/U11300.pdf
*/
Grantha:5,"5":"Grantha",
/**
* Kannada script.
*
* https://unicode.org/charts/PDF/U0C80.pdf
*/
Kannada:6,"6":"Kannada",
/**
* Malayalam script.
*
* https://unicode.org/charts/PDF/U0D00.pdf
*/
Malayalam:7,"7":"Malayalam",
/**
* Oriya script.
*
* https://unicode.org/charts/PDF/U0B00.pdf
*/
Oriya:8,"8":"Oriya",
/**
* Sinhala script.
*
* https://unicode.org/charts/PDF/U0D80.pdf
*/
Sinhala:9,"9":"Sinhala",
/**
* Tamil script.
*
* https://unicode.org/charts/PDF/U0B80.pdf
*/
Tamil:10,"10":"Tamil",
/**
* Tibetan script.
*
* https://unicode.org/charts/PDF/U0F00.pdf
* Telugu script.
*
* https://unicode.org/charts/PDF/U0C00.pdf
*/
Telugu:11,"11":"Telugu",
/**
* Harvard-Kyoto transliteration.
*
* TODO: find documentation link for HK.
*/
HarvardKyoto:12,"12":"HarvardKyoto",
/**
* ITRANS transliteration.
*
* https://www.aczoom.com/itrans/online/itrans6/itrans-tables-unicode.pdf
*/
Itrans:13,"13":"Itrans",
/**
* IAST transliteration.
*
* TODO: find documentation link for IAST.
*/
Iast:14,"14":"Iast",
/**
* SLP1 transliteration.
*
* https://www.sanskritlibrary.org/pub/SLP1LiesAppendixB.pdf
*/
Slp1:15,"15":"Slp1",
/**
* Velthuis transliteration.
*
* https://mirrors.mit.edu/CTAN/language/devanagari/velthuis/doc/manual.pdf
*/
Velthuis:16,"16":"Velthuis", });
/**
* WebAssembly API for vidyut-prakriya.
*
* Within reason, we have tried to mimic a native JavaScript API. At some point, we wish to
* support optional arguments, perhaps by using `Reflect`.
*/
export class VidyutLipi {

    static __wrap(ptr) {
        const obj = Object.create(VidyutLipi.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vidyutlipi_free(ptr);
    }
    /**
    * Creates a new API manager.
    *
    * This constructor is not called `new` because `new` is a reserved word in JavaScript.
    * @returns {VidyutLipi}
    */
    static init() {
        const ret = wasm.vidyutlipi_init();
        return VidyutLipi.__wrap(ret);
    }
    /**
    * Wrapper for `transliterate`.
    * @param {string} input
    * @param {number} from
    * @param {number} to
    * @returns {any}
    */
    transliterate(input, from, to) {
        const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.vidyutlipi_transliterate(this.ptr, ptr0, len0, from, to);
        return takeObject(ret);
    }
}

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
