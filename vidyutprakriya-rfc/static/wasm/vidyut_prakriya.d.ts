/* tslint:disable */
/* eslint-disable */
/**
 * Defines an *antargaṇa*.
 *
 * The dhatus in the Dhatupatha are organized in ten large *gaṇa*s or classes. Within these larger
 * *gaṇa*s, certain *antargaṇa*s or subclasses have extra properties that affect the derivations
 * they produce. For example, dhatus in the *kuṭādi antargaṇa* generally do not allow *guṇa* vowel
 * changes.
 *
 * Since most dhatus appear exactly once per *gaṇa*, this crate can usually infer whether a dhatu
 * is in a specific *antargaṇa*. However, some *gaṇa*s have dhatus that repeat, and these
 * repeating dhatus cause ambiguities for our code. (For example, `juqa~` appears twice in
 * *tudādigaṇa*: once in *kuṭādi* and once outside of it.)
 *
 * To avoid this ambiguity, we require that certain *antargaṇa*s are declared up-front.
 *
 * (Can we disambiguate by checking the dhatu's index within its gana? Unfortunately, no. There is
 * no canonical version of the Dhatupatha, and we cannot expect that a dhatu's index is consistent
 * across all of these versions. So we thought it better to avoid hard-coding indices or requiring
 * callers to follow our specific conventions.)
 */
export enum Antargana {
  /**
   * *Antargaṇa* of *bhū* gana. A dhatu in this *antargaṇa* uses a shortened vowel when
   * followed by *ṇic-pratyaya*.
   */
  Ghatadi = 0,
  /**
   * *Antargaṇa* of *tud* gana. Pratyayas that follow dhatus in *kuṭādi-gaṇa* will generally be
   * marked `Nit` per 1.2.1. Required because of duplicates like `juqa~`.
   */
  Kutadi = 1,
  /**
   * *Antargaṇa* of *cur* gana ending with `zvada~` / `svAda~`. A dhatu in this *antargaṇa*
   * optionaly uses *ṇic-pratyaya* when taking an object. Required because of duplicates like
   * `tuji~`.
   */
  Asvadiya = 2,
  /**
   * *Antargaṇa* of *cur* gana ending with `Dfza~`. A dhatu in this *antargaṇa* optionally uses
   * *ṇic-pratyaya*. Required because of duplicates like `SraTa~`.
   */
  Adhrshiya = 3,
  /**
   * *Antargaṇa* of *cur* gana ending with `kusma~`. A dhatu in this *antargaṇa* is always
   * *ātmanepadī*. Required because of duplicates like `daSi~`.
   */
  Akusmiya = 4,
}
/**
 * The complete list of ordinary *kṛt pratyaya*s.
 *
 * Rust's naming convention is to start enum values with capital letters. However, we allow mixed
 * case explicitly here so that we can name pratyayas more concisely with SLP1. Doing so helps us
 * distinguish between pratyayas like `naN` and `nan`.
 */
