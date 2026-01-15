package model

import (
	"time"
)

// Asset represents a saved storyboard asset in the library
type Asset struct {
	ID           string    `json:"id" gorm:"primaryKey;size:36"`
	CategoryID   string    `json:"categoryId" gorm:"index;size:36"`
	Category     *Category `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
	ImageURL     string    `json:"imageUrl" gorm:"size:500;not null"`
	ThumbnailURL string    `json:"thumbnailUrl" gorm:"size:500"`
	SourceType   string    `json:"sourceType" gorm:"size:50"` // grid9, grid4, hd
	Metadata     string    `json:"metadata" gorm:"type:text"` // JSON string
	Tags         []Tag     `json:"tags" gorm:"many2many:asset_tags"`
	CreatedAt    time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt    time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName returns the table name for Asset
func (Asset) TableName() string {
	return "assets"
}

// Category represents a category for organizing assets
type Category struct {
	ID          string    `json:"id" gorm:"primaryKey;size:36"`
	Name        string    `json:"name" gorm:"size:100;uniqueIndex;not null"`
	Description string    `json:"description" gorm:"size:500"`
	SortOrder   int       `json:"sortOrder" gorm:"default:0"`
	AssetCount  int       `json:"assetCount" gorm:"-"` // Computed field, not stored
	CreatedAt   time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName returns the table name for Category
func (Category) TableName() string {
	return "categories"
}

// Tag represents a tag for assets
type Tag struct {
	ID        string    `json:"id" gorm:"primaryKey;size:36"`
	Name      string    `json:"name" gorm:"size:50;uniqueIndex;not null"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
}

// TableName returns the table name for Tag
func (Tag) TableName() string {
	return "tags"
}
