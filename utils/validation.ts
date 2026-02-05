
// A map of validation error messages.
const ERROR_MESSAGES: Record<string, (val?: any) => string> = {
  required: () => 'This field is required.',
  maxLength: (val) => `Input cannot exceed ${val} characters.`,
  noSpecialChars: () => 'Input contains invalid characters. Only letters, numbers, and basic punctuation (.,-\') are allowed.',
};

// --- SECURITY SANITIZATION ---
/**
 * Sanitizes a string to be safely included in a prompt for a Large Language Model.
 * It removes characters that could be interpreted as control characters, code, or prompt directives.
 * This is a critical defense against Prompt Injection.
 * @param input The raw string from user input.
 * @returns A sanitized string.
 */
export const sanitizeForLLM = (input: string): string => {
  if (typeof input !== 'string') return '';
  // Removes backticks, HTML tags, and curly braces that could be used for injection.
  return input.replace(/[`<>{}]/g, '');
};


// --- CLIENT-SIDE VALIDATION ---
const VALIDATION_RULES: Record<string, (value: string, ruleValue?: any) => boolean> = {
  required: (value) => value.trim() !== '',
  maxLength: (value, length) => value.length <= length,
  // SECURITY: Regex to check for potentially malicious characters on the client-side.
  // This is a defense-in-depth measure. The primary sanitization happens on the server.
  noSpecialChars: (value) => /^[\w\s.,'-]*$/.test(value),
};

export type ValidationRule = 
  | { type: 'required' }
  | { type: 'maxLength', value: number }
  | { type: 'noSpecialChars' };

/**
 * Validates a single value against a set of rules.
 * @param value The value to validate.
 * @param rules An array of validation rules.
 * @returns An error message string if validation fails, otherwise null.
 */
export const validateField = (value: string, rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    const validator = VALIDATION_RULES[rule.type];
    const ruleValue = 'value' in rule ? rule.value : undefined;

    if (validator && !validator(value, ruleValue)) {
      return ERROR_MESSAGES[rule.type](ruleValue);
    }
  }
  return null;
};
