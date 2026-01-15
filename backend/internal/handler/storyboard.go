package handler

import (
	"encoding/base64"
	"fmt"
	"net/http"
	"strings"

	"storyboard-generator/internal/model"
	"storyboard-generator/internal/service"
	"storyboard-generator/pkg/gemini"

	"github.com/gin-gonic/gin"
)

// decodeDataURL decodes a base64 data URL and returns the raw bytes
func decodeDataURL(dataURL string) ([]byte, error) {
	// Expected format: data:image/png;base64,<base64data>
	if !strings.HasPrefix(dataURL, "data:") {
		return nil, fmt.Errorf("invalid data URL format")
	}

	// Find the comma that separates metadata from data
	commaIndex := strings.Index(dataURL, ",")
	if commaIndex == -1 {
		return nil, fmt.Errorf("invalid data URL format: no comma found")
	}

	// Extract and decode the base64 data
	base64Data := dataURL[commaIndex+1:]
	return base64.StdEncoding.DecodeString(base64Data)
}

// StoryboardHandler handles HTTP requests for storyboard operations
type StoryboardHandler struct {
	scriptParser   *service.ScriptParser
	imageGenerator *gemini.Client
}

// NewStoryboardHandler creates a new StoryboardHandler
func NewStoryboardHandler(scriptParser *service.ScriptParser, imageGenerator *gemini.Client) *StoryboardHandler {
	return &StoryboardHandler{
		scriptParser:   scriptParser,
		imageGenerator: imageGenerator,
	}
}

// Analyze analyzes a script to extract characters
// POST /api/v1/storyboard/analyze
func (h *StoryboardHandler) Analyze(c *gin.Context) {
	var req model.AnalyzeScriptRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_REQUEST",
				"message": "请求参数无效",
				"details": err.Error(),
			},
		})
		return
	}

	// Parse characters from script
	result, err := h.scriptParser.ParseCharacters(c.Request.Context(), req.Script, req.Style)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "ANALYZE_FAILED",
				"message": "剧本分析失败",
				"details": err.Error(),
			},
		})
		return
	}

	// Convert to response format
	characters := make([]model.CharacterInfo, len(result.Characters))
	for i, char := range result.Characters {
		characters[i] = model.CharacterInfo{
			Name:        char.Name,
			Description: char.Description,
		}
	}

	c.JSON(http.StatusOK, model.AnalyzeScriptResponse{
		Characters: characters,
	})
}

// GenerateCharacterImage generates a reference image for a character
// POST /api/v1/characters/:id/generate-image
func (h *StoryboardHandler) GenerateCharacterImage(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_ID",
				"message": "角色 ID 不能为空",
			},
		})
		return
	}

	var req model.GenerateImageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_REQUEST",
				"message": "请求参数无效",
				"details": err.Error(),
			},
		})
		return
	}

	// Generate character image using Gemini
	result, err := h.imageGenerator.GenerateCharacterReference(
		c.Request.Context(),
		req.Script,
		req.CharacterName,
		req.CharacterDescription,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "GENERATE_FAILED",
				"message": "生成角色图像失败",
				"details": err.Error(),
			},
		})
		return
	}

	// Return base64 image as data URL
	imageURL := "data:" + result.MimeType + ";base64," + result.Base64Image

	c.JSON(http.StatusOK, model.GenerateImageResponse{
		ImageURL: imageURL,
	})
}

// GenerateGrid9 generates a 3x3 grid storyboard image
// POST /api/v1/storyboard/generate-grid9
func (h *StoryboardHandler) GenerateGrid9(c *gin.Context) {
	var req model.GenerateGrid9Request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_REQUEST",
				"message": "请求参数无效",
				"details": err.Error(),
			},
		})
		return
	}

	// Check if Gemini client is available
	if h.imageGenerator == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": gin.H{
				"code":    "SERVICE_UNAVAILABLE",
				"message": "AI 服务不可用，请检查 GEMINI_API_KEY 配置",
			},
		})
		return
	}

	// Convert model.CharacterRef to gemini.CharacterRef
	characters := make([]gemini.CharacterRef, len(req.Characters))
	for i, char := range req.Characters {
		characters[i] = gemini.CharacterRef{
			Name:           char.Name,
			ReferenceImage: char.ReferenceImage,
		}
	}

	// Generate 9-grid storyboard using Gemini
	result, err := h.imageGenerator.GenerateGrid9(
		c.Request.Context(),
		req.Script,
		req.Style,
		characters,
		req.PromptTemplate,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "GENERATE_FAILED",
				"message": "生成九宫格分镜失败",
				"details": err.Error(),
			},
		})
		return
	}

	// Return base64 image as data URL
	imageURL := "data:" + result.MimeType + ";base64," + result.Base64Image

	c.JSON(http.StatusOK, model.GenerateImageResponse{
		ImageURL: imageURL,
	})
}

// GenerateGrid4 generates a 2x2 grid multi-angle view
// POST /api/v1/storyboard/generate-grid4
func (h *StoryboardHandler) GenerateGrid4(c *gin.Context) {
	var req model.GenerateGrid4Request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_REQUEST",
				"message": "请求参数无效",
				"details": err.Error(),
			},
		})
		return
	}

	// Check if Gemini client is available
	if h.imageGenerator == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": gin.H{
				"code":    "SERVICE_UNAVAILABLE",
				"message": "AI 服务不可用，请检查 GEMINI_API_KEY 配置",
			},
		})
		return
	}

	// Decode source image from base64 data URL
	sourceImageData, err := decodeDataURL(req.SourceImage)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_IMAGE",
				"message": "无效的图像数据",
				"details": err.Error(),
			},
		})
		return
	}

	// Generate 4-grid multi-angle view using Gemini
	result, err := h.imageGenerator.GenerateGrid4(
		c.Request.Context(),
		sourceImageData,
		req.CellIndex,
		req.MainCharacter,
		req.PromptTemplate,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "GENERATE_FAILED",
				"message": "生成四宫格多角度视图失败",
				"details": err.Error(),
			},
		})
		return
	}

	// Return base64 image as data URL
	imageURL := "data:" + result.MimeType + ";base64," + result.Base64Image

	c.JSON(http.StatusOK, model.GenerateImageResponse{
		ImageURL: imageURL,
	})
}

// HDRedraw performs high-definition redraw of a selected angle
// POST /api/v1/storyboard/hd-redraw
func (h *StoryboardHandler) HDRedraw(c *gin.Context) {
	var req model.HDRedrawRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_REQUEST",
				"message": "请求参数无效",
				"details": err.Error(),
			},
		})
		return
	}

	// Check if Gemini client is available
	if h.imageGenerator == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": gin.H{
				"code":    "SERVICE_UNAVAILABLE",
				"message": "AI 服务不可用，请检查 GEMINI_API_KEY 配置",
			},
		})
		return
	}

	// Decode source image from base64 data URL
	sourceImageData, err := decodeDataURL(req.SourceImage)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_IMAGE",
				"message": "无效的图像数据",
				"details": err.Error(),
			},
		})
		return
	}

	// Perform HD redraw using Gemini
	result, err := h.imageGenerator.GenerateHDRedraw(
		c.Request.Context(),
		sourceImageData,
		req.Angle,
		req.PromptTemplate,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "GENERATE_FAILED",
				"message": "高清重绘失败",
				"details": err.Error(),
			},
		})
		return
	}

	// Return base64 image as data URL
	imageURL := "data:" + result.MimeType + ";base64," + result.Base64Image

	c.JSON(http.StatusOK, model.GenerateImageResponse{
		ImageURL: imageURL,
	})
}
