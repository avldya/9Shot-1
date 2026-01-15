package gemini

import (
	"context"
	"fmt"
	"time"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

// Config holds the configuration for the Gemini client
type Config struct {
	APIKey     string
	MaxRetries int
	RetryDelay time.Duration
	Timeout    time.Duration
	FlashModel string
	ImageModel string
}

// DefaultConfig returns a default configuration
func DefaultConfig() Config {
	return Config{
		MaxRetries: 3,
		RetryDelay: time.Second * 2,
		Timeout:    time.Second * 60,
		FlashModel: "gemini-2.5-flash-preview-05-20",
		ImageModel: "gemini-2.0-flash-preview-image-generation",
	}
}

// Client is the Gemini API client
type Client struct {
	config      Config
	genaiClient *genai.Client
}

// NewClient creates a new Gemini client
func NewClient(ctx context.Context, apiKey string) (*Client, error) {
	return NewClientWithConfig(ctx, apiKey, DefaultConfig())
}

// NewClientWithConfig creates a new Gemini client with custom configuration
func NewClientWithConfig(ctx context.Context, apiKey string, config Config) (*Client, error) {
	if apiKey == "" {
		return nil, fmt.Errorf("API key is required")
	}

	config.APIKey = apiKey

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return nil, fmt.Errorf("failed to create genai client: %w", err)
	}

	return &Client{
		config:      config,
		genaiClient: client,
	}, nil
}

// Close closes the Gemini client
func (c *Client) Close() error {
	if c.genaiClient != nil {
		return c.genaiClient.Close()
	}
	return nil
}

// GetFlashModel returns the flash model name
func (c *Client) GetFlashModel() string {
	return c.config.FlashModel
}

// GetImageModel returns the image model name
func (c *Client) GetImageModel() string {
	return c.config.ImageModel
}

// GetConfig returns the client configuration
func (c *Client) GetConfig() Config {
	return c.config
}

// withRetry executes a function with retry logic
func (c *Client) withRetry(ctx context.Context, fn func() error) error {
	var lastErr error
	for i := 0; i <= c.config.MaxRetries; i++ {
		if i > 0 {
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(c.config.RetryDelay * time.Duration(i)):
			}
		}

		if err := fn(); err != nil {
			lastErr = err
			continue
		}
		return nil
	}
	return fmt.Errorf("max retries exceeded: %w", lastErr)
}
