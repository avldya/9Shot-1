package gemini

import (
	"context"
	"encoding/base64"
	"fmt"

	"github.com/google/generative-ai-go/genai"
)

// ImageGenerationRequest represents a request for image generation
type ImageGenerationRequest struct {
	Prompt         string
	Style          string
	Characters     []CharacterRef
	ReferenceImage []byte // Optional reference image
	Width          int
	Height         int
}

// CharacterRef represents a character reference for image generation
type CharacterRef struct {
	Name           string
	Description    string
	ReferenceImage string // URL or base64
}

// ImageGenerationResponse represents the response from image generation
type ImageGenerationResponse struct {
	ImageData   []byte
	MimeType    string
	Base64Image string
}

// GenerateImage uses Gemini to generate an image
func (c *Client) GenerateImage(ctx context.Context, req ImageGenerationRequest) (*ImageGenerationResponse, error) {
	if req.Prompt == "" {
		return nil, fmt.Errorf("prompt is required")
	}

	model := c.genaiClient.GenerativeModel(c.config.ImageModel)
	model.SetTemperature(1.0)

	// Enable image generation
	model.GenerationConfig.ResponseMIMEType = "image/png"

	var response *ImageGenerationResponse
	var lastErr error

	err := c.withRetry(ctx, func() error {
		// Build the prompt with character information
		fullPrompt := req.Prompt
		if req.Style != "" {
			fullPrompt = fmt.Sprintf("风格: %s\n\n%s", req.Style, fullPrompt)
		}
		if len(req.Characters) > 0 {
			fullPrompt += "\n\n角色信息:"
			for _, char := range req.Characters {
				fullPrompt += fmt.Sprintf("\n- %s: %s", char.Name, char.Description)
			}
		}

		var parts []genai.Part
		parts = append(parts, genai.Text(fullPrompt))

		// Add reference image if provided
		if len(req.ReferenceImage) > 0 {
			parts = append(parts, genai.ImageData("image/png", req.ReferenceImage))
		}

		resp, err := model.GenerateContent(ctx, parts...)
		if err != nil {
			lastErr = err
			return err
		}

		if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
			lastErr = fmt.Errorf("empty response from Gemini")
			return lastErr
		}

		// Extract image data from response
		for _, part := range resp.Candidates[0].Content.Parts {
			if blob, ok := part.(genai.Blob); ok {
				response = &ImageGenerationResponse{
					ImageData:   blob.Data,
					MimeType:    blob.MIMEType,
					Base64Image: base64.StdEncoding.EncodeToString(blob.Data),
				}
				return nil
			}
		}

		lastErr = fmt.Errorf("no image data in response")
		return lastErr
	})

	if err != nil {
		return nil, fmt.Errorf("image generation failed: %w", lastErr)
	}

	return response, nil
}

// GenerateGrid9 generates a 3x3 grid storyboard image
func (c *Client) GenerateGrid9(ctx context.Context, script, style string, characters []CharacterRef, promptTemplate string) (*ImageGenerationResponse, error) {
	prompt := promptTemplate
	if prompt == "" {
		prompt = `请根据以下剧本内容生成一个3x3的九宫格分镜图。
每个格子代表一个连续的场景，按照从左到右、从上到下的顺序展示故事发展。
请确保：
1. 画面风格统一
2. 角色形象一致
3. 场景连贯有序
4. 每个分镜清晰可辨`
	}

	return c.GenerateImage(ctx, ImageGenerationRequest{
		Prompt:     prompt + "\n\n剧本:\n" + script,
		Style:      style,
		Characters: characters,
	})
}

// GenerateGrid4 generates a 2x2 grid with multiple angles
func (c *Client) GenerateGrid4(ctx context.Context, sourceImage []byte, cellIndex int, mainCharacter string, promptTemplate string) (*ImageGenerationResponse, error) {
	prompt := promptTemplate
	if prompt == "" {
		prompt = fmt.Sprintf(`基于提供的分镜图（第%d格），生成一个2x2的四宫格多角度视图：
- 左上：远景（wide shot）- 展示完整场景和环境
- 右上：中景（medium shot）- 展示角色半身和部分环境
- 左下：近景（close shot）- 展示角色上半身和表情
- 右下：特写（extreme close-up）- 展示关键细节或表情特写

主要角色: %s

请确保四个角度的画面风格一致，角色形象统一。`, cellIndex+1, mainCharacter)
	}

	return c.GenerateImage(ctx, ImageGenerationRequest{
		Prompt:         prompt,
		ReferenceImage: sourceImage,
	})
}

// GenerateHDRedraw performs high-definition redraw of an image
func (c *Client) GenerateHDRedraw(ctx context.Context, sourceImage []byte, angle string, promptTemplate string) (*ImageGenerationResponse, error) {
	angleLabels := map[string]string{
		"wide":    "远景",
		"medium":  "中景",
		"close":   "近景",
		"extreme": "特写",
	}

	angleLabel := angleLabels[angle]
	if angleLabel == "" {
		angleLabel = angle
	}

	prompt := promptTemplate
	if prompt == "" {
		prompt = fmt.Sprintf(`请对这张%s分镜图进行高清重绘：
1. 提升画面分辨率和细节
2. 优化光影效果
3. 增强色彩表现
4. 保持原有构图和角色形象
5. 输出高质量的最终分镜图`, angleLabel)
	}

	return c.GenerateImage(ctx, ImageGenerationRequest{
		Prompt:         prompt,
		ReferenceImage: sourceImage,
	})
}

// GenerateCharacterReference generates a character reference image
func (c *Client) GenerateCharacterReference(ctx context.Context, script, characterName, characterDescription string) (*ImageGenerationResponse, error) {
	prompt := fmt.Sprintf(`请为以下角色生成一张人物设定图：

角色名称: %s
角色描述: %s

剧本背景:
%s

要求：
1. 展示角色的正面全身形象
2. 体现角色的性格特点和外貌特征
3. 画风统一，适合用于分镜参考
4. 背景简洁，突出角色本身`, characterName, characterDescription, script)

	return c.GenerateImage(ctx, ImageGenerationRequest{
		Prompt: prompt,
	})
}
