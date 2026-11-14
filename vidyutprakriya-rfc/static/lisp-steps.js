// The rows of a prakriya table in the Advanced tab.

/**
 * Returns whether the Advanced tab shows `step` even when it changes no term: a sutra in
 * `alwaysShownSutras`, any step of an `anyatra` rule (a source cited by free text, so its code
 * cannot be listed), or a step that applied an accepted optional rule (`isChoice`).
 */
export function isAlwaysShownStep(step, alwaysShownSutras) {
  return alwaysShownSutras.has(step.rule.code.trim()) || step.rule.source === "anyatra" || step.isChoice === true;
}

/**
 * Returns the index of the first step of `history` that has a term with the text `upadesha`, or
 * `-1` if no step has one.
 */
export function firstStepWith(history, upadesha) {
    return history.findIndex(step => step.result.some(term => term.text === upadesha));
}

/**
 * Returns the rows of a table: each step, whether a blank row goes before it, the text of that
 * row, and the dhatus that are shown before it.
 *
 * A blank row separates the fragments of a word that were derived on their own (a krdanta or a
 * taddhitanta). It goes before the first row shown after the fragment starts or ends, and never at
 * the top of a table.
 *
 * Each dhatu in `dhatus` (objects with an `upadesha` and an `artha`) is shown once, before the
 * first step that has it. The dhatu is shown even if that step is hidden, and comes after the
 * blank row, if any.
 *
 * `isHidden(step)` says whether a step is hidden. `labelOf(text)` renders the text of a finished
 * base for the blank row.
 */
export function stepRows(history, dhatus, isHidden, labelOf) {
    const dhatuAt = new Map();
    for (const d of dhatus || []) {
        // A dhatu that no step has (this should not happen) is shown before the first step.
        const i = Math.max(firstStepWith(history, d.upadesha), 0);
        dhatuAt.set(i, [...(dhatuAt.get(i) || []), d]);
    }

    let shown = false;
    let pending = false;
    let label = '';
    return history.map((step, i) => {
        pending = pending || !!step.fragmentStart || !!step.finishedBase;
        label = step.finishedBase ? 'Base: ' + labelOf(step.finishedBase) : label;
        const here = dhatuAt.get(i) || [];
        if (here.length === 0 && isHidden(step)) {
            return { step, breakBefore: false, breakLabel: '', dhatus: [] };
        }
        const breakBefore = shown && pending;
        const breakLabel = breakBefore ? label : '';
        shown = true;
        pending = false;
        label = '';
        return { step, breakBefore, breakLabel, dhatus: here };
    });
}