export enum BaseKrt {
  /**
   * -a
   */
  a = 0,
  /**
   * -a,
   */
  aN = 1,
  /**
   * -a
   */
  ac = 2,
  /**
   * -a
   */
  aR = 3,
  /**
   * -aDyE
   */
  aDyE = 4,
  /**
   * -aDyE
   */
  aDyEn = 5,
  /**
   * -at (jarat)
   */
  atfn = 6,
  /**
   * -aTu (vepaTu). Allowed only for dhatus that are `qvit`.
   */
  aTuc = 7,
  /**
   * -ani
   */
  ani = 8,
  /**
   * -anIya (gamanIya, BavanIya, ...)
   */
  anIyar = 9,
  /**
   * -a
   */
  ap = 10,
  /**
   * -ase
   */
  ase = 11,
  /**
   * -ase
   */
  asen = 12,
  /**
   * -Alu
   */
  Aluc = 13,
  /**
   * -Aru
   */
  Aru = 14,
  /**
   * -ika
   */
  ika = 15,
  /**
   * -ikavaka
   */
  ikavaka = 16,
  /**
   * -i
   */
  iY = 17,
  /**
   * -itra
   */
  itra = 18,
  /**
   * -in. The trailing `_` is to avoid colliding with Rust's `in` keyword.
   */
  in_ = 19,
  /**
   * -in
   */
  ini = 20,
  /**
   * -izRu (alaMkarizRu, prajanizRu, ...)
   */
  izRuc = 21,
  /**
   * -u (yuyutsu, Bikzu, ...)
   */
  u = 22,
  /**
   * -uka
   */
  ukaY = 23,
  /**
   * -Uka
   */
  Uka = 24,
  /**
   * -a
   */
  ka = 25,
  /**
   * -a
   */
  kaY = 26,
  /**
   * -aDyE
   */
  kaDyE = 27,
  /**
   * -aDyE
   */
  kaDyEn = 28,
  /**
   * -am
   */
  kamul = 29,
  /**
   * -as (visfpaH, ...)
   */
  kasun = 30,
  /**
   * -a
   */
  kap = 31,
  /**
   * -ase
   */
  kase = 32,
  /**
   * -ase
   */
  kasen = 33,
  /**
   * -Ana (cakrARa, ...)
   */
  kAnac = 34,
  /**
   * -i (udaDi, ...)
   */
  ki = 35,
  /**
   * -i
   */
  kin = 36,
  /**
   * -ura (BaNgura, ...)
   */
  kurac = 37,
  /**
   * -elima (pacelima, ...)
   */
  kelimar = 38,
  /**
   * -ta (gata, bhUta, ...)
   */
  kta = 39,
  /**
   * -tavat (gatavat, bhUtavat, ...)
   */
  ktavatu = 40,
  /**
   * -ti
   */
  ktic = 41,
  /**
   * -ti
   */
  ktin = 42,
  /**
   * -tri
   */
  ktri = 43,
  /**
   * -tvA (gatvA, bhUtva, ...)
   */
  ktvA = 44,
  /**
   * -nu
   */
  knu = 45,
  /**
   * -mara
   */
  kmarac = 46,
  /**
   * -ya
   */
  kyap = 47,
  /**
   * -ru (BIru)
   */
  kru = 48,
  /**
   * -ruka (BIruka)
   */
  krukan = 49,
  /**
   * -luka (BIluka)
   */
  klukan = 50,
  /**
   * -van
   */
  kvanip = 51,
  /**
   * -vara
   */
  kvarap = 52,
  /**
   * -vas
   */
  kvasu = 53,
  /**
   * -snu (glAsnu, jizRu, ...)
   */
  ksnu = 54,
  /**
   * (empty suffix)
   */
  kvin = 55,
  /**
   * (empty suffix)
   */
  kvip = 56,
  /**
   * -a (priyaMvada, vaSaMvada)
   */
  Kac = 57,
  /**
   * -a
   */
  KaS = 58,
  /**
   * -a (Izatkara, duzkara, sukara, ...)
   */
  Kal = 59,
  /**
   * -izRu
   */
  KizRuc = 60,
  /**
   * -uka
   */
  KukaY = 61,
  /**
   * -ana
   */
  Kyun = 62,
  /**
   * -a
   */
  Ga = 63,
  /**
   * -a
   */
  GaY = 64,
  /**
   * -in
   */
  GinuR = 65,
  /**
   * -ura
   */
  Gurac = 66,
  /**
   * -van
   */
  Nvanip = 67,
  /**
   * -Ana
   */
  cAnaS = 68,
  /**
   * -ana
   */
  Yyuw = 69,
  /**
   * -a
   */
  wa = 70,
  /**
   * -a
   */
  wak = 71,
  /**
   * -a
   */
  qa = 72,
  /**
   * -ara,
   */
  qara = 73,
  /**
   * -u
   */
  qu = 74,
  /**
   * -a
   */
  Ra = 75,
  /**
   * -am
   */
  Ramul = 76,
  /**
   * -in
   */
  Rini = 77,
  /**
   * -ya
   */
  Ryat = 78,
  /**
   * -ana
   */
  Ryuw = 79,
  /**
   * (empty)
   */
  Rvi = 80,
  /**
   * -aka
   */
  Rvuc = 81,
  /**
   * -aka
   */
  Rvul = 82,
  /**
   * -tave
   */
  taveN = 83,
  /**
   * -tave
   */
  taven = 84,
  /**
   * -tavE
   */
  tavE = 85,
  /**
   * -tavya (gantavya, bhavitavya, ...)
   */
  tavya = 86,
  /**
   * -tavya
   */
  tavyat = 87,
  /**
   * -tum (gantum, bhavitum, ...)
   */
  tumun = 88,
  /**
   * -tf (gantA, bhavitA, ...)
   */
  tfc = 89,
  /**
   * -tf
   */
  tfn = 90,
  /**
   * -tos (udetoH)
   */
  tosun = 91,
  /**
   * -Taka (gATaka)
   */
  Takan = 92,
  /**
   * -na
   */
  naN = 93,
  /**
   * -naj
   */
  najiN = 94,
  /**
   * -na (svapna)
   */
  nan = 95,
  /**
   * -ni,
   */
  ni = 96,
  /**
   * -man
   */
  manin = 97,
  /**
   * -ya
   */
  ya = 98,
  /**
   * -ya
   */
  yat = 99,
  /**
   * -ana
   */
  yuc = 100,
  /**
   * -na (namra, kampra, ...)
   */
  ra = 101,
  /**
   * -ru
   */
  ru = 102,
  /**
   * -ana
   */
  lyu = 103,
  /**
   * -ana
   */
  lyuw = 104,
  /**
   * -van
   */
  vanip = 105,
  /**
   * -vara
   */
  varac = 106,
  /**
   * (empty suffix)
   */
  vic = 107,
  /**
   * (none)
   */
  viw = 108,
  /**
   * -aka
   */
  vuY = 109,
  /**
   * -aka
   */
  vun = 110,
  /**
   * -Aka
   */
  zAkan = 111,
  /**
   * -tra
   */
  zwran = 112,
  /**
   * -aka
   */
  zvun = 113,
  /**
   * -a
   */
  Sa = 114,
  /**
   * -at (gacCat, Bavat, ...)
   */
  Satf = 115,
  /**
   * -aDyE
   */
  SaDyE = 116,
  /**
   * -aDyE
   */
  SaDyEn = 117,
  /**
   * -Ana (laBamAna, sevamAna, ...)
   */
  SAnac = 118,
  /**
   * -Ana
   */
  SAnan = 119,
  /**
   * -se
   */
  se = 120,
  /**
   * -se
   */
  sen = 121,
}
/**
 * The pada of some *tiṅanta* or *kṛdanta*.
 */
export enum DhatuPada {
  /**
   * *Parasmaipada*.
   */
  Parasmaipada = 0,
  /**
   * *Ātmanepada*.
   */
  Atmanepada = 1,
}
/**
 * Defines a *gaṇa*.
 *
 * The dhatus in the Dhatupatha are organized in ten large *gaṇa*s or classes. These gaṇas
 * add various properties to the dhatu, most notably the specific *vikaraṇa* (stem suffix) we use
 * before *sārvadhātuka* suffixes.
 */
export enum Gana {
  /**
   * The first gaṇa, whose first dhatu is `BU`.
   */
  Bhvadi = 0,
  /**
   * The second gaṇa, whose first dhatu is `ad`.
   */
  Adadi = 1,
  /**
   * The third gaṇa, whose first dhatu is `hu`.
   */
  Juhotyadi = 2,
  /**
   * The fourth gaṇa, whose first dhatu is `div`.
   */
  Divadi = 3,
  /**
   * The fifth gaṇa, whose first dhatu is `su`.
   */
  Svadi = 4,
  /**
   * The sixth gaṇa, whose first dhatu is `tud`.
   */
  Tudadi = 5,
  /**
   * The seventh gaṇa, whose first dhatu is `ruD`.
   */
  Rudhadi = 6,
  /**
   * The eighth gaṇa, whose first dhatu is `tan`.
   */
  Tanadi = 7,
  /**
   * The ninth gaṇa, whose first dhatu is `krI`.
   */
  Kryadi = 8,
  /**
   * The tenth gaṇa, whose first dhatu is `cur`.
   */
  Curadi = 9,
  /**
   * The kandvAdi gaṇa, whose first dhatu is `kaRqU`.
   */
  Kandvadi = 10,
}
/**
 * The tense/mood of some *tiṅanta*.
 */
