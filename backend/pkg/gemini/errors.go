package gemini

import (
	"errors"
	"strings"
)

// Common errors
var (
	ErrAPIKeyRequired     = errors.New("API key is required")
	ErrPromptRequired     = errors.New("prompt is required")
	ErrEmptyResponse      = errors.New("empty response from Gemini")
	ErrNoImageData        = errors.New("no image data in response")
	ErrMaxRetriesExceeded = errors.New("max retries exceeded")
	ErrRateLimited        = errors.New("rate limited by Gemini API")
	ErrContentFiltered    = errors.New("content was filtered by safety settings")
	ErrServiceUnavailable = errors.New("Gemini service is unavailable")
)

// IsRateLimitError checks if the error is a rate limit error
func IsRateLimitError(err error) bool {
	if err == nil {
		return false
	}
	errStr := err.Error()
	return strings.Contains(errStr, "429") ||
		strings.Contains(errStr, "rate limit") ||
		strings.Contains(errStr, "quota exceeded")
}

// IsContentFilterError checks if the error is a content filter error
func IsContentFilterError(err error) bool {
	if err == nil {
		return false
	}
	errStr := err.Error()
	return strings.Contains(errStr, "safety") ||
		strings.Contains(errStr, "blocked") ||
		strings.Contains(errStr, "content filter")
}

// IsServiceUnavailableError checks if the error is a service unavailable error
func IsServiceUnavailableError(err error) bool {
	if err == nil {
		return false
	}
	errStr := err.Error()
	return strings.Contains(errStr, "503") ||
		strings.Contains(errStr, "unavailable") ||
		strings.Contains(errStr, "service error")
}

// ClassifyError classifies an error into a known error type
func ClassifyError(err error) error {
	if err == nil {
		return nil
	}

	if IsRateLimitError(err) {
		return ErrRateLimited
	}
	if IsContentFilterError(err) {
		return ErrContentFiltered
	}
	if IsServiceUnavailableError(err) {
		return ErrServiceUnavailable
	}

	return err
}
