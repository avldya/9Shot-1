package handler

import (
	"net/http"
	"strings"

	"storyboard-generator/internal/model"
	"storyboard-generator/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// AssetHandler handles HTTP requests for asset management
type AssetHandler struct {
	assetRepo    *repository.AssetRepository
	categoryRepo *repository.CategoryRepository
}

// NewAssetHandler creates a new AssetHandler
func NewAssetHandler(assetRepo *repository.AssetRepository, categoryRepo *repository.CategoryRepository) *AssetHandler {
	return &AssetHandler{
		assetRepo:    assetRepo,
		categoryRepo: categoryRepo,
	}
}

// ListAssets returns assets with optional filtering
// GET /api/v1/assets?category={categoryId}&tags={tag1,tag2}&page={page}&size={size}
func (h *AssetHandler) ListAssets(c *gin.Context) {
	var query model.AssetListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_QUERY",
				"message": "查询参数无效",
				"details": err.Error(),
			},
		})
		return
	}

	// Parse tags
	var tagNames []string
	if query.Tags != "" {
		tagNames = strings.Split(query.Tags, ",")
		for i := range tagNames {
			tagNames[i] = strings.TrimSpace(tagNames[i])
		}
	}

	assets, total, err := h.assetRepo.List(c.Request.Context(), query.CategoryID, tagNames, query.Page, query.Size)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "LIST_FAILED",
				"message": "获取素材列表失败",
				"details": err.Error(),
			},
		})
		return
	}

	// Convert to response format
	var responses []model.AssetResponse
	for _, asset := range assets {
		var tagStrs []string
		for _, tag := range asset.Tags {
			tagStrs = append(tagStrs, tag.Name)
		}
		categoryName := ""
		if asset.Category != nil {
			categoryName = asset.Category.Name
		}
		responses = append(responses, model.AssetResponse{
			ID:           asset.ID,
			CategoryID:   asset.CategoryID,
			CategoryName: categoryName,
			ImageURL:     asset.ImageURL,
			ThumbnailURL: asset.ThumbnailURL,
			SourceType:   asset.SourceType,
			Metadata:     asset.Metadata,
			Tags:         tagStrs,
			CreatedAt:    asset.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"assets": responses,
		"total":  total,
		"page":   query.Page,
		"size":   query.Size,
	})
}

