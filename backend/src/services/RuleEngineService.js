export class RuleEngineService {
  /**
   * Evaluate a condition rule against a given form response object.
   * @param {Object} rule 
   * @param {Object} formData 
   * @returns {boolean}
   */
  evaluateRule(rule, formData) {
    if (!rule) {
      return true; // No rule means unconditionally visible
    }

    // Handle compound conditions (allTrue / AND)
    if ('allTrue' in rule && Array.isArray(rule.allTrue)) {
      if (rule.allTrue.length === 0) return true;
      return rule.allTrue.every((subRule) => this.evaluateRule(subRule, formData));
    }

    // Handle compound conditions (anyTrue / OR)
    if ('anyTrue' in rule && Array.isArray(rule.anyTrue)) {
      if (rule.anyTrue.length === 0) return true;
      return rule.anyTrue.some((subRule) => this.evaluateRule(subRule, formData));
    }

    // Handle single condition
    const singleRule = rule;
    if (!singleRule.field || !singleRule.operator) {
      return true;
    }

    const actualValue = this.getNestedValue(formData, singleRule.field);
    return this.evaluateOperator(singleRule.operator, actualValue, singleRule.value);
  }

  /**
   * Safely retrieve dynamic nested property values using dot notation ("vehicle.damage.type")
   * @param {Object} obj 
   * @param {string} path 
   * @returns {any}
   */
  getNestedValue(obj, path) {
    if (!obj || !path) return undefined;
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return undefined;
      }
      current = current[part];
    }
    return current;
  }

  evaluateOperator(operator, actual, target) {
    switch (operator) {
      case 'equals':
        return String(actual).toLowerCase() === String(target).toLowerCase();

      case 'notEquals':
        return String(actual).toLowerCase() !== String(target).toLowerCase();

      case 'greaterThan':
        return typeof actual === 'number' && typeof target === 'number'
          ? actual > target
          : Number(actual) > Number(target);

      case 'lessThan':
        return typeof actual === 'number' && typeof target === 'number'
          ? actual < target
          : Number(actual) < Number(target);

      case 'greaterThanOrEqual':
        return typeof actual === 'number' && typeof target === 'number'
          ? actual >= target
          : Number(actual) >= Number(target);

      case 'lessThanOrEqual':
        return typeof actual === 'number' && typeof target === 'number'
          ? actual <= target
          : Number(actual) <= Number(target);

      case 'includes':
        if (Array.isArray(actual)) {
          return actual.includes(target);
        }
        if (typeof actual === 'string') {
          return actual.toLowerCase().includes(String(target).toLowerCase());
        }
        return false;

      case 'notIncludes':
        if (Array.isArray(actual)) {
          return !actual.includes(target);
        }
        if (typeof actual === 'string') {
          return !actual.toLowerCase().includes(String(target).toLowerCase());
        }
        return true;

      case 'isTrue':
        return Boolean(actual) === true;

      case 'isFalse':
        return Boolean(actual) === false;

      case 'in':
        if (Array.isArray(target)) {
          return target.some((t) => String(t).toLowerCase() === String(actual).toLowerCase());
        }
        return false;

      case 'notIn':
        if (Array.isArray(target)) {
          return !target.some((t) => String(t).toLowerCase() === String(actual).toLowerCase());
        }
        return true;

      default:
        return false;
    }
  }
}

export const ruleEngineService = new RuleEngineService();
