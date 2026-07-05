export type DocumentValidationResult = {
  valid: boolean;
  errors: string[];
};

export class DocumentValidationService {
  static validate(file: File | null): DocumentValidationResult {
    const errors: string[] = [];

    if (!file) {
      errors.push("No file selected.");
    }

    if (file && file.size === 0) {
      errors.push("File is empty.");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
