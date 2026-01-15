package handler

import (
	"net/http"

	"storyboard-generator/internal/model"
	"storyboard-generator/internal/repository"
	"storyboard-generator/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// CharacterHandler handles HTTP requests for character management
type CharacterHandler struct {
	repo         *repository.CharacterRepository
	scriptParser *service.ScriptParser
}

// NewCharacterHandler creates a new CharacterHandler
func NewCharacterHandler(repo *repository.CharacterRepository, scriptParser *service.ScriptParser) *CharacterHandler {
	return &CharacterHandler{
		repo:         repo,
		scriptParser: scriptParser,
	}
}

// List returns all characters
// GET /api/v1/characters
func (h *CharacterHandler) List(c *gin.Context) {
	characters, err := h.repo.List(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "LIST_FAILED",
				"message": "获取角色列表失败",
				"details": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, characters)
}

// GetByID returns a character by ID
// GET /api/v1/characters/:id
func (h *CharacterHandler) GetByID(c *gin.Context) {
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

	character, err := h.repo.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "GET_FAILED",
				"message": "获取角色失败",
				"details": err.Error(),
			},
		})
		return
	}

	if character == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": gin.H{
				"code":    "NOT_FOUND",
				"message": "角色不存在",
			},
		})
		return
	}

	c.JSON(http.StatusOK, character)
}

// Create creates a new character
// POST /api/v1/characters
func (h *CharacterHandler) Create(c *gin.Context) {
	var req model.CreateCharacterRequest
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

	character := &model.Character{
		ID:             uuid.New().String(),
		ProjectID:      req.ProjectID,
		Name:           req.Name,
		Description:    req.Description,
		ReferenceImage: req.ReferenceImage,
	}

	if err := h.repo.Create(c.Request.Context(), character); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "CREATE_FAILED",
				"message": "创建角色失败",
				"details": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusCreated, character)
}

// Update updates a character
// PUT /api/v1/characters/:id
func (h *CharacterHandler) Update(c *gin.Context) {
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

	var req model.UpdateCharacterRequest
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

	// Get existing character
	character, err := h.repo.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "GET_FAILED",
				"message": "获取角色失败",
				"details": err.Error(),
			},
		})
		return
	}

	if character == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": gin.H{
				"code":    "NOT_FOUND",
				"message": "角色不存在",
			},
		})
		return
	}

	// Update fields if provided
	if req.Name != nil {
		character.Name = *req.Name
	}
	if req.Description != nil {
		character.Description = *req.Description
	}
	if req.ReferenceImage != nil {
		character.ReferenceImage = *req.ReferenceImage
	}

	if err := h.repo.Update(c.Request.Context(), character); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "UPDATE_FAILED",
				"message": "更新角色失败",
				"details": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, character)
}

// Delete deletes a character
// DELETE /api/v1/characters/:id
func (h *CharacterHandler) Delete(c *gin.Context) {
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

	if err := h.repo.Delete(c.Request.Context(), id); err != nil {
		if err.Error() == "character not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"error": gin.H{
					"code":    "NOT_FOUND",
					"message": "角色不存在",
				},
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "DELETE_FAILED",
				"message": "删除角色失败",
				"details": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "角色已删除",
	})
}