export enum Lakara {
  /**
   * Describes action in the present tense. Ssometimes called the *present indicative*.
   */
  Lat = 0,
  /**
   * Describes unwitnessed past action. Sometimes called the *perfect*.
   */
  Lit = 1,
  /**
   * Describes future action after the current day. Sometimes called the *periphrastic future*.
   */
  Lut = 2,
  /**
   * Describes general future action. Sometimes called the *simple future*.
   */
  Lrt = 3,
  /**
   * The Vedic subjunctive. `vidyut-prakriya` currently has poor support for this lakara.
   */
  Let = 4,
  /**
   * Describes commands. Sometimes called the *imperative*.
   */
  Lot = 5,
  /**
   * Describes past action before the current day. Sometimes called the *imperfect*.
   */
  Lan = 6,
  /**
   * Describes potential or hypothetical actions. Sometimes called the *optative*.
   */
  VidhiLin = 7,
  /**
   * Describes wishes and prayers. Sometimes called the *benedictive*.
   */
  AshirLin = 8,
  /**
   * Describes general past action. Sometimes called the *aorist*.
   */
  Lun = 9,
  /**
   * Describes past counterfactuals ("would not have ..."). Sometimes called the *conditional*.
   */
  Lrn = 10,
}
/**
 * Which stem to use under *leṬ*.
 *
 * Vedic *leṬ* (the subjunctive) is attested on three distinct stems:
 * the present (*laṬ*) stem, the aorist (*luṄ*) stem, and the perfect
 * (*liṬ*) stem. Pāṇini's sūtras do not name this distinction directly,
 * but Vedic usage and traditional commentary recognize it. We expose
 * the choice as a builder option on `Tinanta`.
 *
 * When unset, the derivation uses `Lat` (the present-stem path), which
 * is vidyut's historical default and the most common stem in the corpus.
 */
export enum LetStem {
  /**
   * Build *leṬ* on the *laṬ* (present) stem. This is the default.
   */
  Lat = 0,
  /**
   * Build *leṬ* on the *luṄ* (aorist) stem.
   */
  Lun = 1,
  /**
   * Build *leṬ* on the *liṬ* (perfect / reduplicated) stem.
   */
  Lit = 2,
}
/**
 * The gender of some *subanta*.
 */
export enum Linga {
  /**
   * The masculine.
   */
  Pum = 0,
  /**
   * The feminine.
   */
  Stri = 1,
  /**
   * The neuter.
   */
  Napumsaka = 2,
}
/**
 * The *prayoga* of some *tiṅanta*.
 *
 * *Prayoga* is roughly similar to the Western concept of verb *voice*.
 */
export enum Prayoga {
  /**
   * Usage coreferent with the agent, e.g. "The horse *goes* to the village."
   */
  Kartari = 0,
  /**
   * Usage coreferent with the object, e.g. "The village *is gone to* by the horse."
   */
  Karmani = 1,
  /**
   * Usage without a referent, e.g. "*There is motion* by the horse to the village."
   * *bhāve prayoga* generally produces the same forms as karmani prayoga.
   */
  Bhave = 2,
}
/**
 * The person of some *tiṅanta*.
 */
export enum Purusha {
  /**
   * The third person.
   */
  Prathama = 0,
  /**
   * The second person.
   */
  Madhyama = 1,
  /**
   * The first person.
   */
  Uttama = 2,
}
/**
 * A *sanādi pratyaya*.
 *
 * The *sanādi pratyaya*s create new *dhātu*s per 3.1.32. They are introduced in rules 3.1.7 -
 * 3.1.30, and since rule 3.1.7 contains the word "dhAtoH", they can be called *ārdhadhātuka* by
 * 3.4.114.
 *
 * Any *sanādi pratyaya*s not listed here are required by certain sutras and added by default.
 *
 * For details on what these pratyayas mean and what kinds of words they produce, see the comments
 * below.
 */
export enum Sanadi {
  /**
   * `kAmyac`, which creates nAma-dhAtus per 3.1.9.
   *
   * Examples: `putrakAmyati`
   */
  kAmyac = 0,
  /**
   * `kyaN`, which creates nAma-dhAtus per 3.1.11.
   *
   * Examples: `SyenAyate`, `BfSAyate`
   */
  kyaN = 1,
  /**
   * `kyac`, which creates nAma-dhAtus per 3.1.8.
   *
   * Examples: `putrIyati`
   */
  kyac = 2,
  /**
   * `Nic`, which creates causal roots per 3.1.26.
   *
   * Examples: `BAvayati`, `nAyayati`.
   */
  Ric = 3,
  /**
   * `yaN`, which creates intensive roots per 3.1.22. For certain dhatus, the semantics are
   * instead "crooked movement" (by 3.1.23) or "contemptible" action (by 3.1.24).
   *
   * Examples: boBUyate, nenIyate.
   *
   * Constraints: can be used only if the dhatu starts with a consonant and has exactly one
   * vowel. If this constraint is violated, our APIs will return an `Error`.
   */
  yaN = 4,
  /**
   * `yaN`, with lopa per 2.4.74. This is often listed separately due to its rarity and its
   * very different form.
   *
   * Examples: boBavIti, boBoti, nenayIti, neneti.
   */
  yaNluk = 5,
  /**
   * `san`, which creates desiderative roots per 3.1.7.
   *
   * Examples: buBUzati, ninIzati.
   */
  san = 6,
}
/**
 * The complete list of *taddhita pratyaya*s.
 *
 * Rust's naming convention is to start enum values with capital letters. However, we allow mixed
 * case explicitly here so that we can name pratyayas more concisely with SLP1. Doing so helps us
 * distinguish between pratyayas like `naN` and `nan`.
 */
