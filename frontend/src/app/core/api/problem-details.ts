export interface ValidationProblemDetails {
  title?: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string[]>;
}

export function extractErrorMessage(error: unknown): string {
  const fallback = 'Something went wrong. Please try again.';

  if (typeof error !== 'object' || error === null) {
    return fallback;
  }

  const candidate = error as { error?: unknown; message?: unknown };

  if (typeof candidate.message === 'string' && candidate.message.trim()) {
    return candidate.message;
  }

  if (typeof candidate.error === 'object' && candidate.error !== null) {
    const payload = candidate.error as { message?: unknown; detail?: unknown };

    if (typeof payload.message === 'string' && payload.message.trim()) {
      return payload.message;
    }

    if (typeof payload.detail === 'string' && payload.detail.trim()) {
      return payload.detail;
    }
  }

  return fallback;
}

export function extractFieldErrors(error: unknown): Record<string, string[]> {
  if (typeof error !== 'object' || error === null) {
    return {};
  }

  const candidate = error as { error?: ValidationProblemDetails };
  if (candidate.error?.errors) {
    return candidate.error.errors;
  }

  return {};
}
