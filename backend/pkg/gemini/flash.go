package gemini

import (
	"context"
	"fmt"

	"github.com/google/generative-ai-go/genai"
)

// TextAnalysisRequest represents a request for text analysis
type TextAnalysisRequest struct {
	Prompt string
	Script string
	Style  string
}

// TextAnalysisResponse represents the response from text analysis
type TextAnalysisResponse struct {
	Content string
}

// AnalyzeText uses Gemini 2.5 Flash to analyze text content
func (c *Client) AnalyzeText(ctx context.Context, req TextAnalysisRequest) (*TextAnalysisResponse, error) {
	if req.Prompt == "" {
		return nil, fmt.Errorf("prompt is required")
	}

	model := c.genaiClient.GenerativeModel(c.config.FlashModel)
	model.SetTemperature(0.7)

	var response *TextAnalysisResponse
	var lastErr error

	err := c.withRetry(ctx, func() error {
		// Build the full prompt
		fullPrompt := req.Prompt
		if req.Script != "" {
			fullPrompt = fmt.Sprintf("%s\n\n剧本内容:\n%s", req.Prompt, req.Script)
		}
		if req.Style != "" {
			fullPrompt = fmt.Sprintf("%s\n\n风格: %s", fullPrompt, req.Style)
		}

		resp, err := model.GenerateContent(ctx, genai.Text(fullPrompt))
		if err != nil {
			lastErr = err
			return err
		}

		if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
			lastErr = fmt.Errorf("empty response from Gemini")
			return lastErr
		}

		// Extract text content from response
		var content string
		for _, part := range resp.Candidates[0].Content.Parts {
			if text, ok := part.(genai.Text); ok {
				content += string(text)
			}
		}

		response = &TextAnalysisResponse{
			Content: content,
		}
		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("text analysis failed: %w", lastErr)
	}

	return response, nil
}

// AnalyzeCharacters analyzes a script to extract character information
func (c *Client) AnalyzeCharacters(ctx context.Context, script, style string) (*TextAnalysisResponse, error) {
	prompt := `请分析以下剧本内容，提取所有角色信息。
请以JSON格式返回，格式如下：
{
  "characters": [
    {
      "name": "角色名称",
      "description": "角色描述，包括外貌特征、性格特点等"
    }
  ]
}

请确保：
1. 提取所有出现的角色
2. 描述要详细，便于后续生成角色形象
3. 只返回JSON，不要其他内容`

	return c.AnalyzeText(ctx, TextAnalysisRequest{
		Prompt: prompt,
		Script: script,
		Style:  style,
	})
}