export enum Taddhita {
  /**
   * a
   */
  a = 0,
  /**
   * -aka
   */
  akac = 1,
  /**
   * -a
   */
  ac = 2,
  /**
   * -aWa
   */
  aWac = 3,
  /**
   * -a
   */
  aR = 4,
  /**
   * -a
   */
  aY = 5,
  /**
   * -a
   */
  at = 6,
  /**
   * -atas
   */
  atasuc = 7,
  /**
   * -an
   */
  anic = 8,
  /**
   * -a
   */
  ap = 9,
  /**
   * -as
   */
  asic = 10,
  /**
   * -astAt
   */
  astAti = 11,
  /**
   * -Akin
   */
  Akinic = 12,
  /**
   * -Ara
   */
  Arak = 13,
  /**
   * -i
   */
  iY = 14,
  /**
   * -ita
   */
  itac = 15,
  /**
   * -ina
   */
  inac = 16,
  /**
   * -in
   */
  ini = 17,
  /**
   * -iman
   */
  imanic = 18,
  /**
   * -ila
   */
  ila = 19,
  /**
   * -ila
   */
  ilac = 20,
  /**
   * -izWa
   */
  izWan = 21,
  /**
   * -Ika
   */
  Ikak = 22,
  /**
   * -Ika
   */
  Ikan = 23,
  /**
   * -Iyas
   */
  Iyasun = 24,
  /**
   * -eRya
   */
  eRya = 25,
  /**
   * -Era
   */
  Erak = 26,
  /**
   * -ka
   */
  ka = 27,
  /**
   * -ka
   */
  kak = 28,
  /**
   * -kawa
   */
  kawac = 29,
  /**
   * -ka
   */
  kan = 30,
  /**
   * -ka
   */
  kap = 31,
  /**
   * -kalpa
   */
  kalpap = 32,
  /**
   * -kftvas
   */
  kftvasuc = 33,
  /**
   * -kuwAra
   */
  kuwArac = 34,
  /**
   * -kura
   */
  kuRap = 35,
  /**
   * -Ina
   */
  Ka = 36,
  /**
   * -Ina
   */
  KaY = 37,
  /**
   * -iya
   */
  Ga = 38,
  /**
   * -iya
   */
  Gac = 39,
  /**
   * -iya
   */
  Gan = 40,
  /**
   * -iya
   */
  Gas = 41,
  /**
   * -caRa
   */
  caRap = 42,
  /**
   * -cara
   */
  caraw = 43,
  /**
   * -cuYcu
   */
  cuYcup = 44,
  /**
   * -Ayana
   */
  cPaY = 45,
  /**
   * --
   */
  cvi = 46,
  /**
   * -A
   */
  qAc = 47,
  /**
   * -Iya
   */
  Ca = 48,
  /**
   * -Iya
   */
  CaR = 49,
  /**
   * -Iya
   */
  Cas = 50,
  /**
   * -jAtIya
   */
  jAtIyar = 51,
  /**
   * -jAha
   */
  jAhac = 52,
  /**
   * -a
   */
  Ya = 53,
  /**
   * -ika
   */
  YiWa = 54,
  /**
   * -ya
   */
  Yya = 55,
  /**
   * -ya
   */
  YyaN = 56,
  /**
   * -ya
   */
  Yyaw = 57,
  /**
   * -a
   */
  wac = 58,
  /**
   * -a
   */
  waq = 59,
  /**
   * -iWa
   */
  wiWan = 60,
  /**
   * -wIwa
   */
  wIwac = 61,
  /**
   * -eRya
   */
  weRyaR = 62,
  /**
   * -ya
   */
  wyaR = 63,
  /**
   * -ana
   */
  wyu = 64,
  /**
   * -ana
   */
  wyul = 65,
  /**
   * -la
   */
  wlaY = 66,
  /**
   * -ika
   */
  Wak = 67,
  /**
   * -ika
   */
  Wac = 68,
  /**
   * -ika
   */
  WaY = 69,
  /**
   * -ika
   */
  Wan = 70,
  /**
   * -ika
   */
  Wap = 71,
  /**
   * -a
   */
  qaw = 72,
  /**
   * -ati
   */
  qati = 73,
  /**
   * -atara
   */
  qatarac = 74,
  /**
   * -atama
   */
  qatamac = 75,
  /**
   * -pa
   */
  qupac = 76,
  /**
   * -mat
   */
  qmatup = 77,
  /**
   * -ya
   */
  qyaR = 78,
  /**
   * -vala
   */
  qvalac = 79,
  /**
   * -aka
   */
  qvun = 80,
  /**
   * -eya
   */
  Qak = 81,
  /**
   * -eyaka
   */
  QakaY = 82,
  /**
   * -eya
   */
  Qa = 83,
  /**
   * -eya
   */
  QaY = 84,
  /**
   * -eyin
   */
  Qinuk = 85,
  /**
   * -era
   */
  Qrak = 86,
  /**
   * -a
   */
  Ra = 87,
  /**
   * -in
   */
  Rini = 88,
  /**
   * -ya
   */
  Rya = 89,
  /**
   * -tama
   */
  tamap = 90,
  /**
   * -taya
   */
  tayap = 91,
  /**
   * -tara
   */
  tarap = 92,
  /**
   * -ta (becomes -tA)
   */
  tal = 93,
  /**
   * -tas
   */
  tasi = 94,
  /**
   * -tas
   */
  tasil = 95,
  /**
   * -ti
   */
  ti = 96,
  /**
   * -tika
   */
  tikan = 97,
  /**
   * -tIya
   */
  tIya = 98,
  /**
   * -tya
   */
  tyak = 99,
  /**
   * -tyaka
   */
  tyakan = 100,
  /**
   * -tya
   */
  tyap = 101,
  /**
   * -tana
   */
  tyu = 102,
  /**
   * -tana
   */
  tyul = 103,
  /**
   * -tra
   */
  tral = 104,
  /**
   * -trA
   */
  trA = 105,
  /**
   * -tva
   */
  tva = 106,
  /**
   * -Tam
   */
  Tamu = 107,
  /**
   * -Tya
   */
  Tyan = 108,
  /**
   * -TA
   */
  TAl = 109,
  /**
   * -daGna
   */
  daGnac = 110,
  /**
   * -dA
   */
  dA = 111,
  /**
   * -dAnIm
   */
  dAnIm = 112,
  /**
   * -deSya
   */
  deSya = 113,
  /**
   * -deSIya
   */
  deSIyar = 114,
  /**
   * -dvayasa
   */
  dvayasac = 115,
  /**
   * -dhA
   */
  DA = 116,
  /**
   * -na
   */
  na = 117,
  /**
   * -na
   */
  naY = 118,
  /**
   * -nAwa
   */
  nAwac = 119,
  /**
   * -Ayana
   */
  Pak = 120,
  /**
   * -Ayana
   */
  PaY = 121,
  /**
   * -Ayani
   */
  PiY = 122,
  /**
   * -bahu
   */
  bahuc = 123,
  /**
   * -biqa
   */
  biqac = 124,
  /**
   * -birIsa
   */
  birIsac = 125,
  /**
   * -Bakta
   */
  Baktal = 126,
  /**
   * -Brawa
   */
  Brawac = 127,
  /**
   * -ma
   */
  ma = 128,
  /**
   * -va
   */
  va = 129,
  /**
   * -mat
   */
  matup = 130,
  /**
   * -ma
   */
  map = 131,
  /**
   * -maya
   */
  mayaw = 132,
  /**
   * -mAtra
   */
  mAtrac = 133,
  /**
   * -pASa
   */
  pASap = 134,
  /**
   * -piwa
   */
  piwac = 135,
  /**
   * -ya
   */
  ya = 136,
  /**
   * -ya
   */
  yak = 137,
  /**
   * -ya
   */
  yaY = 138,
  /**
   * -ya
   */
  yat = 139,
  /**
   * -ya
   */
  yan = 140,
  /**
   * -yu
   */
  yus = 141,
  /**
   * -ura
   */
  urac = 142,
  /**
   * -ra
   */
  ra = 143,
  /**
   * -rUpa
   */
  rUpap = 144,
  /**
   * -rhi
   */
  rhil = 145,
  /**
   * -rUpya
   */
  rUpya = 146,
  /**
   * -la
   */
  lac = 147,
  /**
   * -vat
   */
  vati = 148,
  /**
   * -vat
   */
  vatup = 149,
  /**
   * -vaya
   */
  vaya = 150,
  /**
   * -vala
   */
  valac = 151,
  /**
   * -vin
   */
  vini = 152,
  /**
   * -viDu
   */
  viDal = 153,
  /**
   * -aka
   */
  vuk = 154,
  /**
   * -aka
   */
  vuY = 155,
  /**
   * -aka
   */
  vun = 156,
  /**
   * -vya
   */
  vyat = 157,
  /**
   * -vya
   */
  vyan = 158,
  /**
   * -Sa
   */
  Sa = 159,
  /**
   * -SaNkawa
   */
  SaNkawac = 160,
  /**
   * -SAla
   */
  SAlac = 161,
  /**
   * -Sas
   */
  Sas = 162,
  /**
   * -za
   */
  za = 163,
  /**
   * -a
   */
  zac = 164,
  /**
   * -ka
   */
  zkan = 165,
  /**
   * -tara
   */
  zwarac = 166,
  /**
   * -ika
   */
  zWac = 167,
  /**
   * -ika
   */
  zWan = 168,
  /**
   * -ika
   */
  zWal = 169,
  /**
   * Ayana
   */
  zPak = 170,
  /**
   * -ya
   */
  zyaN = 171,
  /**
   * -ya
   */
  zyaY = 172,
  /**
   * -sa
   */
  sa = 173,
  /**
   * -sna
   */
  sna = 174,
  /**
   * -sAt
   */
  sAti = 175,
  /**
   * -s
   */
  suc = 176,
  /**
   * -sna
   */
  snaY = 177,
  /**
   * -ha
   */
  ha = 178,
}
/**
 * The complete list of *uṇādi pratyaya*s.
 *
 * Rust's naming convention is to start enum values with capital letters. However, we allow mixed
 * case explicitly here so that we can name pratyayas more concisely with SLP1. Doing so helps us
 * distinguish between pratyayas like `naN` and `nan`.
 *
 * NOTE: we generated this list programmatically. Many of these pratyayas have typos.
 */
