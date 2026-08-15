import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook to auto-save form state to localStorage and restore on refresh.
 *
 * @param draftKey - Unique key for the modal/wizard (e.g., 'draft_new_project')
 * @param initialValues - Default values for the form
 * @param enabled - Whether auto-saving is active (usually when modal is open)
 */
export function useFormDraft<T extends Record<string, any>>(
  draftKey: string,
  initialValues: T,
  enabled: boolean = true
) {
  const [formData, setFormData] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initialValues, ...parsed };
      }
    } catch (e) {
      console.warn(`Failed to parse draft for key "${draftKey}"`, e);
    }
    return initialValues;
  });

  const [hasSavedDraft, setHasSavedDraft] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem(draftKey);
    } catch {
      return false;
    }
  });

  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync to localStorage with small debounce
  useEffect(() => {
    if (!enabled) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify(formData));
        setHasSavedDraft(true);
        setLastSavedAt(new Date());
      } catch (e) {
        console.warn(`Failed to save draft for key "${draftKey}"`, e);
      }
    }, 400);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [draftKey, formData, enabled]);

  // Update a single field
  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Set multiple fields
  const updateFields = useCallback((fields: Partial<T>) => {
    setFormData((prev) => ({
      ...prev,
      ...fields,
    }));
  }, []);

  // Clear draft upon successful submission or user reset
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey);
      setHasSavedDraft(false);
      setLastSavedAt(null);
      setFormData(initialValues);
    } catch (e) {
      console.warn(`Failed to clear draft for key "${draftKey}"`, e);
    }
  }, [draftKey, initialValues]);

  return {
    formData,
    setFormData,
    updateField,
    updateFields,
    clearDraft,
    hasSavedDraft,
    lastSavedAt,
  };
}