// GetAsset returns an asset by ID
// GET /api/v1/assets/:id
func (h *AssetHandler) GetAsset(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_ID",
				"message": "素材 ID 不能为空",
			},
		})
		return
	}

	asset, err := h.assetRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "GET_FAILED",
				"message": "获取素材失败",
				"details": err.Error(),
			},
		})
		return
	}

	if asset == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": gin.H{
				"code":    "NOT_FOUND",
				"message": "素材不存在",
			},
		})
		return
	}

	// Convert to response format
	var tagStrs []string
	for _, tag := range asset.Tags {
		tagStrs = append(tagStrs, tag.Name)
	}
	categoryName := ""
	if asset.Category != nil {
		categoryName = asset.Category.Name
	}

	c.JSON(http.StatusOK, model.AssetResponse{
		ID:           asset.ID,
		CategoryID:   asset.CategoryID,
		CategoryName: categoryName,
		ImageURL:     asset.ImageURL,
		ThumbnailURL: asset.ThumbnailURL,
		SourceType:   asset.SourceType,
		Metadata:     asset.Metadata,
		Tags:         tagStrs,
		CreatedAt:    asset.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}

// CreateAsset creates a new asset
// POST /api/v1/assets
func (h *AssetHandler) CreateAsset(c *gin.Context) {
	var req model.CreateAssetRequest
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

	// Verify category exists
	category, err := h.categoryRepo.GetByID(c.Request.Context(), req.CategoryID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "GET_CATEGORY_FAILED",
				"message": "获取分类失败",
				"details": err.Error(),
			},
		})
		return
	}
	if category == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "CATEGORY_NOT_FOUND",
				"message": "分类不存在",
			},
		})
		return
	}

	asset := &model.Asset{
		ID:           uuid.New().String(),
		CategoryID:   req.CategoryID,
		ImageURL:     req.ImageURL,
		ThumbnailURL: req.ThumbnailURL,
		SourceType:   req.SourceType,
		Metadata:     req.Metadata,
	}

	if err := h.assetRepo.Create(c.Request.Context(), asset, req.Tags); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "CREATE_FAILED",
				"message": "创建素材失败",
				"details": err.Error(),
			},
		})
		return
	}

	// Reload to get tags
	asset, _ = h.assetRepo.GetByID(c.Request.Context(), asset.ID)
	var tagStrs []string
	if asset != nil {
		for _, tag := range asset.Tags {
			tagStrs = append(tagStrs, tag.Name)
		}
	}

	c.JSON(http.StatusCreated, model.AssetResponse{
		ID:           asset.ID,
		CategoryID:   asset.CategoryID,
		CategoryName: category.Name,
		ImageURL:     asset.ImageURL,
		ThumbnailURL: asset.ThumbnailURL,
		SourceType:   asset.SourceType,
		Metadata:     asset.Metadata,
		Tags:         tagStrs,
		CreatedAt:    asset.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}

// UpdateAsset updates an asset
// PUT /api/v1/assets/:id
func (h *AssetHandler) UpdateAsset(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_ID",
				"message": "素材 ID 不能为空",
			},
		})
		return
	}

	var req model.UpdateAssetRequest
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

	// Get existing asset
	asset, err := h.assetRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "GET_FAILED",
				"message": "获取素材失败",
				"details": err.Error(),
			},
		})
		return
	}

	if asset == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": gin.H{
				"code":    "NOT_FOUND",
				"message": "素材不存在",
			},
		})
		return
	}

	// Update fields if provided
	if req.CategoryID != nil {
		// Verify new category exists
		category, err := h.categoryRepo.GetByID(c.Request.Context(), *req.CategoryID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": gin.H{
					"code":    "GET_CATEGORY_FAILED",
					"message": "获取分类失败",
					"details": err.Error(),
				},
			})
			return
		}
		if category == nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": gin.H{
					"code":    "CATEGORY_NOT_FOUND",
					"message": "分类不存在",
				},
			})
			return
		}
		asset.CategoryID = *req.CategoryID
	}
	if req.Metadata != nil {
		asset.Metadata = *req.Metadata
	}

	if err := h.assetRepo.Update(c.Request.Context(), asset, req.Tags); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "UPDATE_FAILED",
				"message": "更新素材失败",
				"details": err.Error(),
			},
		})
		return
	}

	// Reload to get updated data
	asset, _ = h.assetRepo.GetByID(c.Request.Context(), id)
	var tagStrs []string
	categoryName := ""
	if asset != nil {
		for _, tag := range asset.Tags {
			tagStrs = append(tagStrs, tag.Name)
		}
		if asset.Category != nil {
			categoryName = asset.Category.Name
		}
	}

	c.JSON(http.StatusOK, model.AssetResponse{
		ID:           asset.ID,
		CategoryID:   asset.CategoryID,
		CategoryName: categoryName,
		ImageURL:     asset.ImageURL,
		ThumbnailURL: asset.ThumbnailURL,
		SourceType:   asset.SourceType,
		Metadata:     asset.Metadata,
		Tags:         tagStrs,
		CreatedAt:    asset.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}

// DeleteAsset deletes an asset
// DELETE /api/v1/assets/:id
func (h *AssetHandler) DeleteAsset(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_ID",
				"message": "素材 ID 不能为空",
			},
		})
		return
	}

	if err := h.assetRepo.Delete(c.Request.Context(), id); err != nil {
		if err.Error() == "asset not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"error": gin.H{
					"code":    "NOT_FOUND",
					"message": "素材不存在",
				},
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "DELETE_FAILED",
				"message": "删除素材失败",
				"details": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "素材已删除",
	})
}

