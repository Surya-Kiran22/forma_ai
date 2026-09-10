import { ruleEngineService } from '../src/services/RuleEngineService.js';

describe('RuleEngineService - Multi-Level Dynamic Branching Evaluation', () => {
  const formDataSample = {
    incident: {
      type: 'animal_collision',
      date: '2026-09-09',
    },
    vehicle: {
      make: 'Honda',
      model: 'Civic',
    },
    animal: {
      type: 'deer',
    },
    damage: {
      location: 'windshield',
      severity: 'severe',
    },
  };

  test('should return true for empty or null rule', () => {
    expect(ruleEngineService.evaluateRule(null, formDataSample)).toBe(true);
    expect(ruleEngineService.evaluateRule(undefined, formDataSample)).toBe(true);
  });

  test('should evaluate single equality rule correctly', () => {
    const rule = { field: 'incident.type', operator: 'equals', value: 'animal_collision' };
    expect(ruleEngineService.evaluateRule(rule, formDataSample)).toBe(true);

    const falseRule = { field: 'incident.type', operator: 'equals', value: 'rear_end' };
    expect(ruleEngineService.evaluateRule(falseRule, formDataSample)).toBe(false);
  });

  test('should evaluate nested property dot-notation path', () => {
    const rule = { field: 'vehicle.make', operator: 'equals', value: 'Honda' };
    expect(ruleEngineService.evaluateRule(rule, formDataSample)).toBe(true);
  });

  test('should evaluate compound AND (allTrue) rules up to 3 levels deep', () => {
    const 3LevelRule = {
      allTrue: [
        { field: 'incident.type', operator: 'equals', value: 'animal_collision' },
        { field: 'animal.type', operator: 'equals', value: 'deer' },
        { field: 'vehicle.make', operator: 'equals', value: 'Honda' },
      ],
    };
    expect(ruleEngineService.evaluateRule(3LevelRule, formDataSample)).toBe(true);

    const failing3LevelRule = {
      allTrue: [
        { field: 'incident.type', operator: 'equals', value: 'animal_collision' },
        { field: 'animal.type', operator: 'equals', value: 'deer' },
        { field: 'vehicle.make', operator: 'equals', value: 'Toyota' }, // Toyota mismatch
      ],
    };
    expect(ruleEngineService.evaluateRule(failing3LevelRule, formDataSample)).toBe(false);
  });

  test('should evaluate compound OR (anyTrue) rules', () => {
    const rule = {
      anyTrue: [
        { field: 'vehicle.make', operator: 'equals', value: 'Ford' },
        { field: 'vehicle.make', operator: 'equals', value: 'Honda' },
      ],
    };
    expect(ruleEngineService.evaluateRule(rule, formDataSample)).toBe(true);
  });
});
