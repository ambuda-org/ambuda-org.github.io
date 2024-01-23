let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

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

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

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

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
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

function isLikeNone(x) {
    return x === undefined || x === null;
}
/**
* The complete list of ordinary krt-pratyayas.
*
* Rust's naming convention is to start enum values with capital letters. However, we allow mixed
* case explicitly here so that we can name pratyayas more concisely with SLP1. Doing so helps us
* distinguish between pratyayas like `naN` and `nan`.
*/
export const BaseKrt = Object.freeze({
/**
* -a
*/
a:0,"0":"a",
/**
* -a,
*/
aN:1,"1":"aN",
/**
* -a
*/
ac:2,"2":"ac",
/**
* -a
*/
aR:3,"3":"aR",
/**
* -at (jarat)
*/
atfn:4,"4":"atfn",
/**
* -aTu (vepaTu). Allowed only for dhatus that are `qvit`.
*/
aTuc:5,"5":"aTuc",
/**
* -ani
*/
ani:6,"6":"ani",
/**
* -anIya (gamanIya, BavanIya, ...)
*/
anIyar:7,"7":"anIyar",
/**
* -a
*/
ap:8,"8":"ap",
/**
* -Alu
*/
Aluc:9,"9":"Aluc",
/**
* -Aru
*/
Aru:10,"10":"Aru",
/**
* -ika
*/
ika:11,"11":"ika",
/**
* -ikavaka
*/
ikavaka:12,"12":"ikavaka",
/**
* -itra
*/
itra:13,"13":"itra",
/**
* -in. The trailing `_` is to avoid colliding with Rust's `in` keyword.
*/
in_:14,"14":"in_",
/**
* -in
*/
ini:15,"15":"ini",
/**
* -izRu (alaMkarizRu, prajanizRu, ...)
*/
izRuc:16,"16":"izRuc",
/**
* -u (yuyutsu, Bikzu, ...)
*/
u:17,"17":"u",
/**
* -uka
*/
ukaY:18,"18":"ukaY",
/**
* -Uka
*/
Uka:19,"19":"Uka",
/**
* -a
*/
ka:20,"20":"ka",
/**
* -a
*/
kaY:21,"21":"kaY",
/**
* -am
*/
kamul:22,"22":"kamul",
/**
* -as (visfpaH, ...)
*/
kasun:23,"23":"kasun",
/**
* -a
*/
kap:24,"24":"kap",
/**
* -Ana (cakrARa, ...)
*/
kAnac:25,"25":"kAnac",
/**
* -i (udaDi, ...)
*/
ki:26,"26":"ki",
/**
* -i
*/
kin:27,"27":"kin",
/**
* -ura (BaNgura, ...)
*/
kurac:28,"28":"kurac",
/**
* -elima (pacelima, ...)
*/
kelimar:29,"29":"kelimar",
/**
* -ta (gata, bhUta, ...)
*/
kta:30,"30":"kta",
/**
* -tavat (gatavat, bhUtavat, ...)
*/
ktavatu:31,"31":"ktavatu",
/**
* -ti
*/
ktic:32,"32":"ktic",
/**
* -ti
*/
ktin:33,"33":"ktin",
/**
* -tri
*/
ktri:34,"34":"ktri",
/**
* -tvA (gatvA, bhUtva, ...)
*/
ktvA:35,"35":"ktvA",
/**
* -nu
*/
knu:36,"36":"knu",
/**
* -mara
*/
kmarac:37,"37":"kmarac",
/**
* -ya
*/
kyap:38,"38":"kyap",
/**
* -ru (BIru)
*/
kru:39,"39":"kru",
/**
* -ruka (BIruka)
*/
kruka:40,"40":"kruka",
/**
* -luka (BIluka)
*/
klukan:41,"41":"klukan",
/**
* -van
*/
kvanip:42,"42":"kvanip",
/**
* -vara
*/
kvarap:43,"43":"kvarap",
/**
* -vas
*/
kvasu:44,"44":"kvasu",
/**
* -snu (glAsnu, jizRu, ...)
*/
ksnu:45,"45":"ksnu",
/**
* (empty suffix)
*/
kvin:46,"46":"kvin",
/**
* (empty suffix)
*/
kvip:47,"47":"kvip",
/**
* -a (priyaMvada, vaSaMvada)
*/
Kac:48,"48":"Kac",
/**
* -a
*/
KaS:49,"49":"KaS",
/**
* -a (Izatkara, duzkara, sukara, ...)
*/
Kal:50,"50":"Kal",
/**
* -izRu
*/
KizRuc:51,"51":"KizRuc",
/**
* -uka
*/
KukaY:52,"52":"KukaY",
/**
* -ana
*/
Kyun:53,"53":"Kyun",
/**
* -a
*/
Ga:54,"54":"Ga",
/**
* -a
*/
GaY:55,"55":"GaY",
/**
* -in
*/
GinuR:56,"56":"GinuR",
/**
* -ura
*/
Gurac:57,"57":"Gurac",
/**
* -van
*/
Nvanip:58,"58":"Nvanip",
/**
* -Ana
*/
cAnaS:59,"59":"cAnaS",
/**
* -a
*/
wa:60,"60":"wa",
/**
* -a
*/
wak:61,"61":"wak",
/**
* -a
*/
qa:62,"62":"qa",
/**
* -ara,
*/
qara:63,"63":"qara",
/**
* -u
*/
qu:64,"64":"qu",
/**
* -a
*/
Ra:65,"65":"Ra",
/**
* -am
*/
Ramul:66,"66":"Ramul",
/**
* -in
*/
Rini:67,"67":"Rini",
/**
* -ya
*/
Ryat:68,"68":"Ryat",
/**
* -ana
*/
Ryuw:69,"69":"Ryuw",
/**
* (empty)
*/
Rvi:70,"70":"Rvi",
/**
* -aka
*/
Rvuc:71,"71":"Rvuc",
/**
* -aka
*/
Rvul:72,"72":"Rvul",
/**
* -tavya (gantavya, bhavitavya, ...)
*/
tavya:73,"73":"tavya",
/**
* -tavya
*/
tavyat:74,"74":"tavyat",
/**
* -tum (gantum, bhavitum, ...)
*/
tumun:75,"75":"tumun",
/**
* -tf (gantA, bhavitA, ...)
*/
tfc:76,"76":"tfc",
/**
* -tf
*/
tfn:77,"77":"tfn",
/**
* -Taka (gATaka)
*/
Takan:78,"78":"Takan",
/**
* -na
*/
naN:79,"79":"naN",
/**
* -naj
*/
najiN:80,"80":"najiN",
/**
* -na (svapna)
*/
nan:81,"81":"nan",
/**
* -man
*/
manin:82,"82":"manin",
/**
* -a
*/
Sa:83,"83":"Sa",
/**
* -at (gacCat, Bavat, ...)
*/
Satf:84,"84":"Satf",
/**
* -Ana (laBamAna, sevamAna, ...)
*/
SAnac:85,"85":"SAnac",
/**
* -Ana
*/
SAnan:86,"86":"SAnan",
/**
* -ya
*/
yat:87,"87":"yat",
/**
* -ana
*/
yuc:88,"88":"yuc",
/**
* -na (namra, kampra, ...)
*/
ra:89,"89":"ra",
/**
* -ru
*/
ru:90,"90":"ru",
/**
* -ana
*/
lyu:91,"91":"lyu",
/**
* -ana
*/
lyuw:92,"92":"lyuw",
/**
* -van
*/
vanip:93,"93":"vanip",
/**
* -vara
*/
varac:94,"94":"varac",
/**
* (empty suffix)
*/
vic:95,"95":"vic",
/**
* (none)
*/
viw:96,"96":"viw",
/**
* -aka
*/
vuY:97,"97":"vuY",
/**
* -aka
*/
vun:98,"98":"vun",
/**
* -Aka
*/
zAkan:99,"99":"zAkan",
/**
* -tra
*/
zwran:100,"100":"zwran",
/**
* -aka
*/
zvun:101,"101":"zvun", });
/**
* The gender of some subanta.
*/
export const Linga = Object.freeze({
/**
* The masculine.
*/
Pum:0,"0":"Pum",
/**
* The feminine.
*/
Stri:1,"1":"Stri",
/**
* The neuter.
*/
Napumsaka:2,"2":"Napumsaka", });
/**
* The case ending of some subanta.
*/
export const Vibhakti = Object.freeze({
/**
* The first vibhakti . Sometimes called the *nominative case*.
*/
Prathama:0,"0":"Prathama",
/**
* The second vibhakti. Sometimes called the *accusative case*.
*/
Dvitiya:1,"1":"Dvitiya",
/**
* The third vibhakti. Sometimes called the *instrumental case*.
*/
Trtiya:2,"2":"Trtiya",
/**
* The fourth vibhakti. Sometimes called the *dative case*.
*/
Caturthi:3,"3":"Caturthi",
/**
* The fifth vibhakti. Sometimes called the *ablative case*.
*/
Panchami:4,"4":"Panchami",
/**
* The sixth vibhakti. Sometimes called the *genitive case*.
*/
Sasthi:5,"5":"Sasthi",
/**
* The seventh vibhakti. Sometimes called the *locative case*.
*/
Saptami:6,"6":"Saptami",
/**
* The first vibhakti used in the sense of *sambodhana*. Sometimes called the *vocative case*.
*
* *Sambodhana* is technically not a *vibhakti but rather an additional semantic condition
* on the first vibhakti. But we felt that users would find it more convenient to have this
* condition available on `Vibhakti` directly rather than have to define the *sambodhana*
* condition separately.
*/
Sambodhana:7,"7":"Sambodhana", });
/**
* Defines a *gaṇa*.
*
* The dhatus in the Dhatupatha are organized in ten large *gaṇa*s or classes. These gaṇas
* add various properties to the dhatu, most notably the specific *vikaraṇa* (stem suffix) we use
* before sarvadhatuka suffixes.
*/
export const Gana = Object.freeze({
/**
* The first gaṇa, whose first dhatu is `BU`.
*/
Bhvadi:0,"0":"Bhvadi",
/**
* The second gaṇa, whose first dhatu is `ad`.
*/
Adadi:1,"1":"Adadi",
/**
* The third gaṇa, whose first dhatu is `hu`.
*/
Juhotyadi:2,"2":"Juhotyadi",
/**
* The fourth gaṇa, whose first dhatu is `div`.
*/
Divadi:3,"3":"Divadi",
/**
* The fifth gaṇa, whose first dhatu is `su`.
*/
Svadi:4,"4":"Svadi",
/**
* The sixth gaṇa, whose first dhatu is `tud`.
*/
Tudadi:5,"5":"Tudadi",
/**
* The seventh gaṇa, whose first dhatu is `ruD`.
*/
Rudhadi:6,"6":"Rudhadi",
/**
* The eighth gaṇa, whose first dhatu is `tan`.
*/
Tanadi:7,"7":"Tanadi",
/**
* The ninth gaṇa, whose first dhatu is `krI`.
*/
Kryadi:8,"8":"Kryadi",
/**
* The tenth gaṇa, whose first dhatu is `cur`.
*/
Curadi:9,"9":"Curadi",
/**
* The kandvAdi gaṇa, whose first dhatu is `kaRqU`.
*/
Kandvadi:10,"10":"Kandvadi", });
/**
* A *sanAdi* pratyaya.
*
* The *sanAdi* pratyayas create new dhatus per 3.1.32. They are introduced in rules 3.1.7 -
* 3.1.30, and since rule 3.1.7 contains the word "dhAtoH", they can be called Ardhadhatuka by
* 3.4.114.
*
* Any sanAdi-pratyayas not listed here are required by certain sutras and added by default.
*
* For details on what these pratyayas mean and what kinds of words they produce, see the comments
* below.
*/
export const Sanadi = Object.freeze({
/**
* `kAmyac`, which creates nAma-dhAtus per 3.1.9.
*
* Examples: `putrakAmyati`
*/
kAmyac:0,"0":"kAmyac",
/**
* `kyaN`, which creates nAma-dhAtus per 3.1.11.
*
* Examples: `SyenAyate`, `BfSAyate`
*/
kyaN:1,"1":"kyaN",
/**
* `kyac`, which creates nAma-dhAtus per 3.1.8.
*
* Examples: `putrIyati`
*/
kyac:2,"2":"kyac",
/**
* `Nic`, which creates causal roots per 3.1.26.
*
* Examples: `BAvayati`, `nAyayati`.
*/
Ric:3,"3":"Ric",
/**
* `yaN`, which creates intensive roots per 3.1.22. For certain dhatus, the semantics are
* instead "crooked movement" (by 3.1.23) or "contemptible" action (by 3.1.24).
*
* Examples: boBUyate, nenIyate.
*
* Constraints: can be used only if the dhatu starts with a consonant and has exactly one
* vowel. If this constraint is violated, our APIs will return an `Error`.
*/
yaN:4,"4":"yaN",
/**
* `yaN`, with lopa per 2.4.74. This is often listed separately due to its rarity and its
* very different form.
*
* Examples: boBavIti, boBoti, nenayIti, neneti.
*/
yaNluk:5,"5":"yaNluk",
/**
* `san`, which creates desiderative roots per 3.1.7.
*
* Examples: buBUzati, ninIzati.
*/
san:6,"6":"san", });
/**
* The complete list of unadi-pratyayas.
*
* Rust's naming convention is to start enum values with capital letters. However, we allow mixed
* case explicitly here so that we can name pratyayas more concisely with SLP1. Doing so helps us
* distinguish between pratyayas like `naN` and `nan`.
*
* NOTE: we generated this list programmatically. Many of these pratyayas have typos.
*/
export const Unadi = Object.freeze({
/**
* -a
*/
a:0,"0":"a",
/**
* -aknu
*/
aknuc:1,"1":"aknuc",
/**
* -aNga
*/
aNgac:2,"2":"aNgac",
/**
* -adAnu
*/
radAnuk:3,"3":"radAnuk",
/**
* -a
*/
ac:4,"4":"ac",
/**
* -aj
*/
aji:5,"5":"aji",
/**
* -awa
*/
awan:6,"6":"awan",
/**
* -aw
*/
awi:7,"7":"awi",
/**
* -aWa
*/
aWa:8,"8":"aWa",
/**
* -aRqa
*/
aRqan:9,"9":"aRqan",
/**
* -ata
*/
atac:10,"10":"atac",
/**
* -at
*/
ati:11,"11":"ati",
/**
* -ati
*/
ati_:12,"12":"ati_",
/**
* -atra
*/
atran:13,"13":"atran",
/**
* -atri
*/
atrin:14,"14":"atrin",
/**
* -aTa
*/
aTa:15,"15":"aTa",
/**
* -ad
*/
adi:16,"16":"adi",
/**
* -a
*/
an:17,"17":"an",
/**
* -ani
*/
ani:18,"18":"ani",
/**
* -anu
*/
anuN:19,"19":"anuN",
/**
* -anya
*/
anya:20,"20":"anya",
/**
* -anyu
*/
anyuc:21,"21":"anyuc",
/**
* -apa
*/
apa:22,"22":"apa",
/**
* -abaka
*/
abaka:23,"23":"abaka",
/**
* -amba
*/
ambac:24,"24":"ambac",
/**
* -aBa
*/
aBac:25,"25":"aBac",
/**
* -ama
*/
ama:26,"26":"ama",
/**
* -ama (praTama)
*/
amac:27,"27":"amac",
/**
* -amba
*/
ambaj:28,"28":"ambaj",
/**
* -ayu
*/
ayu:29,"29":"ayu",
/**
* -ara
*/
ara:30,"30":"ara",
/**
* -ara
*/
aran:31,"31":"aran",
/**
* -ar
*/
aran_:32,"32":"aran_",
/**
* -aru
*/
aru:33,"33":"aru",
/**
* -a
*/
al:34,"34":"al",
/**
* -ala (maNgala)
*/
alac:35,"35":"alac",
/**
* -ali
*/
alic:36,"36":"alic",
/**
* -avi
*/
avi:37,"37":"avi",
/**
* -a
*/
asa:38,"38":"asa",
/**
* -asa
*/
asac:39,"39":"asac",
/**
* -asAna
*/
asAnac:40,"40":"asAnac",
/**
* -as
*/
asi:41,"41":"asi",
/**
* -as (cetas)
*/
asun:42,"42":"asun",
/**
* -A
*/
A:43,"43":"A",
/**
* -Aka
*/
Aka:44,"44":"Aka",
/**
* -AgU
*/
AgUc:45,"45":"AgUc",
/**
* -Awa
*/
Awac:46,"46":"Awac",
/**
* -ARaka
*/
ARaka:47,"47":"ARaka",
/**
* -Atu
*/
Atu:48,"48":"Atu",
/**
* -Atfka
*/
Atfkan:49,"49":"Atfkan",
/**
* -Anaka
*/
Anaka:50,"50":"Anaka",
/**
* -Ana
*/
Anac:51,"51":"Anac",
/**
* -Anu
*/
Anuk:52,"52":"Anuk",
/**
* -Anya
*/
Anya:53,"53":"Anya",
/**
* -Ayya
*/
Ayya:54,"54":"Ayya",
/**
* -Ara
*/
Aran:55,"55":"Aran",
/**
* -Ala
*/
Ala:56,"56":"Ala",
/**
* -Ala
*/
Alac:57,"57":"Alac",
/**
* -Ala
*/
AlaY:58,"58":"AlaY",
/**
* -AlIya
*/
AlIyac:59,"59":"AlIyac",
/**
* -A
*/
Asa:60,"60":"Asa",
/**
* -As
*/
Asi:61,"61":"Asi",
/**
* -i
*/
i:62,"62":"i",
/**
* -ika
*/
ikan:63,"63":"ikan",
/**
* -ij
*/
iji:64,"64":"iji",
/**
* -i
*/
iY:65,"65":"iY",
/**
* -i
*/
iR:66,"66":"iR",
/**
* -ita
*/
ita:67,"67":"ita",
/**
* -ita
*/
itac:68,"68":"itac",
/**
* -ita
*/
itan:69,"69":"itan",
/**
* -it
*/
iti:70,"70":"iti",
/**
* -itnu
*/
itnuc:71,"71":"itnuc",
/**
* -itra
*/
itra:72,"72":"itra",
/**
* -itva
*/
itvan:73,"73":"itvan",
/**
* -iTi
*/
iTin:74,"74":"iTin",
/**
* -i
*/
in_:75,"75":"in_",
/**
* -ina
*/
inac:76,"76":"inac",
/**
* -ina
*/
inaR:77,"77":"inaR",
/**
* -ina
*/
inan:78,"78":"inan",
/**
* -in
*/
ini:79,"79":"ini",
/**
* -iman
*/
imanic:80,"80":"imanic",
/**
* -iman
*/
imanin:81,"81":"imanin",
/**
* -ila
*/
ilac:82,"82":"ilac",
/**
* -izWa
*/
izWac:83,"83":"izWac",
/**
* -izWu
*/
izWuc:84,"84":"izWuc",
/**
* -izRu
*/
izRuc:85,"85":"izRuc",
/**
* -isa
*/
isan:86,"86":"isan",
/**
* -is
*/
isi:87,"87":"isi",
/**
* -is
*/
isin:88,"88":"isin",
/**
* -I
*/
I:89,"89":"I",
/**
* -Ika
*/
Ikan:90,"90":"Ikan",
/**
* -Ici
*/
Ici:91,"91":"Ici",
/**
* -Ida
*/
Ida:92,"92":"Ida",
/**
* -Ira
*/
Irac:93,"93":"Irac",
/**
* -Ira
*/
Iran:94,"94":"Iran",
/**
* -Iza
*/
Izan:95,"95":"Izan",
/**
* -u
*/
u:96,"96":"u",
/**
* -uka
*/
ukan:97,"97":"ukan",
/**
* -uqa
*/
uqac:98,"98":"uqac",
/**
* -u
*/
uR:99,"99":"uR",
/**
* -ut
*/
uti:100,"100":"uti",
/**
* -utra
*/
utra:101,"101":"utra",
/**
* -una
*/
una:102,"102":"una",
/**
* -una
*/
unan:103,"103":"unan",
/**
* -unas
*/
unasi:104,"104":"unasi",
/**
* -uni
*/
uni:105,"105":"uni",
/**
* -unta
*/
unta:106,"106":"unta",
/**
* -unti
*/
unti:107,"107":"unti",
/**
* -uma
*/
uma:108,"108":"uma",
/**
* -umBa
*/
umBa:109,"109":"umBa",
/**
* -ura
*/
urac:110,"110":"urac",
/**
* -ura
*/
uran:111,"111":"uran",
/**
* -ur
*/
uran_:112,"112":"uran_",
/**
* -uri
*/
urin:113,"113":"urin",
/**
* -ula
*/
ulac:114,"114":"ulac",
/**
* -uli
*/
uli:115,"115":"uli",
/**
* -uza
*/
uzac:116,"116":"uzac",
/**
* -us (Danus)
*/
usi:117,"117":"usi",
/**
* -U
*/
U:118,"118":"U",
/**
* -Uka
*/
Uka:119,"119":"Uka",
/**
* -Uka
*/
UkaR:120,"120":"UkaR",
/**
* -UKa
*/
UKa:121,"121":"UKa",
/**
* -UTa
*/
UTan:122,"122":"UTan",
/**
* -Uma
*/
Uma:123,"123":"Uma",
/**
* -U
*/
Ur:124,"124":"Ur",
/**
* -Ura
*/
Uran:125,"125":"Uran",
/**
* -Uza
*/
Uzan:126,"126":"Uzan",
/**
* -f
*/
f:127,"127":"f",
/**
* -ft
*/
ftin:128,"128":"ftin",
/**
* -f
*/
fn_:129,"129":"fn_",
/**
* -eRu
*/
eRu:130,"130":"eRu",
/**
* -eRya
*/
eRya:131,"131":"eRya",
/**
* -era
*/
erak:132,"132":"erak",
/**
* -elima
*/
elimac:133,"133":"elimac",
/**
* -ota
*/
otac:134,"134":"otac",
/**
* -ora
*/
oran:135,"135":"oran",
/**
* -ola
*/
olac:136,"136":"olac",
/**
* -ka
*/
ka:137,"137":"ka",
/**
* -ka
*/
kak:138,"138":"kak",
/**
* -kaNkaRa
*/
kaNkaRa:139,"139":"kaNkaRa",
/**
* -kaRa
*/
kaRa:140,"140":"kaRa",
/**
* -katu
*/
katu:141,"141":"katu",
/**
* -katni
*/
katnic:142,"142":"katnic",
/**
* -katra
*/
katra:143,"143":"katra",
/**
* -kTa
*/
kTan:144,"144":"kTan",
/**
* -ka
*/
kan:145,"145":"kan",
/**
* -anas
*/
kanasi:146,"146":"kanasi",
/**
* -an
*/
kanin:147,"147":"kanin",
/**
* -kanu
*/
kanum:148,"148":"kanum",
/**
* -kanya
*/
kanyan:149,"149":"kanyan",
/**
* -kanyu
*/
kanyuc:150,"150":"kanyuc",
/**
* -kapa
*/
kapa:151,"151":"kapa",
/**
* -kapa
*/
kapan:152,"152":"kapan",
/**
* -am
*/
kamin:153,"153":"kamin",
/**
* -kaya
*/
kayan:154,"154":"kayan",
/**
* -kara
*/
karan:155,"155":"karan",
/**
* -kala
*/
kala:156,"156":"kala",
/**
* -kAku
*/
kAku:157,"157":"kAku",
/**
* -kAla
*/
kAlan:158,"158":"kAlan",
/**
* -ika
*/
kikan:159,"159":"kikan",
/**
* -kita
*/
kitac:160,"160":"kitac",
/**
* -kinda
*/
kindac:161,"161":"kindac",
/**
* -kira
*/
kirac:162,"162":"kirac",
/**
* -kizya
*/
kizyan:163,"163":"kizyan",
/**
* -kIka
*/
kIkac:164,"164":"kIkac",
/**
* -kIka
*/
kIkan:165,"165":"kIkan",
/**
* -kIwa
*/
kIwan:166,"166":"kIwan",
/**
* -ku
*/
ku:167,"167":"ku",
/**
* -ku
*/
kuk:168,"168":"kuk",
/**
* -kuka
*/
kukan:169,"169":"kukan",
/**
* -kuza
*/
kuzan:170,"170":"kuzan",
/**
* -kU
*/
kU:171,"171":"kU",
/**
* -kta
*/
kta:172,"172":"kta",
/**
* -ktnu
*/
ktnu:173,"173":"ktnu",
/**
* -ktra
*/
ktra:174,"174":"ktra",
/**
* -kTi
*/
kTin:175,"175":"kTin",
/**
* -kna
*/
kna:176,"176":"kna",
/**
* -kni
*/
knin:177,"177":"knin",
/**
* -kmala
*/
kmalan:178,"178":"kmalan",
/**
* -ana
*/
kyu:179,"179":"kyu",
/**
* -ana
*/
kyun:180,"180":"kyun",
/**
* -kra
*/
kran:181,"181":"kran",
/**
* -krara
*/
kraran:182,"182":"kraran",
/**
* -kri
*/
kri:183,"183":"kri",
/**
* -kri
*/
krin:184,"184":"krin",
/**
* -ruka
*/
krukan:185,"185":"krukan",
/**
* -kru
*/
krun:186,"186":"krun",
/**
* -kla
*/
kla:187,"187":"kla",
/**
* -kva
*/
kvan:188,"188":"kvan",
/**
* -van
*/
kvanip:189,"189":"kvanip",
/**
* -kvi
*/
kvin:190,"190":"kvin",
/**
* -
*/
kvip:191,"191":"kvip",
/**
* -aka
*/
kvun:192,"192":"kvun",
/**
* -ksara
*/
ksaran:193,"193":"ksaran",
/**
* -ksi
*/
ksi:194,"194":"ksi",
/**
* -ksu
*/
ksu:195,"195":"ksu",
/**
* -kseyya
*/
kseyya:196,"196":"kseyya",
/**
* -ksna
*/
ksna:197,"197":"ksna",
/**
* -Ka
*/
Ka:198,"198":"Ka",
/**
* -ga
*/
ga:199,"199":"ga",
/**
* -ga
*/
gak:200,"200":"gak",
/**
* -ga
*/
gaR:201,"201":"gaR",
/**
* -ga
*/
gan:202,"202":"gan",
/**
* -GaTi
*/
GaTin:203,"203":"GaTin",
/**
* -ca
*/
caw:204,"204":"caw",
/**
* -catu
*/
catu:205,"205":"catu",
/**
* -c
*/
cik:206,"206":"cik",
/**
* -Ja
*/
Jac:207,"207":"Jac",
/**
* -Ji
*/
Jic:208,"208":"Jic",
/**
* -Yu
*/
YuR:209,"209":"YuR",
/**
* -wa
*/
wa:210,"210":"wa",
/**
* -wa
*/
wan:211,"211":"wan",
/**
* -wiza
*/
wizac:212,"212":"wizac",
/**
* -Wa
*/
Wa:213,"213":"Wa",
/**
* -qa
*/
qa:214,"214":"qa",
/**
* -qau
*/
qau:215,"215":"qau",
/**
* -ra
*/
qraw:216,"216":"qraw",
/**
* -qati
*/
qati:217,"217":"qati",
/**
* -avat
*/
qavatu:218,"218":"qavatu",
/**
* -qim
*/
qimi:219,"219":"qimi",
/**
* -quta
*/
qutac:220,"220":"qutac",
/**
* -qu
*/
qun:221,"221":"qun",
/**
* -ums
*/
qumsun:222,"222":"qumsun",
/**
* -U
*/
qU:223,"223":"qU",
/**
* -E
*/
qE:224,"224":"qE",
/**
* -Es
*/
qEsi:225,"225":"qEsi",
/**
* -o
*/
qo:226,"226":"qo",
/**
* -os
*/
qosi:227,"227":"qosi",
/**
* -O
*/
qO:228,"228":"qO",
/**
* -qri
*/
qri:229,"229":"qri",
/**
* -Qa
*/
Qa:230,"230":"Qa",
/**
* -Ritra
*/
Ritran:231,"231":"Ritran",
/**
* -Ru
*/
Ru:232,"232":"Ru",
/**
* -Ruka
*/
Rukan:233,"233":"Rukan",
/**
* -ta
*/
ta:234,"234":"ta",
/**
* -taka
*/
takan:235,"235":"takan",
/**
* -ta
*/
tan:236,"236":"tan",
/**
* -tana
*/
tanan:237,"237":"tanan",
/**
* -taSa
*/
taSan:238,"238":"taSan",
/**
* -taSas
*/
taSasun:239,"239":"taSasun",
/**
* -ti
*/
ti:240,"240":"ti",
/**
* -tika
*/
tikan:241,"241":"tikan",
/**
* -tu
*/
tu:242,"242":"tu",
/**
* -tu
*/
tun:243,"243":"tun",
/**
* -tf
*/
tfc:244,"244":"tfc",
/**
* -tf
*/
tfn:245,"245":"tfn",
/**
* -tna
*/
tnaR:246,"246":"tnaR",
/**
* -tyu
*/
tyuk:247,"247":"tyuk",
/**
* -tra
*/
tra:248,"248":"tra",
/**
* -tra
*/
tran:249,"249":"tran",
/**
* -tri
*/
trin:250,"250":"trin",
/**
* -tri
*/
trip:251,"251":"trip",
/**
* -tva
*/
tvan:252,"252":"tvan",
/**
* -Ta
*/
Tak:253,"253":"Tak",
/**
* -da
*/
da:254,"254":"da",
/**
* -da
*/
dan:255,"255":"dan",
/**
* -Du
*/
Duk:256,"256":"Duk",
/**
* -na
*/
na:257,"257":"na",
/**
* -na
*/
nak:258,"258":"nak",
/**
* -ni
*/
ni:259,"259":"ni",
/**
* -nu
*/
nu:260,"260":"nu",
/**
* -pa
*/
pa:261,"261":"pa",
/**
* -pAsa
*/
pAsa:262,"262":"pAsa",
/**
* -Pa
*/
Pak:263,"263":"Pak",
/**
* -ba
*/
ban:264,"264":"ban",
/**
* -Ba
*/
Ba:265,"265":"Ba",
/**
* -Ba
*/
Ban:266,"266":"Ban",
/**
* -ma
*/
mak:267,"267":"mak",
/**
* -madi
*/
madik:268,"268":"madik",
/**
* -ma
*/
man:269,"269":"man",
/**
* -man
*/
mani:270,"270":"mani",
/**
* -man
*/
maniR:271,"271":"maniR",
/**
* -man
*/
manin:272,"272":"manin",
/**
* -mi
*/
mi:273,"273":"mi",
/**
* -mi
*/
min:274,"274":"min",
/**
* -mu
*/
muk:275,"275":"muk",
/**
* -ya
*/
ya:276,"276":"ya",
/**
* -ya
*/
yak:277,"277":"yak",
/**
* -ya
*/
yat:278,"278":"yat",
/**
* -yatu
*/
yatuc:279,"279":"yatuc",
/**
* -yu
*/
yuk:280,"280":"yuk",
/**
* -ana
*/
yuc:281,"281":"yuc",
/**
* -ana
*/
yun:282,"282":"yun",
/**
* -ra
*/
ra:283,"283":"ra",
/**
* -ra
*/
rak:284,"284":"rak",
/**
* -ra
*/
ran:285,"285":"ran",
/**
* -ru
*/
ru:286,"286":"ru",
/**
* -la
*/
lak:287,"287":"lak",
/**
* -va
*/
va:288,"288":"va",
/**
* -va
*/
vaR:289,"289":"vaR",
/**
* -va
*/
van:290,"290":"van",
/**
* -van
*/
vanip:291,"291":"vanip",
/**
* -vara
*/
varaw:292,"292":"varaw",
/**
* -vala
*/
valaY:293,"293":"valaY",
/**
* -vAla
*/
vAlac:294,"294":"vAlac",
/**
* -vAla
*/
vAlan:295,"295":"vAlan",
/**
* -vi
*/
vin:296,"296":"vin",
/**
* -aka
*/
vun:297,"297":"vun",
/**
* -Sa
*/
Sak:298,"298":"Sak",
/**
* -Su
*/
Sun:299,"299":"Sun",
/**
* -Sva
*/
SvaR:300,"300":"SvaR",
/**
* -ziva
*/
zivan:301,"301":"zivan",
/**
* -zwra
*/
zwran:302,"302":"zwran",
/**
* -zvara
*/
zvarac:303,"303":"zvarac",
/**
* -sa
*/
sa:304,"304":"sa",
/**
* -sa
*/
san:305,"305":"san",
/**
* -sara
*/
sara:306,"306":"sara",
/**
* -sika
*/
sikan:307,"307":"sikan",
/**
* -sTa
*/
sTan:308,"308":"sTan",
/**
* -sma
*/
sman:309,"309":"sman",
/**
* -sya
*/
sya:310,"310":"sya",
/**
* -sya
*/
syan:311,"311":"syan", });
/**
* The prayoga of some tinanta.
*/
export const Prayoga = Object.freeze({
/**
* Usage coreferent with the agent, e.g. "The horse *goes* to the village."
*/
Kartari:0,"0":"Kartari",
/**
* Usage coreferent with the object, e.g. "The village *is gone to* by the horse."
*/
Karmani:1,"1":"Karmani",
/**
* Usage without a referent, e.g. "*There is motion* by the horse to the village."
* bhAve prayoga generally produces the same forms as karmani prayoga.
*/
Bhave:2,"2":"Bhave", });
/**
* The person of some tinanta.
*/
export const Purusha = Object.freeze({
/**
* The third person.
*/
Prathama:0,"0":"Prathama",
/**
* The second person.
*/
Madhyama:1,"1":"Madhyama",
/**
* The first person.
*/
Uttama:2,"2":"Uttama", });
/**
* The number of some tinanta or subanta.
*/
export const Vacana = Object.freeze({
/**
* The singular.
*/
Eka:0,"0":"Eka",
/**
* The dual.
*/
Dvi:1,"1":"Dvi",
/**
* The plural.
*/
Bahu:2,"2":"Bahu", });
/**
* The tense/mood of some tinanta.
*/
export const Lakara = Object.freeze({
/**
* Describes action in the present tense. Ssometimes called the *present indicative*.
*/
Lat:0,"0":"Lat",
/**
* Describes unwitnessed past action. Sometimes called the *perfect*.
*/
Lit:1,"1":"Lit",
/**
* Describes future action after the current day. Sometimes called the *periphrastic future*.
*/
Lut:2,"2":"Lut",
/**
* Describes general future action. Sometimes called the *simple future*.
*/
Lrt:3,"3":"Lrt",
/**
* The Vedic subjunctive. `vidyut-prakriya` currently has poor support for this lakara.
*/
Let:4,"4":"Let",
/**
* Describes commands. Sometimes called the *imperative*.
*/
Lot:5,"5":"Lot",
/**
* Describes past action before the current day. Sometimes called the *imperfect*.
*/
Lan:6,"6":"Lan",
/**
* Describes potential or hypothetical actions. Sometimes called the *optative*.
*/
VidhiLin:7,"7":"VidhiLin",
/**
* Describes wishes and prayers. Sometimes called the *benedictive*.
*/
AshirLin:8,"8":"AshirLin",
/**
* Describes general past action. Sometimes called the *aorist*.
*/
Lun:9,"9":"Lun",
/**
* Describes past counterfactuals ("would not have ..."). Sometimes called the *conditional*.
*/
Lrn:10,"10":"Lrn", });
/**
* The pada of some tinanta or krdanta.
*/
export const DhatuPada = Object.freeze({
/**
* Parasmaipada.
*/
Parasmai:0,"0":"Parasmai",
/**
* Atmanepada.
*/
Atmane:1,"1":"Atmane", });
/**
* The complete list of taddhita-pratyayas.
*
* Rust's naming convention is to start enum values with capital letters. However, we allow mixed
* case explicitly here so that we can name pratyayas more concisely with SLP1. Doing so helps us
* distinguish between pratyayas like `naN` and `nan`.
*/
export const Taddhita = Object.freeze({
/**
* a
*/
a:0,"0":"a",
/**
* -aka
*/
akac:1,"1":"akac",
/**
* -a
*/
ac:2,"2":"ac",
/**
* -aWa
*/
aWac:3,"3":"aWac",
/**
* -a
*/
aR:4,"4":"aR",
/**
* -a
*/
aY:5,"5":"aY",
/**
* -a
*/
at:6,"6":"at",
/**
* -atas
*/
atasuc:7,"7":"atasuc",
/**
* -an
*/
anic:8,"8":"anic",
/**
* -a
*/
ap:9,"9":"ap",
/**
* -as
*/
asic:10,"10":"asic",
/**
* -astAt
*/
astAti:11,"11":"astAti",
/**
* -Akin,
*/
Akinic:12,"12":"Akinic",
/**
* -Ara
*/
Arak:13,"13":"Arak",
/**
* -i
*/
iY:14,"14":"iY",
/**
* -ita
*/
itac:15,"15":"itac",
/**
* -ina
*/
inac:16,"16":"inac",
/**
* -in
*/
ini:17,"17":"ini",
/**
* -iman
*/
imanic:18,"18":"imanic",
/**
* -ila
*/
ila:19,"19":"ila",
/**
* -ila
*/
ilac:20,"20":"ilac",
/**
* -izWa
*/
izWan:21,"21":"izWan",
/**
* -Ika,
*/
Ikak:22,"22":"Ikak",
/**
* -Ika,
*/
Ikan:23,"23":"Ikan",
/**
* -Iyas
*/
Iyasun:24,"24":"Iyasun",
/**
* -eRya
*/
eRya:25,"25":"eRya",
/**
* -Era
*/
Erak:26,"26":"Erak",
/**
* -ka
*/
ka:27,"27":"ka",
/**
* -ka
*/
kak:28,"28":"kak",
/**
* -kawa
*/
kawac:29,"29":"kawac",
/**
* -ka
*/
kan:30,"30":"kan",
/**
* -ka
*/
kap:31,"31":"kap",
/**
* -kalpa
*/
kalpap:32,"32":"kalpap",
/**
* -kftvas
*/
kftvasuc:33,"33":"kftvasuc",
/**
* -kuwAra
*/
kuwArac:34,"34":"kuwArac",
/**
* -kura,
*/
kuRap:35,"35":"kuRap",
/**
* -Ina
*/
Ka:36,"36":"Ka",
/**
* -Ina
*/
KaY:37,"37":"KaY",
/**
* -iya
*/
Ga:38,"38":"Ga",
/**
* -iya
*/
Gac:39,"39":"Gac",
/**
* -iya
*/
Gan:40,"40":"Gan",
/**
* -iya
*/
Gas:41,"41":"Gas",
/**
* -caRa
*/
caRap:42,"42":"caRap",
/**
* -cara
*/
caraw:43,"43":"caraw",
/**
* -cuYcu
*/
cuYcup:44,"44":"cuYcup",
/**
* -Ayana
*/
cPaY:45,"45":"cPaY",
/**
* --
*/
cvi:46,"46":"cvi",
/**
* -Iya
*/
Ca:47,"47":"Ca",
/**
* -Iya,
*/
CaR:48,"48":"CaR",
/**
* -Iya,
*/
Cas:49,"49":"Cas",
/**
* -jAtIya
*/
jAtIyar:50,"50":"jAtIyar",
/**
* -jAha
*/
jAhac:51,"51":"jAhac",
/**
* -a,
*/
Ya:52,"52":"Ya",
/**
* -ika
*/
YiW:53,"53":"YiW",
/**
* -ya
*/
Yya:54,"54":"Yya",
/**
* -ya,
*/
YyaN:55,"55":"YyaN",
/**
* -ya
*/
Yyaw:56,"56":"Yyaw",
/**
* -a
*/
wac:57,"57":"wac",
/**
* -a
*/
waq:58,"58":"waq",
/**
* -iWa
*/
wiWan:59,"59":"wiWan",
/**
* -wIwa
*/
wIwac:60,"60":"wIwac",
/**
* -eRya
*/
weRyaR:61,"61":"weRyaR",
/**
* -ya
*/
wyaR:62,"62":"wyaR",
/**
* -ana
*/
wyu:63,"63":"wyu",
/**
* -ana
*/
wyul:64,"64":"wyul",
/**
* -la
*/
wlaY:65,"65":"wlaY",
/**
* -ika
*/
Wak:66,"66":"Wak",
/**
* -ika
*/
Wac:67,"67":"Wac",
/**
* -ika
*/
WaY:68,"68":"WaY",
/**
* -ika
*/
Wan:69,"69":"Wan",
/**
* -ika
*/
Wap:70,"70":"Wap",
/**
* -a
*/
qaw:71,"71":"qaw",
/**
* -ati
*/
qati:72,"72":"qati",
/**
* -atara
*/
qatarac:73,"73":"qatarac",
/**
* -atama
*/
qatamac:74,"74":"qatamac",
/**
* -pa
*/
qupac:75,"75":"qupac",
/**
* -mat
*/
qmatup:76,"76":"qmatup",
/**
* -ya
*/
qyaR:77,"77":"qyaR",
/**
* -vala
*/
qvalac:78,"78":"qvalac",
/**
* -aka
*/
qvun:79,"79":"qvun",
/**
* -eya
*/
Qak:80,"80":"Qak",
/**
* -eyaka
*/
QakaY:81,"81":"QakaY",
/**
* -eya
*/
Qa:82,"82":"Qa",
/**
* -eya
*/
QaY:83,"83":"QaY",
/**
* -eyin
*/
Qinuk:84,"84":"Qinuk",
/**
* -era
*/
Qrak:85,"85":"Qrak",
/**
* -a
*/
Ra:86,"86":"Ra",
/**
* -in
*/
Rini:87,"87":"Rini",
/**
* -ya
*/
Rya:88,"88":"Rya",
/**
* -tama
*/
tamap:89,"89":"tamap",
/**
* -taya
*/
tayap:90,"90":"tayap",
/**
* -tara
*/
tarap:91,"91":"tarap",
/**
* -ta (becomes -tA)
*/
tal:92,"92":"tal",
/**
* -tas
*/
tasi:93,"93":"tasi",
/**
* -tas
*/
tasil:94,"94":"tasil",
/**
* -ti
*/
ti:95,"95":"ti",
/**
* -tika
*/
tikan:96,"96":"tikan",
/**
* -tIya
*/
tIya:97,"97":"tIya",
/**
* -tya
*/
tyak:98,"98":"tyak",
/**
* -tyaka
*/
tyakan:99,"99":"tyakan",
/**
* -tya
*/
tyap:100,"100":"tyap",
/**
* -tana
*/
tyu:101,"101":"tyu",
/**
* -tana
*/
tyul:102,"102":"tyul",
/**
* -tra
*/
tral:103,"103":"tral",
/**
* -trA
*/
trA:104,"104":"trA",
/**
* -tva
*/
tva:105,"105":"tva",
/**
* -Tam
*/
Tamu:106,"106":"Tamu",
/**
* -Tya
*/
Tyan:107,"107":"Tyan",
/**
* -TA
*/
TAl:108,"108":"TAl",
/**
* -daGna
*/
daGnac:109,"109":"daGnac",
/**
* -dA
*/
dA:110,"110":"dA",
/**
* -dAnIm
*/
dAnIm:111,"111":"dAnIm",
/**
* -deSya
*/
deSya:112,"112":"deSya",
/**
* -deSIya
*/
deSIyar:113,"113":"deSIyar",
/**
* -dvayasa
*/
dvayasac:114,"114":"dvayasac",
/**
* -dhA
*/
DA:115,"115":"DA",
/**
* -na
*/
na:116,"116":"na",
/**
* -na
*/
naY:117,"117":"naY",
/**
* -nAwa
*/
nAwac:118,"118":"nAwac",
/**
* -Ayana
*/
Pak:119,"119":"Pak",
/**
* -Ayana
*/
PaY:120,"120":"PaY",
/**
* -Ayani
*/
PiY:121,"121":"PiY",
/**
* -bahu
*/
bahuc:122,"122":"bahuc",
/**
* -biqa
*/
biqac:123,"123":"biqac",
/**
* -birIsa
*/
birIsac:124,"124":"birIsac",
/**
* -Bakta
*/
Baktal:125,"125":"Baktal",
/**
* -Brawa
*/
Brawac:126,"126":"Brawac",
/**
* -ma
*/
ma:127,"127":"ma",
/**
* -mat
*/
matup:128,"128":"matup",
/**
* -ma
*/
map:129,"129":"map",
/**
* -maya
*/
mayaw:130,"130":"mayaw",
/**
* -mAtra
*/
mAtrac:131,"131":"mAtrac",
/**
* -pASa
*/
pASap:132,"132":"pASap",
/**
* -piwa
*/
piwac:133,"133":"piwac",
/**
* -ya
*/
ya:134,"134":"ya",
/**
* -ya
*/
yak:135,"135":"yak",
/**
* -ya
*/
yaY:136,"136":"yaY",
/**
* -ya
*/
yat:137,"137":"yat",
/**
* -ya
*/
yan:138,"138":"yan",
/**
* -yu
*/
yus:139,"139":"yus",
/**
* -ra
*/
ra:140,"140":"ra",
/**
* -rUpa
*/
rUpap:141,"141":"rUpap",
/**
* -rhi
*/
rhil:142,"142":"rhil",
/**
* -rUpya
*/
rUpya:143,"143":"rUpya",
/**
* -la
*/
lac:144,"144":"lac",
/**
* -vat
*/
vatup:145,"145":"vatup",
/**
* -vaya
*/
vaya:146,"146":"vaya",
/**
* -vala
*/
valac:147,"147":"valac",
/**
* -vin
*/
vini:148,"148":"vini",
/**
* -viDu
*/
viDal:149,"149":"viDal",
/**
* -aka
*/
vuk:150,"150":"vuk",
/**
* -aka
*/
vuY:151,"151":"vuY",
/**
* -aka
*/
vun:152,"152":"vun",
/**
* -vya
*/
vyat:153,"153":"vyat",
/**
* -vya
*/
vyan:154,"154":"vyan",
/**
* -Sa
*/
Sa:155,"155":"Sa",
/**
* -SaNkawa
*/
SaNkawac:156,"156":"SaNkawac",
/**
* -SAla
*/
SAlac:157,"157":"SAlac",
/**
* -Sas
*/
Sas:158,"158":"Sas",
/**
* -za
*/
za:159,"159":"za",
/**
* -ka
*/
zkan:160,"160":"zkan",
/**
* -tra
*/
zwarac:161,"161":"zwarac",
/**
* -ika
*/
zWac:162,"162":"zWac",
/**
* -ika
*/
zWan:163,"163":"zWan",
/**
* -ika
*/
zWal:164,"164":"zWal",
/**
* Ayana
*/
zPak:165,"165":"zPak",
/**
* -sa
*/
sa:166,"166":"sa",
/**
* -sna
*/
sna:167,"167":"sna",
/**
* -sAt
*/
sAti:168,"168":"sAti",
/**
* -s
*/
suc:169,"169":"suc",
/**
* -sna
*/
snaY:170,"170":"snaY",
/**
* -ha
*/
ha:171,"171":"ha", });
/**
* WebAssembly API for vidyut-prakriya.
*
* Within reason, we have tried to mimic a native JavaScript API. At some point, we wish to
* support optional arguments, perhaps by using `Reflect`.
*/
export class Vidyut {