export enum Unadi {
  /**
   * -a
   */
  a = 0,
  /**
   * -aknu
   */
  aknuc = 1,
  /**
   * -aNga
   */
  aNgac = 2,
  /**
   * -adAnu
   */
  radAnuk = 3,
  /**
   * -a
   */
  ac = 4,
  /**
   * -aj
   */
  aji = 5,
  /**
   * -awa
   */
  awan = 6,
  /**
   * -aw
   */
  awi = 7,
  /**
   * -aWa
   */
  aWa = 8,
  /**
   * -aRqa
   */
  aRqan = 9,
  /**
   * -ata
   */
  atac = 10,
  /**
   * -at
   */
  ati = 11,
  /**
   * -ati
   */
  ati_ = 12,
  /**
   * -atra
   */
  atran = 13,
  /**
   * -atri
   */
  atrin = 14,
  /**
   * -aTa
   */
  aTa = 15,
  /**
   * -ad
   */
  adi = 16,
  /**
   * -a
   */
  an = 17,
  /**
   * -ani
   */
  ani = 18,
  /**
   * -anu
   */
  anuN = 19,
  /**
   * -anya
   */
  anya = 20,
  /**
   * -anyu
   */
  anyuc = 21,
  /**
   * -apa
   */
  apa = 22,
  /**
   * -abaka
   */
  abaka = 23,
  /**
   * -amba
   */
  ambac = 24,
  /**
   * -aBa
   */
  aBac = 25,
  /**
   * -ama
   */
  ama = 26,
  /**
   * -ama (praTama)
   */
  amac = 27,
  /**
   * -amba
   */
  ambaj = 28,
  /**
   * -ayu
   */
  ayu = 29,
  /**
   * -ara
   */
  ara = 30,
  /**
   * -ara
   */
  aran = 31,
  /**
   * -ar
   */
  aran_ = 32,
  /**
   * -aru
   */
  aru = 33,
  /**
   * -a
   */
  al = 34,
  /**
   * -ala (maNgala)
   */
  alac = 35,
  /**
   * -ali
   */
  alic = 36,
  /**
   * -avi
   */
  avi = 37,
  /**
   * -a
   */
  asa = 38,
  /**
   * -asa
   */
  asac = 39,
  /**
   * -asAna
   */
  asAnac = 40,
  /**
   * -as
   */
  asi = 41,
  /**
   * -as (cetas)
   */
  asun = 42,
  /**
   * -A
   */
  A = 43,
  /**
   * -Aka
   */
  Aka = 44,
  /**
   * -AgU
   */
  AgUc = 45,
  /**
   * -Awa
   */
  Awac = 46,
  /**
   * -ARaka
   */
  ARaka = 47,
  /**
   * -Atu
   */
  Atu = 48,
  /**
   * -Atfka
   */
  Atfkan = 49,
  /**
   * -Anaka
   */
  Anaka = 50,
  /**
   * -Ana
   */
  Anac = 51,
  /**
   * -Anu
   */
  Anuk = 52,
  /**
   * -Anya
   */
  Anya = 53,
  /**
   * -Ayya
   */
  Ayya = 54,
  /**
   * -Ara
   */
  Aran = 55,
  /**
   * -Ala
   */
  Ala = 56,
  /**
   * -Ala
   */
  Alac = 57,
  /**
   * -Ala
   */
  AlaY = 58,
  /**
   * -AlIya
   */
  AlIyac = 59,
  /**
   * -A
   */
  Asa = 60,
  /**
   * -As
   */
  Asi = 61,
  /**
   * -i
   */
  i = 62,
  /**
   * -ika
   */
  ikan = 63,
  /**
   * -ij
   */
  iji = 64,
  /**
   * -i
   */
  iY = 65,
  /**
   * -i
   */
  iR = 66,
  /**
   * -ita
   */
  ita = 67,
  /**
   * -ita
   */
  itac = 68,
  /**
   * -ita
   */
  itan = 69,
  /**
   * -it
   */
  iti = 70,
  /**
   * -itnu
   */
  itnuc = 71,
  /**
   * -itra
   */
  itra = 72,
  /**
   * -itva
   */
  itvan = 73,
  /**
   * -iTi
   */
  iTin = 74,
  /**
   * -i
   */
  in_ = 75,
  /**
   * -ina
   */
  inac = 76,
  /**
   * -ina
   */
  inaR = 77,
  /**
   * -ina
   */
  inan = 78,
  /**
   * -in
   */
  ini = 79,
  /**
   * -iman
   */
  imanic = 80,
  /**
   * -iman
   */
  imanin = 81,
  /**
   * -ila
   */
  ilac = 82,
  /**
   * -izWa
   */
  izWac = 83,
  /**
   * -izWu
   */
  izWuc = 84,
  /**
   * -izRu
   */
  izRuc = 85,
  /**
   * -isa
   */
  isan = 86,
  /**
   * -is
   */
  isi = 87,
  /**
   * -is
   */
  isin = 88,
  /**
   * -I
   */
  I = 89,
  /**
   * -Ika
   */
  Ikan = 90,
  /**
   * -Ici
   */
  Ici = 91,
  /**
   * -Ida
   */
  Ida = 92,
  /**
   * -Ira
   */
  Irac = 93,
  /**
   * -Ira
   */
  Iran = 94,
  /**
   * -Iza
   */
  Izan = 95,
  /**
   * -u
   */
  u = 96,
  /**
   * -uka
   */
  ukan = 97,
  /**
   * -uqa
   */
  uqac = 98,
  /**
   * -u
   */
  uR = 99,
  /**
   * -ut
   */
  uti = 100,
  /**
   * -utra
   */
  utra = 101,
  /**
   * -una
   */
  una = 102,
  /**
   * -una
   */
  unan = 103,
  /**
   * -unas
   */
  unasi = 104,
  /**
   * -uni
   */
  uni = 105,
  /**
   * -unta
   */
  unta = 106,
  /**
   * -unti
   */
  unti = 107,
  /**
   * -uma
   */
  uma = 108,
  /**
   * -umBa
   */
  umBa = 109,
  /**
   * -ura
   */
  urac = 110,
  /**
   * -ura
   */
  uran = 111,
  /**
   * -ur
   */
  uran_ = 112,
  /**
   * -uri
   */
  urin = 113,
  /**
   * -ula
   */
  ulac = 114,
  /**
   * -uli
   */
  uli = 115,
  /**
   * -uza
   */
  uzac = 116,
  /**
   * -us (Danus)
   */
  usi = 117,
  /**
   * -U
   */
  U = 118,
  /**
   * -Uka
   */
  Uka = 119,
  /**
   * -Uka
   */
  UkaR = 120,
  /**
   * -UKa
   */
  UKa = 121,
  /**
   * -UTa
   */
  UTan = 122,
  /**
   * -Uma
   */
  Uma = 123,
  /**
   * -U
   */
  Ur = 124,
  /**
   * -Ura
   */
  Uran = 125,
  /**
   * -Uza
   */
  Uzan = 126,
  /**
   * -f
   */
  f = 127,
  /**
   * -ft
   */
  ftin = 128,
  /**
   * -f
   */
  fn_ = 129,
  /**
   * -eRu
   */
  eRu = 130,
  /**
   * -eRya
   */
  eRya = 131,
  /**
   * -era
   */
  erak = 132,
  /**
   * -elima
   */
  elimac = 133,
  /**
   * -ota
   */
  otac = 134,
  /**
   * -ora
   */
  oran = 135,
  /**
   * -ola
   */
  olac = 136,
  /**
   * -ka
   */
  ka = 137,
  /**
   * -ka
   */
  kak = 138,
  /**
   * -kaNkaRa
   */
  kaNkaRa = 139,
  /**
   * -kaRa
   */
  kaRa = 140,
  /**
   * -katu
   */
  katu = 141,
  /**
   * -katni
   */
  katnic = 142,
  /**
   * -katra
   */
  katra = 143,
  /**
   * -kTa
   */
  kTan = 144,
  /**
   * -ka
   */
  kan = 145,
  /**
   * -anas
   */
  kanasi = 146,
  /**
   * -an
   */
  kanin = 147,
  /**
   * -kanu
   */
  kanum = 148,
  /**
   * -kanya
   */
  kanyan = 149,
  /**
   * -kanyu
   */
  kanyuc = 150,
  /**
   * -kapa
   */
  kapa = 151,
  /**
   * -kapa
   */
  kapan = 152,
  /**
   * -am
   */
  kamin = 153,
  /**
   * -kaya
   */
  kayan = 154,
  /**
   * -kara
   */
  karan = 155,
  /**
   * -kala
   */
  kala = 156,
  /**
   * -kAku
   */
  kAku = 157,
  /**
   * -kAla
   */
  kAlan = 158,
  /**
   * -ika
   */
  kikan = 159,
  /**
   * -kita
   */
  kitac = 160,
  /**
   * -kinda
   */
  kindac = 161,
  /**
   * -kira
   */
  kirac = 162,
  /**
   * -kizya
   */
  kizyan = 163,
  /**
   * -kIka
   */
  kIkac = 164,
  /**
   * -kIka
   */
  kIkan = 165,
  /**
   * -kIwa
   */
  kIwan = 166,
  /**
   * -ku
   */
  ku = 167,
  /**
   * -ku
   */
  kuk = 168,
  /**
   * -kuka
   */
  kukan = 169,
  /**
   * -kuza
   */
  kuzan = 170,
  /**
   * -kU
   */
  kU = 171,
  /**
   * -kta
   */
  kta = 172,
  /**
   * -ktnu
   */
  ktnu = 173,
  /**
   * -ktra
   */
  ktra = 174,
  /**
   * -kTi
   */
  kTin = 175,
  /**
   * -kna
   */
  kna = 176,
  /**
   * -kni
   */
  knin = 177,
  /**
   * -kmala
   */
  kmalan = 178,
  /**
   * -ana
   */
  kyu = 179,
  /**
   * -ana
   */
  kyun = 180,
  /**
   * -kra
   */
  kran = 181,
  /**
   * -krara
   */
  kraran = 182,
  /**
   * -kri
   */
  kri = 183,
  /**
   * -kri
   */
  krin = 184,
  /**
   * -ruka
   */
  krukan = 185,
  /**
   * -kru
   */
  krun = 186,
  /**
   * -kla
   */
  kla = 187,
  /**
   * -kva
   */
  kvan = 188,
  /**
   * -van
   */
  kvanip = 189,
  /**
   * -kvi
   */
  kvin = 190,
  /**
   * -
   */
  kvip = 191,
  /**
   * -aka
   */
  kvun = 192,
  /**
   * -ksara
   */
  ksaran = 193,
  /**
   * -ksi
   */
  ksi = 194,
  /**
   * -ksu
   */
  ksu = 195,
  /**
   * -kseyya
   */
  kseyya = 196,
  /**
   * -ksna
   */
  ksna = 197,
  /**
   * -Ka
   */
  Ka = 198,
  /**
   * -ga
   */
  ga = 199,
  /**
   * -ga
   */
  gak = 200,
  /**
   * -ga
   */
  gaR = 201,
  /**
   * -ga
   */
  gan = 202,
  /**
   * -GaTi
   */
  GaTin = 203,
  /**
   * -ca
   */
  caw = 204,
  /**
   * -catu
   */
  catu = 205,
  /**
   * -c
   */
  cik = 206,
  /**
   * -Ja
   */
  Jac = 207,
  /**
   * -Ji
   */
  Jic = 208,
  /**
   * -Yu
   */
  YuR = 209,
  /**
   * -wa
   */
  wa = 210,
  /**
   * -wa
   */
  wan = 211,
  /**
   * -wiza
   */
  wizac = 212,
  /**
   * -Wa
   */
  Wa = 213,
  /**
   * -qa
   */
  qa = 214,
  /**
   * -qau
   */
  qau = 215,
  /**
   * -ra
   */
  qraw = 216,
  /**
   * -qati
   */
  qati = 217,
  /**
   * -avat
   */
  qavatu = 218,
  /**
   * -qim
   */
  qimi = 219,
  /**
   * -quta
   */
  qutac = 220,
  /**
   * -qu
   */
  qun = 221,
  /**
   * -ums
   */
  qumsun = 222,
  /**
   * -U
   */
  qU = 223,
  /**
   * -E
   */
  qE = 224,
  /**
   * -Es
   */
  qEsi = 225,
  /**
   * -o
   */
  qo = 226,
  /**
   * -os
   */
  qosi = 227,
  /**
   * -O
   */
  qO = 228,
  /**
   * -qri
   */
  qri = 229,
  /**
   * -Qa
   */
  Qa = 230,
  /**
   * -Ritra
   */
  Ritran = 231,
  /**
   * -Ru
   */
  Ru = 232,
  /**
   * -Ruka
   */
  Rukan = 233,
  /**
   * -ta
   */
  ta = 234,
  /**
   * -taka
   */
  takan = 235,
  /**
   * -ta
   */
  tan = 236,
  /**
   * -tana
   */
  tanan = 237,
  /**
   * -taSa
   */
  taSan = 238,
  /**
   * -taSas
   */
  taSasun = 239,
  /**
   * -ti
   */
  ti = 240,
  /**
   * -tika
   */
  tikan = 241,
  /**
   * -tu
   */
  tu = 242,
  /**
   * -tu
   */
  tun = 243,
  /**
   * -tf
   */
  tfc = 244,
  /**
   * -tf
   */
  tfn = 245,
  /**
   * -tna
   */
  tnaR = 246,
  /**
   * -tyu
   */
  tyuk = 247,
  /**
   * -tra
   */
  tra = 248,
  /**
   * -tra
   */
  tran = 249,
  /**
   * -tri
   */
  trin = 250,
  /**
   * -tri
   */
  trip = 251,
  /**
   * -tva
   */
  tvan = 252,
  /**
   * -Ta
   */
  Tak = 253,
  /**
   * -da
   */
  da = 254,
  /**
   * -da
   */
  dan = 255,
  /**
   * -Du
   */
  Duk = 256,
  /**
   * -na
   */
  na = 257,
  /**
   * -na
   */
  nak = 258,
  /**
   * -ni
   */
  ni = 259,
  /**
   * -nu
   */
  nu = 260,
  /**
   * -pa
   */
  pa = 261,
  /**
   * -pAsa
   */
  pAsa = 262,
  /**
   * -Pa
   */
  Pak = 263,
  /**
   * -ba
   */
  ban = 264,
  /**
   * -Ba
   */
  Ba = 265,
  /**
   * -Ba
   */
  Ban = 266,
  /**
   * -ma
   */
  mak = 267,
  /**
   * -madi
   */
  madik = 268,
  /**
   * -ma
   */
  man = 269,
  /**
   * -man
   */
  mani = 270,
  /**
   * -man
   */
  maniR = 271,
  /**
   * -man
   */
  manin = 272,
  /**
   * -mi
   */
  mi = 273,
  /**
   * -mi
   */
  min = 274,
  /**
   * -mu
   */
  muk = 275,
  /**
   * -ya
   */
  ya = 276,
  /**
   * -ya
   */
  yak = 277,
  /**
   * -ya
   */
  yat = 278,
  /**
   * -yatu
   */
  yatuc = 279,
  /**
   * -yu
   */
  yuk = 280,
  /**
   * -ana
   */
  yuc = 281,
  /**
   * -ana
   */
  yun = 282,
  /**
   * -ra
   */
  ra = 283,
  /**
   * -ra
   */
  rak = 284,
  /**
   * -ra
   */
  ran = 285,
  /**
   * -ru
   */
  ru = 286,
  /**
   * -la
   */
  lak = 287,
  /**
   * -va
   */
  va = 288,
  /**
   * -va
   */
  vaR = 289,
  /**
   * -va
   */
  van = 290,
  /**
   * -van
   */
  vanip = 291,
  /**
   * -vara
   */
  varaw = 292,
  /**
   * -vala
   */
  valaY = 293,
  /**
   * -vAla
   */
  vAlac = 294,
  /**
   * -vAla
   */
  vAlan = 295,
  /**
   * -vi
   */
  vin = 296,
  /**
   * -aka
   */
  vun = 297,
  /**
   * -Sa
   */
  Sak = 298,
  /**
   * -Su
   */
  Sun = 299,
  /**
   * -Sva
   */
  SvaR = 300,
  /**
   * -ziva
   */
  zivan = 301,
  /**
   * -zwra
   */
  zwran = 302,
  /**
   * -zvara
   */
  zvarac = 303,
  /**
   * -sa
   */
  sa = 304,
  /**
   * -sa
   */
  san = 305,
  /**
   * -sara
   */
  sara = 306,
  /**
   * -sika
   */
  sikan = 307,
  /**
   * -sTa
   */
  Tan = 308,
  /**
   * -sma
   */
  sman = 309,
  /**
   * -sya
   */
  sya = 310,
  /**
   * -sya
   */
  syan = 311,
}
/**
 * The number of some *tiṅanta* or *subanta*.
 */
