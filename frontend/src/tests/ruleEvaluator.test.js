import { describe, test, expect } from 'vitest';
import { evaluateRule, getNestedValue } from '../utils/ruleEvaluator';

describe('Frontend Rule Evaluator', () => {
  const mockFormData = {
    incident: {
      type: 'animal_collision',
    },
    vehicle: {
      make: 'Honda',
    },
    animal: {
      type: 'deer',
    },
  };

  test('should safely resolve nested object paths', () => {
    expect(getNestedValue(mockFormData, 'incident.type')).toBe('animal_collision');
    expect(getNestedValue(mockFormData, 'vehicle.make')).toBe('Honda');
    expect(getNestedValue(mockFormData, 'nonexistent.path')).toBeUndefined();
  });

  test('should evaluate single equals rule', () => {
    const rule = { field: 'incident.type', operator: 'equals', value: 'animal_collision' };
    expect(evaluateRule(rule, mockFormData)).toBe(true);
  });

  test('should evaluate compound 3-level deep allTrue AND rules', () => {
    const rule = {
      allTrue: [
        { field: 'incident.type', operator: 'equals', value: 'animal_collision' },
        { field: 'animal.type', operator: 'equals', value: 'deer' },
        { field: 'vehicle.make', operator: 'equals', value: 'Honda' },
      ],
    };
    expect(evaluateRule(rule, mockFormData)).toBe(true);
  });
});
