import type { Rule, Ruleset, Selection } from "../types";

export type RuleIssue = {
  ruleId: string;
  message: string;
  severity: "error" | "warning";
};

function matches(selection: Selection, cond: { module: string; option: string }): boolean {
  return selection[cond.module] === cond.option;
}

function violatesThen(selection: Selection, thenCond: { module: string; option?: string; notOption?: string; optionIn?: string[] }): boolean {
  const chosen = selection[thenCond.module];
  if (!chosen) return true; // missing required module selection -> treat as violation for requires
  if (thenCond.option && chosen !== thenCond.option) return true;
  if (thenCond.notOption && chosen === thenCond.notOption) return true;
  if (thenCond.optionIn && thenCond.optionIn.includes(chosen)) return true; // for forbid: choosing in forbidden list violates
  return false;
}

function satisfiesThen(selection: Selection, thenCond: { module: string; option?: string; notOption?: string; optionIn?: string[] }): boolean {
  const chosen = selection[thenCond.module];
  if (!chosen) return false;
  if (thenCond.option && chosen !== thenCond.option) return false;
  if (thenCond.notOption && chosen === thenCond.notOption) return false;
  if (thenCond.optionIn && !thenCond.optionIn.includes(chosen)) return false;
  return true;
}

export function validateSelection(ruleset: Ruleset, selection: Selection): RuleIssue[] {
  const issues: RuleIssue[] = [];

  for (const rule of ruleset.rules as Rule[]) {
    const triggered = matches(selection, rule.if);
    if (!triggered) continue;

    if (rule.type === "requires") {
      // must satisfy then
      if (!satisfiesThen(selection, rule.then)) {
        issues.push({ ruleId: rule.id, message: rule.message, severity: "error" });
      }
    } else if (rule.type === "forbid") {
      // if forbidden then is satisfied -> error
      // For forbid, we interpret:
      // - optionIn: any of these is forbidden
      // - option: specific option forbidden
      // - notOption: everything except notOption? (rare) - not used here
      const chosen = selection[rule.then.module];
      if (!chosen) continue;
      if (rule.then.option && chosen === rule.then.option) {
        issues.push({ ruleId: rule.id, message: rule.message, severity: "error" });
      } else if (rule.then.optionIn && rule.then.optionIn.includes(chosen)) {
        issues.push({ ruleId: rule.id, message: rule.message, severity: "error" });
      } else if (rule.then.notOption && chosen !== rule.then.notOption) {
        issues.push({ ruleId: rule.id, message: rule.message, severity: "error" });
      }
    }
  }

  return issues;
}