// ListCategories returns all categories
// GET /api/v1/categories
func (h *AssetHandler) ListCategories(c *gin.Context) {
	categories, err := h.categoryRepo.List(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "LIST_FAILED",
				"message": "获取分类列表失败",
				"details": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, categories)
}

// GetCategory returns a category by ID
// GET /api/v1/categories/:id
func (h *AssetHandler) GetCategory(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_ID",
				"message": "分类 ID 不能为空",
			},
		})
		return
	}

	category, err := h.categoryRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "GET_FAILED",
				"message": "获取分类失败",
				"details": err.Error(),
			},
		})
		return
	}

	if category == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": gin.H{
				"code":    "NOT_FOUND",
				"message": "分类不存在",
			},
		})
		return
	}

	c.JSON(http.StatusOK, category)
}

// CreateCategory creates a new category
// POST /api/v1/categories
func (h *AssetHandler) CreateCategory(c *gin.Context) {
	var req model.CreateCategoryRequest
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

	// Check if category name already exists
	existing, err := h.categoryRepo.GetByName(c.Request.Context(), req.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "CHECK_FAILED",
				"message": "检查分类名称失败",
				"details": err.Error(),
			},
		})
		return
	}
	if existing != nil {
		c.JSON(http.StatusConflict, gin.H{
			"error": gin.H{
				"code":    "DUPLICATE_NAME",
				"message": "分类名称已存在",
			},
		})
		return
	}

	category := &model.Category{
		ID:          uuid.New().String(),
		Name:        req.Name,
		Description: req.Description,
		SortOrder:   req.SortOrder,
	}

	if err := h.categoryRepo.Create(c.Request.Context(), category); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "CREATE_FAILED",
				"message": "创建分类失败",
				"details": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusCreated, category)
}

// UpdateCategory updates a category
// PUT /api/v1/categories/:id
func (h *AssetHandler) UpdateCategory(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_ID",
				"message": "分类 ID 不能为空",
			},
		})
		return
	}

	var req model.UpdateCategoryRequest
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

	// Get existing category
	category, err := h.categoryRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "GET_FAILED",
				"message": "获取分类失败",
				"details": err.Error(),
			},
		})
		return
	}

	if category == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": gin.H{
				"code":    "NOT_FOUND",
				"message": "分类不存在",
			},
		})
		return
	}

	// Check for duplicate name if name is being updated
	if req.Name != nil && *req.Name != category.Name {
		existing, err := h.categoryRepo.GetByName(c.Request.Context(), *req.Name)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": gin.H{
					"code":    "CHECK_FAILED",
					"message": "检查分类名称失败",
					"details": err.Error(),
				},
			})
			return
		}
		if existing != nil {
			c.JSON(http.StatusConflict, gin.H{
				"error": gin.H{
					"code":    "DUPLICATE_NAME",
					"message": "分类名称已存在",
				},
			})
			return
		}
		category.Name = *req.Name
	}
	if req.Description != nil {
		category.Description = *req.Description
	}
	if req.SortOrder != nil {
		category.SortOrder = *req.SortOrder
	}

	if err := h.categoryRepo.Update(c.Request.Context(), category); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "UPDATE_FAILED",
				"message": "更新分类失败",
				"details": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, category)
}

// DeleteCategory deletes a category
// DELETE /api/v1/categories/:id
func (h *AssetHandler) DeleteCategory(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_ID",
				"message": "分类 ID 不能为空",
			},
		})
		return
	}

	if err := h.categoryRepo.Delete(c.Request.Context(), id); err != nil {
		if err.Error() == "category not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"error": gin.H{
					"code":    "NOT_FOUND",
					"message": "分类不存在",
				},
			})
			return
		}
		if strings.Contains(err.Error(), "cannot delete category with") {
			c.JSON(http.StatusConflict, gin.H{
				"error": gin.H{
					"code":    "HAS_ASSETS",
					"message": err.Error(),
				},
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "DELETE_FAILED",
				"message": "删除分类失败",
				"details": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "分类已删除",
	})
}
