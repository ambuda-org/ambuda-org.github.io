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
* One of the three common *sanAdi* pratyayas.
*
* The *sanAdi* pratyayas create new dhatus per 3.1.32. They are introduced in rules 3.1.7 -
* 3.1.30, and since rule 3.1.7 contains the word "dhAtoH", they can be called Ardhadhatuka by
* 3.4.114.
*
* Of the sanAdi pratyayas, most are added after either subantas or a handful of dhatus. But
* three of these pratyayas are added after dhatus more generally: `san`, `yaN`, and `Ric`.
*
* For details on what these pratyayas mean and what kinds of words they produce, see the comments
* below.
*/
export const Sanadi = Object.freeze({
/**
* `kAmyac`, which creates nAma-dhAtus per 3.1.9.
*/
kAmyac:0,"0":"kAmyac",
/**
* `kyaN`, which creates nAma-dhAtus per 3.1.11.
*/
kyaN:1,"1":"kyaN",
/**
* `kyac`, which creates nAma-dhAtus per 3.1.8.
*/
kyac:2,"2":"kyac",
/**
* `Nic`, which creates causal roots per 3.1.26.
*
* Examples: BAvayati, nAyayati.
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
* `yaN`, with elision per 2.4.74. This is often listed separately due to its rarity and its
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
* -aknu
*/
aknuc:0,"0":"aknuc",
/**
* -aNga
*/
aNgac:1,"1":"aNgac",
/**
* -adAnu
*/
radAnuk:2,"2":"radAnuk",
/**
* -a
*/
ac:3,"3":"ac",
/**
* -aji
*/
aji:4,"4":"aji",
/**
* -awa
*/
awan:5,"5":"awan",
/**
* -awi
*/
awi:6,"6":"awi",
/**
* -aWa
*/
aWa:7,"7":"aWa",
/**
* -aRqa
*/
aRqan:8,"8":"aRqan",
/**
* -ata
*/
atac:9,"9":"atac",
/**
* -at
*/
ati:10,"10":"ati",
/**
* -ati
*/
ati_:11,"11":"ati_",
/**
* -atra
*/
atran:12,"12":"atran",
/**
* -atri
*/
atrin:13,"13":"atrin",
/**
* -aTa
*/
aTa:14,"14":"aTa",
/**
* -adi
*/
adi:15,"15":"adi",
/**
* -a
*/
an:16,"16":"an",
/**
* -ani
*/
ani:17,"17":"ani",
/**
* -anu
*/
anuN:18,"18":"anuN",
/**
* -anya
*/
anya:19,"19":"anya",
/**
* -anyu
*/
anyuc:20,"20":"anyuc",
/**
* -apa
*/
apa:21,"21":"apa",
/**
* -abaka
*/
abaka:22,"22":"abaka",
/**
* -aba
*/
abac:23,"23":"abac",
/**
* -aBa
*/
aBac:24,"24":"aBac",
/**
* -ama
*/
ama:25,"25":"ama",
/**
* -ama (praTama)
*/
amac:26,"26":"amac",
/**
* -amba
*/
ambaj:27,"27":"ambaj",
/**
* -ayu
*/
ayu:28,"28":"ayu",
/**
* -ara
*/
ara:29,"29":"ara",
/**
* -ara
*/
aran:30,"30":"aran",
/**
* -aru
*/
aru:31,"31":"aru",
/**
* -a
*/
al:32,"32":"al",
/**
* -ala (maNgala)
*/
alac:33,"33":"alac",
/**
* -ali
*/
alic:34,"34":"alic",
/**
* -avi
*/
avi:35,"35":"avi",
/**
* -a
*/
asa:36,"36":"asa",
/**
* -asa
*/
asac:37,"37":"asac",
/**
* -asAna
*/
asAnac:38,"38":"asAnac",
/**
* -asi
*/
asi:39,"39":"asi",
/**
* -as (cetas)
*/
asun:40,"40":"asun",
/**
* -A
*/
A:41,"41":"A",
/**
* -Aka
*/
Aka:42,"42":"Aka",
/**
* -AgU
*/
AgUc:43,"43":"AgUc",
/**
* -Awa
*/
Awac:44,"44":"Awac",
/**
* -ARaka
*/
ARaka:45,"45":"ARaka",
/**
* -Atu
*/
Atu:46,"46":"Atu",
/**
* -Atfka
*/
Atfkan:47,"47":"Atfkan",
/**
* -Anaka
*/
Anaka:48,"48":"Anaka",
/**
* -Ana
*/
Anac:49,"49":"Anac",
/**
* -Anu
*/
Anuk:50,"50":"Anuk",
/**
* -Anya
*/
Anya:51,"51":"Anya",
/**
* -Ayya
*/
Ayya:52,"52":"Ayya",
/**
* -Ara
*/
Aran:53,"53":"Aran",
/**
* -Ala
*/
Ala:54,"54":"Ala",
/**
* -Ala
*/
Alac:55,"55":"Alac",
/**
* -Ala
*/
AlaY:56,"56":"AlaY",
/**
* -AlIya
*/
AlIyac:57,"57":"AlIyac",
/**
* -A
*/
Asa:58,"58":"Asa",
/**
* -Asi
*/
Asi:59,"59":"Asi",
/**
* -i
*/
i:60,"60":"i",
/**
* -ika
*/
ikan:61,"61":"ikan",
/**
* -iji
*/
iji:62,"62":"iji",
/**
* -i
*/
iY:63,"63":"iY",
/**
* -i
*/
iR:64,"64":"iR",
/**
* -ita
*/
ita:65,"65":"ita",
/**
* -ita
*/
itac:66,"66":"itac",
/**
* -ita
*/
itan:67,"67":"itan",
/**
* -iti
*/
iti:68,"68":"iti",
/**
* -itnu
*/
itnuc:69,"69":"itnuc",
/**
* -itra
*/
itra:70,"70":"itra",
/**
* -itva
*/
itvan:71,"71":"itvan",
/**
* -iTi
*/
iTin:72,"72":"iTin",
/**
* -i
*/
in_:73,"73":"in_",
/**
* -ina
*/
inac:74,"74":"inac",
/**
* -ina
*/
inaR:75,"75":"inaR",
/**
* -ina
*/
inan:76,"76":"inan",
/**
* -in
*/
ini:77,"77":"ini",
/**
* -imani
*/
imanic:78,"78":"imanic",
/**
* -imani
*/
imanin:79,"79":"imanin",
/**
* -ila
*/
ilac:80,"80":"ilac",
/**
* -izWa
*/
izWac:81,"81":"izWac",
/**
* -izWu
*/
izWuc:82,"82":"izWuc",
/**
* -izRu
*/
izRuc:83,"83":"izRuc",
/**
* -isa
*/
isan:84,"84":"isan",
/**
* -is
*/
isi:85,"85":"isi",
/**
* -is
*/
isin:86,"86":"isin",
/**
* -I
*/
I:87,"87":"I",
/**
* -Ika
*/
Ikan:88,"88":"Ikan",
/**
* -Ici
*/
Ici:89,"89":"Ici",
/**
* -Ida
*/
Ida:90,"90":"Ida",
/**
* -Ira
*/
Irac:91,"91":"Irac",
/**
* -Ira
*/
Iran:92,"92":"Iran",
/**
* -Iza
*/
Izan:93,"93":"Izan",
/**
* -u
*/
u:94,"94":"u",
/**
* -uka
*/
ukan:95,"95":"ukan",
/**
* -uqa
*/
uqac:96,"96":"uqac",
/**
* -u
*/
uR:97,"97":"uR",
/**
* -uti
*/
uti:98,"98":"uti",
/**
* -utra
*/
utra:99,"99":"utra",
/**
* -una
*/
una:100,"100":"una",
/**
* -una
*/
unan:101,"101":"unan",
/**
* -unasi
*/
unasi:102,"102":"unasi",
/**
* -uni
*/
uni:103,"103":"uni",
/**
* -unta
*/
unta:104,"104":"unta",
/**
* -unti
*/
unti:105,"105":"unti",
/**
* -uma
*/
uma:106,"106":"uma",
/**
* -umBa
*/
umBa:107,"107":"umBa",
/**
* -ura
*/
urac:108,"108":"urac",
/**
* -ura
*/
uran:109,"109":"uran",
/**
* -uri
*/
urin:110,"110":"urin",
/**
* -ula
*/
ulac:111,"111":"ulac",
/**
* -uli
*/
uli:112,"112":"uli",
/**
* -uza
*/
uzac:113,"113":"uzac",
/**
* -us (Danus)
*/
usi:114,"114":"usi",
/**
* -U
*/
U:115,"115":"U",
/**
* -Uka
*/
Uka:116,"116":"Uka",
/**
* -Uka
*/
UkaR:117,"117":"UkaR",
/**
* -UKa
*/
UKa:118,"118":"UKa",
/**
* -UTa
*/
UTan:119,"119":"UTan",
/**
* -Uma
*/
Uma:120,"120":"Uma",
/**
* -U
*/
Ur:121,"121":"Ur",
/**
* -Ura
*/
Uran:122,"122":"Uran",
/**
* -Uza
*/
Uzan:123,"123":"Uzan",
/**
* -f
*/
f:124,"124":"f",
/**
* -fti
*/
ftin:125,"125":"ftin",
/**
* -f
*/
fn_:126,"126":"fn_",
/**
* -eRu
*/
eRu:127,"127":"eRu",
/**
* -eRya
*/
eRya:128,"128":"eRya",
/**
* -era
*/
erak:129,"129":"erak",
/**
* -elima
*/
elimac:130,"130":"elimac",
/**
* -ota
*/
otac:131,"131":"otac",
/**
* -ora
*/
oran:132,"132":"oran",
/**
* -ola
*/
olac:133,"133":"olac",
/**
* -ka
*/
ka:134,"134":"ka",
/**
* -ka
*/
kak:135,"135":"kak",
/**
* -kaNkaRa
*/
kaNkaRa:136,"136":"kaNkaRa",
/**
* -kaRa
*/
kaRa:137,"137":"kaRa",
/**
* -katu
*/
katu:138,"138":"katu",
/**
* -katni
*/
katnic:139,"139":"katnic",
/**
* -katra
*/
katra:140,"140":"katra",
/**
* -kTa
*/
kTan:141,"141":"kTan",
/**
* -ka
*/
kan:142,"142":"kan",
/**
* -kanasi
*/
kanasi:143,"143":"kanasi",
/**
* -kani
*/
kanin:144,"144":"kanin",
/**
* -kanu
*/
kanum:145,"145":"kanum",
/**
* -kanya
*/
kanyan:146,"146":"kanyan",
/**
* -kanyu
*/
kanyuc:147,"147":"kanyuc",
/**
* -kapa
*/
kapa:148,"148":"kapa",
/**
* -kapa
*/
kapan:149,"149":"kapan",
/**
* -kami
*/
kamin:150,"150":"kamin",
/**
* -kaya
*/
kayan:151,"151":"kayan",
/**
* -kara
*/
karan:152,"152":"karan",
/**
* -kala
*/
kala:153,"153":"kala",
/**
* -kAku
*/
kAku:154,"154":"kAku",
/**
* -kAla
*/
kAlan:155,"155":"kAlan",
/**
* -kika
*/
kikan:156,"156":"kikan",
/**
* -kita
*/
kitac:157,"157":"kitac",
/**
* -kinda
*/
kindac:158,"158":"kindac",
/**
* -kira
*/
kirac:159,"159":"kirac",
/**
* -kizya
*/
kizyan:160,"160":"kizyan",
/**
* -kIka
*/
kIkac:161,"161":"kIkac",
/**
* -kIka
*/
kIkan:162,"162":"kIkan",
/**
* -kIwa
*/
kIwan:163,"163":"kIwan",
/**
* -ku
*/
ku:164,"164":"ku",
/**
* -ku
*/
kuk:165,"165":"kuk",
/**
* -kuka
*/
kukan:166,"166":"kukan",
/**
* -kuza
*/
kuzan:167,"167":"kuzan",
/**
* -kU
*/
kU:168,"168":"kU",
/**
* -kta
*/
kta:169,"169":"kta",
/**
* -ktnu
*/
ktnu:170,"170":"ktnu",
/**
* -ktra
*/
ktra:171,"171":"ktra",
/**
* -kTi
*/
kTin:172,"172":"kTin",
/**
* -kna
*/
kna:173,"173":"kna",
/**
* -kni
*/
knin:174,"174":"knin",
/**
* -kmala
*/
kmalan:175,"175":"kmalan",
/**
* -kyu
*/
kyu:176,"176":"kyu",
/**
* -kyu
*/
kyun:177,"177":"kyun",
/**
* -kra
*/
kran:178,"178":"kran",
/**
* -krara
*/
kraran:179,"179":"kraran",
/**
* -kri
*/
kri:180,"180":"kri",
/**
* -kri
*/
krin:181,"181":"krin",
/**
* -kruka
*/
krukan:182,"182":"krukan",
/**
* -kru
*/
krun:183,"183":"krun",
/**
* -kla
*/
kla:184,"184":"kla",
/**
* -kva
*/
kvan:185,"185":"kvan",
/**
* -kvani
*/
kvanip:186,"186":"kvanip",
/**
* -kvi
*/
kvin:187,"187":"kvin",
/**
* -kvi
*/
kvip:188,"188":"kvip",
/**
* -kvu
*/
kvun:189,"189":"kvun",
/**
* -ksara
*/
ksaran:190,"190":"ksaran",
/**
* -ksi
*/
ksi:191,"191":"ksi",
/**
* -ksu
*/
ksu:192,"192":"ksu",
/**
* -kseyya
*/
kseyya:193,"193":"kseyya",
/**
* -ksna
*/
ksna:194,"194":"ksna",
/**
* -Ka
*/
Ka:195,"195":"Ka",
/**
* -ga
*/
ga:196,"196":"ga",
/**
* -ga
*/
gak:197,"197":"gak",
/**
* -ga
*/
gaR:198,"198":"gaR",
/**
* -ga
*/
gan:199,"199":"gan",
/**
* -GaTi
*/
GaTin:200,"200":"GaTin",
/**
* -ca
*/
caw:201,"201":"caw",
/**
* -catu
*/
catu:202,"202":"catu",
/**
* -ci
*/
cik:203,"203":"cik",
/**
* -Ja
*/
Jac:204,"204":"Jac",
/**
* -Ji
*/
Jic:205,"205":"Jic",
/**
* -Yu
*/
YuR:206,"206":"YuR",
/**
* -wa
*/
wa:207,"207":"wa",
/**
* -wa
*/
wan:208,"208":"wan",
/**
* -wiza
*/
wizac:209,"209":"wizac",
/**
* -Wa
*/
Wa:210,"210":"Wa",
/**
* -qa
*/
qa:211,"211":"qa",
/**
* -qau
*/
qau:212,"212":"qau",
/**
* -qa
*/
qaw:213,"213":"qaw",
/**
* -qati
*/
qati:214,"214":"qati",
/**
* -avat
*/
qavatu:215,"215":"qavatu",
/**
* -qimi
*/
qimi:216,"216":"qimi",
/**
* -quta
*/
qutac:217,"217":"qutac",
/**
* -qu
*/
qun:218,"218":"qun",
/**
* -qumsu
*/
qumsun:219,"219":"qumsun",
/**
* -qU
*/
qU:220,"220":"qU",
/**
* -qE
*/
qE:221,"221":"qE",
/**
* -Es
*/
qEsi:222,"222":"qEsi",
/**
* -qo
*/
qo:223,"223":"qo",
/**
* -qosi
*/
qosi:224,"224":"qosi",
/**
* -qO
*/
qO:225,"225":"qO",
/**
* -qri
*/
qri:226,"226":"qri",
/**
* -Qa
*/
Qa:227,"227":"Qa",
/**
* -Ritra
*/
Ritran:228,"228":"Ritran",
/**
* -Ru
*/
Ru:229,"229":"Ru",
/**
* -Ruka
*/
Rukan:230,"230":"Rukan",
/**
* -ta
*/
ta:231,"231":"ta",
/**
* -taka
*/
takan:232,"232":"takan",
/**
* -ta
*/
tan:233,"233":"tan",
/**
* -tana
*/
tanan:234,"234":"tanan",
/**
* -taSa
*/
taSan:235,"235":"taSan",
/**
* -taSasu
*/
taSasun:236,"236":"taSasun",
/**
* -ti
*/
ti:237,"237":"ti",
/**
* -tika
*/
tikan:238,"238":"tikan",
/**
* -tu
*/
tu:239,"239":"tu",
/**
* -tu
*/
tun:240,"240":"tun",
/**
* -tf
*/
tfc:241,"241":"tfc",
/**
* -tf
*/
tfn:242,"242":"tfn",
/**
* -tna
*/
tnaR:243,"243":"tnaR",
/**
* -tyu
*/
tyuk:244,"244":"tyuk",
/**
* -tra
*/
tra:245,"245":"tra",
/**
* -tra
*/
tran:246,"246":"tran",
/**
* -tri
*/
trin:247,"247":"trin",
/**
* -tri
*/
trip:248,"248":"trip",
/**
* -tva
*/
tvan:249,"249":"tvan",
/**
* -Ta
*/
Tak:250,"250":"Tak",
/**
* -da
*/
da:251,"251":"da",
/**
* -da
*/
dan:252,"252":"dan",
/**
* -Du
*/
Duk:253,"253":"Duk",
/**
* -na
*/
na:254,"254":"na",
/**
* -na
*/
nak:255,"255":"nak",
/**
* -ni
*/
ni:256,"256":"ni",
/**
* -nu
*/
nu:257,"257":"nu",
/**
* -pa
*/
pa:258,"258":"pa",
/**
* -pAsa
*/
pAsa:259,"259":"pAsa",
/**
* -Pa
*/
Pak:260,"260":"Pak",
/**
* -ba
*/
ban:261,"261":"ban",
/**
* -Ba
*/
Ba:262,"262":"Ba",
/**
* -Ba
*/
Ban:263,"263":"Ban",
/**
* -ma
*/
mak:264,"264":"mak",
/**
* -madi
*/
madik:265,"265":"madik",
/**
* -ma
*/
man:266,"266":"man",
/**
* -man
*/
mani:267,"267":"mani",
/**
* -man
*/
maniR:268,"268":"maniR",
/**
* -man
*/
manin:269,"269":"manin",
/**
* -mi
*/
mi:270,"270":"mi",
/**
* -mi
*/
min:271,"271":"min",
/**
* -mu
*/
muk:272,"272":"muk",
/**
* -ya
*/
ya:273,"273":"ya",
/**
* -ya
*/
yak:274,"274":"yak",
/**
* -ya
*/
yat:275,"275":"yat",
/**
* -yatu
*/
yatuc:276,"276":"yatuc",
/**
* -yu
*/
yuk:277,"277":"yuk",
/**
* -yu
*/
yuc:278,"278":"yuc",
/**
* -yu
*/
yun:279,"279":"yun",
/**
* -ra
*/
ra:280,"280":"ra",
/**
* -ra
*/
rak:281,"281":"rak",
/**
* -ra
*/
ran:282,"282":"ran",
/**
* -ru
*/
ru:283,"283":"ru",
/**
* -la
*/
lak:284,"284":"lak",
/**
* -va
*/
va:285,"285":"va",
/**
* -va
*/
vaR:286,"286":"vaR",
/**
* -va
*/
van:287,"287":"van",
/**
* -vani
*/
vanip:288,"288":"vanip",
/**
* -vara
*/
varaw:289,"289":"varaw",
/**
* -vala
*/
valaY:290,"290":"valaY",
/**
* -vAla
*/
vAlac:291,"291":"vAlac",
/**
* -vAla
*/
vAlan:292,"292":"vAlan",
/**
* -vi
*/
vin:293,"293":"vin",
/**
* -vu
*/
vun:294,"294":"vun",
/**
* -Sa
*/
Sak:295,"295":"Sak",
/**
* -Su
*/
Sun:296,"296":"Sun",
/**
* -Sva
*/
SvaR:297,"297":"SvaR",
/**
* -ziva
*/
zivan:298,"298":"zivan",
/**
* -zwra
*/
zwran:299,"299":"zwran",
/**
* -zvara
*/
zvarac:300,"300":"zvarac",
/**
* -sa
*/
sa:301,"301":"sa",
/**
* -sa
*/
san:302,"302":"san",
/**
* -sara
*/
sara:303,"303":"sara",
/**
* -sika
*/
sikan:304,"304":"sikan",
/**
* -sTa
*/
sTan:305,"305":"sTan",
/**
* -sma
*/
sman:306,"306":"sman",
/**
* -sya
*/
sya:307,"307":"sya",
/**
* -sya
*/
syan:308,"308":"syan", });
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
