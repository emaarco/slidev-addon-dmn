/**
 * Parse a DMN decision table into a plain model that can drive a simulation UI
 * and be evaluated with a FEEL engine — no dmn-js instance required.
 *
 * Only the parts a single decision table needs are extracted: its inputs,
 * outputs, rules (as raw FEEL text) and hit policy. FEEL is never interpreted
 * here — see `evaluateDecision.ts` for that.
 */

export type HitPolicy =
  | 'UNIQUE'
  | 'FIRST'
  | 'ANY'
  | 'PRIORITY'
  | 'COLLECT'
  | 'RULE ORDER'
  | 'OUTPUT ORDER'

export interface DmnInput {
  id: string
  /** Human label shown in the form (falls back to the input expression). */
  label: string
  /** The FEEL input expression, i.e. the variable name (e.g. `Season`). */
  expression: string
  /** DMN typeRef of the input (`string`, `integer`, `boolean`, …). */
  typeRef: string
  /** Distinct string literals used in this column — drives a dropdown. */
  options: string[]
}

export interface DmnOutput {
  id: string
  /** Key used in the result object — output name, else label, else fallback. */
  name: string
  label: string
  typeRef: string
  /**
   * Allowed output values in priority order (highest first), from
   * `<outputValues>`. Drives PRIORITY and OUTPUT ORDER; empty when unset.
   */
  priorityValues: string[]
}

/** COLLECT aggregator (`aggregation` attribute); undefined = plain list. */
export type Aggregation = 'SUM' | 'MIN' | 'MAX' | 'COUNT'

export interface DmnRule {
  id: string
  /** Raw FEEL unary-test text per input column (aligned to `inputs`). */
  inputEntries: string[]
  /** Raw FEEL expression text per output column (aligned to `outputs`). */
  outputEntries: string[]
}

export interface DecisionModel {
  decisionId: string
  decisionName: string
  hitPolicy: HitPolicy
  /** COLLECT aggregator, if any (`SUM`/`MIN`/`MAX`/`COUNT`). */
  aggregation?: Aggregation
  inputs: DmnInput[]
  outputs: DmnOutput[]
  rules: DmnRule[]
}

/** Split a FEEL `outputValues` list (`"a","b","c"`) into ordered bare values. */
function parseOutputValues(text: string): string[] {
  if (!text) return []
  return text
    .split(',')
    .map(part => part.trim().replace(/^"(.*)"$/, '$1'))
    .filter(part => part.length > 0)
}

/** Namespace-agnostic lookup — DMN files use a default (prefix-less) namespace. */
function byLocalName(scope: Element | Document, localName: string): Element[] {
  return Array.from(scope.getElementsByTagNameNS('*', localName))
}

function firstByLocalName(scope: Element | Document, localName: string): Element | null {
  return byLocalName(scope, localName)[0] ?? null
}

/** Text of the nested `<text>` element (used by input/output entries). */
function entryText(entry: Element | undefined): string {
  if (!entry) return ''
  const text = firstByLocalName(entry, 'text')
  return (text?.textContent ?? '').trim()
}

/**
 * Parse the first decision table (or the one matching `decisionId`) from a DMN
 * XML string.
 *
 * @throws if the XML is malformed or contains no decision table.
 */
export function parseDecisionModel(xml: string, decisionId?: string): DecisionModel {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  if (firstByLocalName(doc, 'parsererror')) {
    throw new Error('DMN XML could not be parsed')
  }

  const decisions = byLocalName(doc, 'decision')
  const decision = decisionId
    ? decisions.find(d => d.getAttribute('id') === decisionId)
    : decisions.find(d => firstByLocalName(d, 'decisionTable'))
  if (!decision) {
    throw new Error(
      decisionId
        ? `No decision with id "${decisionId}" found`
        : 'No decision with a decision table found',
    )
  }

  const table = firstByLocalName(decision, 'decisionTable')
  if (!table) {
    throw new Error('Selected decision has no decision table')
  }

  const hitPolicy = (table.getAttribute('hitPolicy') || 'UNIQUE').toUpperCase() as HitPolicy
  const aggregationAttr = (table.getAttribute('aggregation') || '').toUpperCase()
  const aggregation = (['SUM', 'MIN', 'MAX', 'COUNT'] as const).find(a => a === aggregationAttr)

  // Only the columns that belong to *this* table (skip nested inputData vars).
  const inputEls = byLocalName(table, 'input')
  const outputEls = byLocalName(table, 'output')
  const ruleEls = byLocalName(table, 'rule')

  const rules: DmnRule[] = ruleEls.map((rule, ri) => ({
    id: rule.getAttribute('id') || `rule_${ri}`,
    inputEntries: byLocalName(rule, 'inputEntry').map(entryText),
    outputEntries: byLocalName(rule, 'outputEntry').map(entryText),
  }))

  const inputs: DmnInput[] = inputEls.map((input, ci) => {
    const expressionEl = firstByLocalName(input, 'inputExpression')
    const expression = entryText(expressionEl ?? undefined)
    const label = input.getAttribute('label') || expression || `Input ${ci + 1}`
    const typeRef = expressionEl?.getAttribute('typeRef') || 'string'

    // Collect the distinct string literals used in this column so the form can
    // offer a dropdown instead of a free-text field.
    const options: string[] = []
    for (const rule of rules) {
      const match = /^"(.*)"$/.exec(rule.inputEntries[ci] ?? '')
      if (match && !options.includes(match[1])) options.push(match[1])
    }

    return { id: input.getAttribute('id') || `input_${ci}`, label, expression, typeRef, options }
  })

  const outputs: DmnOutput[] = outputEls.map((output, ci) => {
    const label = output.getAttribute('label') || ''
    const name = output.getAttribute('name') || label || `Output ${ci + 1}`
    const priorityValues = parseOutputValues(entryText(firstByLocalName(output, 'outputValues') ?? undefined))
    return {
      id: output.getAttribute('id') || `output_${ci}`,
      name,
      label: label || name,
      typeRef: output.getAttribute('typeRef') || 'string',
      priorityValues,
    }
  })

  return {
    decisionId: decision.getAttribute('id') || '',
    decisionName: decision.getAttribute('name') || '',
    hitPolicy,
    aggregation,
    inputs,
    outputs,
    rules,
  }
}

const NUMERIC_TYPES = new Set(['integer', 'long', 'int', 'number', 'double', 'decimal', 'float'])

/** Whether a DMN typeRef should be edited as a number field. */
export function isNumericType(typeRef: string): boolean {
  return NUMERIC_TYPES.has((typeRef || '').toLowerCase())
}