    static __wrap(ptr) {
        const obj = Object.create(Vidyut.prototype);
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
        wasm.__wbg_vidyut_free(ptr);
    }
    /**
    * Creates a new API manager.
    *
    * This constructor is not called `new` because `new` is a reserved word in JavaScript.
    * @param {string} dhatupatha
    * @returns {Vidyut}
    */
    static init(dhatupatha) {
        const ptr0 = passStringToWasm0(dhatupatha, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.vidyut_init(ptr0, len0);
        return Vidyut.__wrap(ret);
    }
    /**
    * Wrapper for `Vyakarana::derive_tinantas`.
    *
    * TODO: how might we reduce the number of arguments here?
    * @param {string} code
    * @param {number} lakara
    * @param {number} prayoga
    * @param {number} purusha
    * @param {number} vacana
    * @param {number | undefined} pada
    * @param {number | undefined} sanadi
    * @param {string | undefined} upasarga
    * @returns {any}
    */
    deriveTinantas(code, lakara, prayoga, purusha, vacana, pada, sanadi, upasarga) {
        const ptr0 = passStringToWasm0(code, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(upasarga) ? 0 : passStringToWasm0(upasarga, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        const ret = wasm.vidyut_deriveTinantas(this.ptr, ptr0, len0, lakara, prayoga, purusha, vacana, isLikeNone(pada) ? 2 : pada, isLikeNone(sanadi) ? 7 : sanadi, ptr1, len1);
        return takeObject(ret);
    }
    /**
    * Wrapper for `Vyakarana::derive_subantas`.
    * @param {string} pratipadika
    * @param {number} linga
    * @param {number} vibhakti
    * @param {number} vacana
    * @returns {any}
    */
    deriveSubantas(pratipadika, linga, vibhakti, vacana) {
        const ptr0 = passStringToWasm0(pratipadika, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.vidyut_deriveSubantas(this.ptr, ptr0, len0, linga, vibhakti, vacana);
        return takeObject(ret);
    }
    /**
    * Wrapper for `Vyakarana::derive_krdantas`.
    * @param {string} code
    * @param {number} krt
    * @param {number | undefined} sanadi
    * @param {string | undefined} upasarga
    * @returns {any}
    */
    deriveKrdantas(code, krt, sanadi, upasarga) {
        const ptr0 = passStringToWasm0(code, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(upasarga) ? 0 : passStringToWasm0(upasarga, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        const ret = wasm.vidyut_deriveKrdantas(this.ptr, ptr0, len0, krt, isLikeNone(sanadi) ? 7 : sanadi, ptr1, len1);
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
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbg_error_51d875a0547f9e36 = function(arg0, arg1) {
        console.error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_20cbc34131e76824 = function(arg0, arg1, arg2) {
        getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
    };
    imports.wbg.__wbg_new_b525de17f44a8943 = function() {
        const ret = new Array();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_f9876326328f45ed = function() {
        const ret = new Object();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_17224bc548dd1d7b = function(arg0, arg1, arg2) {
        getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
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
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        const ret = debugString(getObject(arg1));
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
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
        input = new URL('vidyut_prakriya_bg.wasm', import.meta.url);
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
