package model

// CreateAssetRequest represents the request to create an asset
type CreateAssetRequest struct {
	CategoryID   string   `json:"categoryId" binding:"required"`
	ImageURL     string   `json:"imageUrl" binding:"required"`
	ThumbnailURL string   `json:"thumbnailUrl"`
	SourceType   string   `json:"sourceType"` // grid9, grid4, hd
	Metadata     string   `json:"metadata"`
	Tags         []string `json:"tags"`
}

// UpdateAssetRequest represents the request to update an asset
type UpdateAssetRequest struct {
	CategoryID *string  `json:"categoryId,omitempty"`
	Tags       []string `json:"tags,omitempty"`
	Metadata   *string  `json:"metadata,omitempty"`
}

// AssetListQuery represents query parameters for listing assets
type AssetListQuery struct {
	CategoryID string `form:"category"`
	Tags       string `form:"tags"` // Comma-separated tags
	Page       int    `form:"page"`
	Size       int    `form:"size"`
}

// AssetResponse represents the response for an asset with category name
type AssetResponse struct {
	ID           string   `json:"id"`
	CategoryID   string   `json:"categoryId"`
	CategoryName string   `json:"categoryName"`
	ImageURL     string   `json:"imageUrl"`
	ThumbnailURL string   `json:"thumbnailUrl"`
	SourceType   string   `json:"sourceType"`
	Metadata     string   `json:"metadata"`
	Tags         []string `json:"tags"`
	CreatedAt    string   `json:"createdAt"`
}

// CreateCategoryRequest represents the request to create a category
type CreateCategoryRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	SortOrder   int    `json:"sortOrder"`
}

// UpdateCategoryRequest represents the request to update a category
type UpdateCategoryRequest struct {
	Name        *string `json:"name,omitempty"`
	Description *string `json:"description,omitempty"`
	SortOrder   *int    `json:"sortOrder,omitempty"`
}
