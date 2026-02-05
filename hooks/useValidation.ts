
import { useState, useCallback } from 'react';
import { validateField, ValidationRule } from '../utils/validation';

type FormValues = Record<string, string>;
type FormErrors = Record<string, string | null>;
type ValidationRules = Record<string, ValidationRule[]>;

interface UseValidationProps {
  initialValues: FormValues;
  rules: ValidationRules;
}

export const useValidation = ({ initialValues, rules }: UseValidationProps) => {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Update the value first
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Then validate it
    const fieldRules = rules[name];
    if (fieldRules) {
      const errorMessage = validateField(value, fieldRules);
      setErrors(prev => ({
        ...prev,
        [name]: errorMessage,
      }));
    }
  }, [rules]);
  
  const validateAll = useCallback(() => {
    const newErrors: FormErrors = {};
    let isFormValid = true;

    for (const fieldName in rules) {
      const value = values[fieldName] || '';
      const fieldRules = rules[fieldName];
      const errorMessage = validateField(value, fieldRules);
      if (errorMessage) {
        newErrors[fieldName] = errorMessage;
        isFormValid = false;
      }
    }
    setErrors(newErrors);
    return isFormValid;
  }, [values, rules]);

  return {
    values,
    errors,
    setValues,
    validate,
    validateAll,
  };
};