export enum Vacana {
  /**
   * The singular.
   */
  Eka = 0,
  /**
   * The dual.
   */
  Dvi = 1,
  /**
   * The plural.
   */
  Bahu = 2,
}
/**
 * The case ending of some *subanta*.
 *
 * A *vibhakti* is a set of 3 endings that share all of the same properties except for their
 * number (singular, dual, plural). While *tiṅanta*s also have *vibhakti*s, in practice the term
 * *vibhakti* refers more specifically to the endings used with *subanta*s.
 *
 * *Vibhakti* is broadly similar to the Western notion of grammatical case.
 */
export enum Vibhakti {
  /**
   * The first *vibhakti*. Sometimes called the *nominative case*.
   */
  Prathama = 0,
  /**
   * The second *vibhakti*. Sometimes called the *accusative case*.
   */
  Dvitiya = 1,
  /**
   * The third *vibhakti*. Sometimes called the *instrumental case*.
   */
  Trtiya = 2,
  /**
   * The fourth *vibhakti*. Sometimes called the *dative case*.
   */
  Caturthi = 3,
  /**
   * The fifth *vibhakti*. Sometimes called the *ablative case*.
   */
  Panchami = 4,
  /**
   * The sixth *vibhakti*. Sometimes called the *genitive case*.
   */
  Sasthi = 5,
  /**
   * The seventh *vibhakti*. Sometimes called the *locative case*.
   */
  Saptami = 6,
  /**
   * The first *vibhakti* used in the sense of *sambodhana*. Sometimes called the *vocative case*.
   *
   * *Sambodhana* is technically not a *vibhakti* but rather an additional semantic condition
   * on the first vibhakti. But we felt that users would find it more convenient to have this
   * condition available on `Vibhakti` directly rather than have to define the *sambodhana*
   * condition separately.
   */
  Sambodhana = 7,
}
/**
 * WebAssembly API for vidyut-prakriya.
 *
 * Within reason, we have tried to mimic a native JavaScript API. At some point, we wish to
 * support optional arguments, perhaps by using `Reflect`.
 */
