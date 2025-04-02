import { RRule } from "rrule"

export function parseRRule(rruleString: string) {
  try {
    const rule = RRule.fromString(rruleString)
    return rule
  } catch (error) {
    console.error("Error parsing RRULE:", error)
    return null
  }
}

export function formatRRuleToHuman(rruleString: string): string {
  try {
    const rule = RRule.fromString(rruleString)
    return rule.toText()
  } catch (error) {
    console.error("Error formatting RRULE:", error)
    return "Invalid RRULE format"
  }
}

