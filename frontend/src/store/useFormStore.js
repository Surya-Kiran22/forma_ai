import { create } from 'zustand';
import { api } from '../services/api';
import { evaluateRule } from '../utils/ruleEvaluator';

export const useFormStore = create((set, get) => ({
  // Auth state
  user: null,
  isAuthenticated: false,
  authModalOpen: false,

  // Schema & Form State
  activeFormType: 'auto_claim',
  activeSchema: null,
  isLoadingSchema: false,
  schemaError: null,

  formData: {},
  extractedMetadata: {},
  missingFields: [],
  lowConfidenceFields: [],
  
  // AI Extraction State
  isExtracting: false,
  extractionError: null,
  narrativeText: '',

  // Draft & Submission State
  isSavingDraft: false,
  lastSavedAt: null,
  completionPercentage: 0,
  isSubmitting: false,
  submitError: null,
  submissionSuccess: false,
  userSubmissions: [],

  // Auth actions
  setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
  setAuthModalOpen: (open) => set({ authModalOpen: open }),
  
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user, tokens } = res.data.data;
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    set({ user, isAuthenticated: true, authModalOpen: false });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  setFormType: (formType) => {
    set({ activeFormType: formType, formData: {}, extractedMetadata: {}, missingFields: [], submissionSuccess: false });
    get().fetchSchema(formType);
    if (get().isAuthenticated) {
      get().loadDraft(formType);
    }
  },

  fetchSchema: async (formType) => {
    const targetForm = formType || get().activeFormType;
    set({ isLoadingSchema: true, schemaError: null });
    try {
      const res = await api.get(`/schemas/${targetForm}`);
      const schema = res.data.data;
      set({ activeSchema: schema, isLoadingSchema: false });
      get().recalculateMissingFields();
    } catch (err) {
      set({
        schemaError: err.response?.data?.error?.message || 'Failed to fetch form schema',
        isLoadingSchema: false,
      });
    }
  },

  updateFieldValue: (fieldId, value) => {
    const currentData = { ...get().formData };
    
    // Set dot-notation path into object
    const parts = fieldId.split('.');
    let target = currentData;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!target[parts[i]]) target[parts[i]] = {};
      target = target[parts[i]];
    }
    target[parts[parts.length - 1]] = value;

    set({ formData: currentData });
    get().recalculateMissingFields();
  },

  extractFromNarrative: async (narrativeText) => {
    const formType = get().activeFormType;
    set({ isExtracting: true, extractionError: null, narrativeText });

    try {
      const res = await api.post('/extraction/extract', {
        formType,
        narrativeText,
      });

      const { extractedData, confidenceScores, lowConfidenceFields, missingFields } = res.data.data;

      // Merge extracted fields into current form data
      const mergedFormData = { ...get().formData };
      for (const [key, val] of Object.entries(extractedData)) {
        const parts = key.split('.');
        let target = mergedFormData;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!target[parts[i]]) target[parts[i]] = {};
          target = target[parts[i]];
        }
        target[parts[parts.length - 1]] = val;
      }

      set({
        formData: mergedFormData,
        extractedMetadata: confidenceScores || {},
        lowConfidenceFields: lowConfidenceFields || [],
        missingFields: missingFields || [],
        isExtracting: false,
      });

      get().recalculateMissingFields();
      
      if (get().isAuthenticated) {
        get().saveDraft();
      }
    } catch (err) {
      set({
        extractionError: err.response?.data?.error?.message || 'AI extraction failed. Please fill the form manually.',
        isExtracting: false,
      });
    }
  },

  recalculateMissingFields: () => {
    const schema = get().activeSchema;
    const formData = get().formData;
    if (!schema) return;

    const missing = [];
    let totalRequired = 0;

    for (const section of schema.sections || []) {
      if (section.showIf && !evaluateRule(section.showIf, formData)) continue;

      for (const field of section.fields || []) {
        if (field.showIf && !evaluateRule(field.showIf, formData)) continue;

        if (field.validation?.required) {
          totalRequired++;
          const val = getNestedValue(formData, field.id);
          if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
            missing.push(field.id);
          }
        }
      }
    }

    const filledCount = Math.max(0, totalRequired - missing.length);
    const completion = totalRequired > 0 ? Math.round((filledCount / totalRequired) * 100) : 100;

    set({ missingFields: missing, completionPercentage: completion });
  },

  loadDraft: async (formType) => {
    try {
      const target = formType || get().activeFormType;
      const res = await api.get(`/drafts/${target}`);
      if (res.data?.data) {
        const draft = res.data.data;
        set({
          formData: draft.data || {},
          extractedMetadata: draft.extractedMetadata || {},
          lastSavedAt: draft.updatedAt,
        });
        get().recalculateMissingFields();
      }
    } catch (_err) {
      // Draft not found is okay
    }
  },

  saveDraft: async () => {
    if (!get().isAuthenticated) return;
    set({ isSavingDraft: true });
    try {
      const formType = get().activeFormType;
      const schema = get().activeSchema;
      const res = await api.post(`/drafts/${formType}`, {
        schemaVersion: schema?.version || 1,
        data: get().formData,
        extractedMetadata: get().extractedMetadata,
        idempotencyKey: `save_${Date.now()}`,
      });
      set({ isSavingDraft: false, lastSavedAt: res.data.data.updatedAt });
    } catch (_err) {
      set({ isSavingDraft: false });
    }
  },

  submitForm: async () => {
    set({ isSubmitting: true, submitError: null });
    try {
      const formType = get().activeFormType;
      await api.post(`/submissions/${formType}`, {
        data: get().formData,
        narrativeText: get().narrativeText,
      });
      set({ isSubmitting: false, submissionSuccess: true, formData: {}, extractedMetadata: {}, missingFields: [] });
    } catch (err) {
      set({
        submitError: err.response?.data?.error?.message || 'Failed to submit form',
        isSubmitting: false,
      });
    }
  },

  fetchSubmissions: async () => {
    try {
      const res = await api.get('/submissions');
      set({ userSubmissions: res.data.data });
    } catch (_err) {
      // Ignore
    }
  },
}));

function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') return undefined;
    current = current[part];
  }
  return current;
}
