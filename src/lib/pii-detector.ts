// PII Detection utility - client-side validation following frontend rules
// Lightweight regex checks to prevent PII before submission

interface PIIDetectionResult {
  hasPII: boolean;
  detectedTypes: string[];
  warnings: string[];
}

export class PIIDetector {
  private static readonly patterns = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    ssn: /\b\d{3}-?\d{2}-?\d{4}\b/g,
    creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    // Common name patterns (very basic detection)
    fullName: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,
    // National ID patterns (basic)
    nationalId: /\b\d{9,11}\b/g,
  };

  static detect(text: string): PIIDetectionResult {
    const detectedTypes: string[] = [];
    const warnings: string[] = [];

    // Check each pattern
    Object.entries(this.patterns).forEach(([type, pattern]) => {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        detectedTypes.push(type);
        
        switch (type) {
          case 'email':
            warnings.push('Email addresses detected. Remove to protect privacy.');
            break;
          case 'phone':
            warnings.push('Phone numbers detected. Remove to protect privacy.');
            break;
          case 'ssn':
            warnings.push('Social Security Numbers detected. Remove immediately.');
            break;
          case 'creditCard':
            warnings.push('Credit card numbers detected. Remove immediately.');
            break;
          case 'fullName':
            warnings.push('Possible full names detected. Consider using initials or pseudonyms.');
            break;
          case 'nationalId':
            warnings.push('Possible ID numbers detected. Remove to protect privacy.');
            break;
        }
      }
    });

    return {
      hasPII: detectedTypes.length > 0,
      detectedTypes,
      warnings,
    };
  }

  static sanitize(text: string): string {
    let sanitized = text;
    
    // Replace emails with [EMAIL]
    sanitized = sanitized.replace(this.patterns.email, '[EMAIL]');
    
    // Replace phone numbers with [PHONE]
    sanitized = sanitized.replace(this.patterns.phone, '[PHONE]');
    
    // Replace SSNs with [SSN]
    sanitized = sanitized.replace(this.patterns.ssn, '[SSN]');
    
    // Replace credit cards with [CARD]
    sanitized = sanitized.replace(this.patterns.creditCard, '[CARD]');
    
    return sanitized;
  }

  static validateBeforeSubmission(text: string): {
    isValid: boolean;
    errors: string[];
    sanitizedText?: string;
  } {
    const detection = this.detect(text);
    
    if (!detection.hasPII) {
      return {
        isValid: true,
        errors: [],
        sanitizedText: text,
      };
    }

    // High-risk PII types that should block submission
    const highRiskTypes = ['ssn', 'creditCard', 'email', 'phone'];
    const hasHighRiskPII = detection.detectedTypes.some(type => 
      highRiskTypes.includes(type)
    );

    if (hasHighRiskPII) {
      return {
        isValid: false,
        errors: [
          'Your post contains sensitive personal information.',
          'Please remove all email addresses, phone numbers, and ID numbers before posting.',
          ...detection.warnings,
        ],
      };
    }

    // Medium-risk PII gets a warning but allows posting with sanitization
    return {
      isValid: true,
      errors: [
        'Possible personal information detected.',
        'Consider reviewing your post for privacy.',
        ...detection.warnings,
      ],
      sanitizedText: this.sanitize(text),
    };
  }
}
