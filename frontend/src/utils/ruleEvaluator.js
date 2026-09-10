export function evaluateRule(rule, formData) {
  if (!rule) return true;

  // Compound AND (allTrue)
  if ('allTrue' in rule && Array.isArray(rule.allTrue)) {
    if (rule.allTrue.length === 0) return true;
    return rule.allTrue.every((subRule) => evaluateRule(subRule, formData));
  }

  // Compound OR (anyTrue)
  if ('anyTrue' in rule && Array.isArray(rule.anyTrue)) {
    if (rule.anyTrue.length === 0) return true;
    return rule.anyTrue.some((subRule) => evaluateRule(subRule, formData));
  }

  const { field, operator, value } = rule;
  if (!field || !operator) return true;

  const actualValue = getNestedValue(formData, field);
  return evaluateOperator(operator, actualValue, value);
}

export function getNestedValue(obj, path) {
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

function evaluateOperator(operator, actual, target) {
  switch (operator) {
    case 'equals':
      return String(actual).toLowerCase() === String(target).toLowerCase();

    case 'notEquals':
      return String(actual).toLowerCase() !== String(target).toLowerCase();

    case 'greaterThan':
      return Number(actual) > Number(target);

    case 'lessThan':
      return Number(actual) < Number(target);

    case 'greaterThanOrEqual':
      return Number(actual) >= Number(target);

    case 'lessThanOrEqual':
      return Number(actual) <= Number(target);

    case 'includes':
      if (Array.isArray(actual)) return actual.includes(target);
      if (typeof actual === 'string') return actual.toLowerCase().includes(String(target).toLowerCase());
      return false;

    case 'notIncludes':
      if (Array.isArray(actual)) return !actual.includes(target);
      if (typeof actual === 'string') return !actual.toLowerCase().includes(String(target).toLowerCase());
      return true;

    case 'isTrue':
      return Boolean(actual) === true;

    case 'isFalse':
      return Boolean(actual) === false;

    default:
      return false;
  }
}