export class Vidyut {
  private constructor();
  free(): void;
  /**
   * Creates a new API manager.
   *
   * This constructor is not called `new` because `new` is a reserved word in JavaScript.
   */
  static init(): Vidyut;
  /**
   * Loads the dhatupatha (the text of `dhatupatha.tsv`) that `evaluateLisp` uses to resolve a
   * dhatu whose svara markers were left out. Returns false if the text is not valid.
   */
  loadDhatupatha(tsv: string): boolean;
  /**
   * Returns the values that an expression accepts in its enum-valued slots (krts, taddhitas,
   * lakaras, ...), so that an editor can suggest them.
   */
  lispCompletions(): any;
  /**
   * Evaluates a Lisp-style expression (see `vyakarana_lisp_wrap`) and returns a
   * `WebEvaluation`. Errors are returned in the `error` field.
   */
  evaluateLisp(input: string): any;
  /**
   * Encodes a Lisp expression (SLP1) as a short, tamper-evident string. Returns
   * `{ value, error }`: `value` is the string, or null if the expression cannot be encoded.
   */
  encodeLisp(expression: string): any;
  /**
   * Decodes a string made by `encodeLisp` into the canonical Lisp expression (SLP1). Returns
   * `{ value, error }`: `value` is the expression, or null (and `error` is set) if the string
   * is not valid or was changed.
   */
  decodeLisp(encoded: string): any;
  /**
   * Wrapper for `Vyakarana::derive_krdantas`.
   */
  deriveKrdantas(val: any): any;
  /**
   * Wrapper for `Vyakarana::derive_dhatus`.
   */
  deriveDhatus(val: any): any;
  /**
   * Wrapper for `Vyakarana::derive_subantas`.
   */
  deriveSubantas(val: any): any;
  /**
   * Wrapper for `Vyakarana::derive_tinantas`.
   *
   * TODO: how might we reduce the number of arguments here?
   */
  deriveTinantas(val: any): any;
  /**
   * Wrapper for `Vyakarana::derive_taddhitantas`.
   */
  deriveTaddhitantas(val: any): any;
  /**
   * Wrapper for `Vyakarana::derive_stryantas`.
   */
  deriveStryantas(val: any): any;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_vidyut_free: (a: number, b: number) => void;
  readonly vidyut_init: () => number;
  readonly vidyut_loadDhatupatha: (a: number, b: number, c: number) => number;
  readonly vidyut_lispCompletions: (a: number) => any;
  readonly vidyut_evaluateLisp: (a: number, b: number, c: number) => any;
  readonly vidyut_encodeLisp: (a: number, b: number, c: number) => any;
  readonly vidyut_decodeLisp: (a: number, b: number, c: number) => any;
  readonly vidyut_deriveKrdantas: (a: number, b: any) => any;
  readonly vidyut_deriveDhatus: (a: number, b: any) => any;
  readonly vidyut_deriveSubantas: (a: number, b: any) => any;
  readonly vidyut_deriveTinantas: (a: number, b: any) => any;
  readonly vidyut_deriveTaddhitantas: (a: number, b: any) => any;
  readonly vidyut_deriveStryantas: (a: number, b: any) => any;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
