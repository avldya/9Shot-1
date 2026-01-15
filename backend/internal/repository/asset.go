package repository

import (
	"context"
	"fmt"
	"strings"

	"storyboard-generator/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// AssetRepository handles database operations for assets
type AssetRepository struct {
	db *gorm.DB
}

// NewAssetRepository creates a new AssetRepository
func NewAssetRepository(db *gorm.DB) *AssetRepository {
	return &AssetRepository{db: db}
}

// Create creates a new asset with tags
func (r *AssetRepository) Create(ctx context.Context, asset *model.Asset, tagNames []string) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Create or get tags
		var tags []model.Tag
		for _, name := range tagNames {
			name = strings.TrimSpace(name)
			if name == "" {
				continue
			}
			var tag model.Tag
			result := tx.Where("name = ?", name).First(&tag)
			if result.Error == gorm.ErrRecordNotFound {
				tag = model.Tag{
					ID:   newUUID(),
					Name: name,
				}
				if err := tx.Create(&tag).Error; err != nil {
					return fmt.Errorf("failed to create tag: %w", err)
				}
			} else if result.Error != nil {
				return fmt.Errorf("failed to find tag: %w", result.Error)
			}
			tags = append(tags, tag)
		}
		asset.Tags = tags

		// Create asset
		if err := tx.Create(asset).Error; err != nil {
			return fmt.Errorf("failed to create asset: %w", err)
		}
		return nil
	})
}

// GetByID retrieves an asset by ID with category and tags
func (r *AssetRepository) GetByID(ctx context.Context, id string) (*model.Asset, error) {
	var asset model.Asset
	result := r.db.WithContext(ctx).
		Preload("Category").
		Preload("Tags").
		First(&asset, "id = ?", id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get asset: %w", result.Error)
	}
	return &asset, nil
}

// List retrieves assets with optional filtering
func (r *AssetRepository) List(ctx context.Context, categoryID string, tagNames []string, page, size int) ([]model.Asset, int64, error) {
	query := r.db.WithContext(ctx).Model(&model.Asset{})

	// Filter by category
	if categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}

	// Filter by tags
	if len(tagNames) > 0 {
		subQuery := r.db.Table("asset_tags").
			Select("asset_id").
			Joins("JOIN tags ON tags.id = asset_tags.tag_id").
			Where("tags.name IN ?", tagNames).
			Group("asset_id")
		query = query.Where("id IN (?)", subQuery)
	}

	// Count total
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count assets: %w", err)
	}

	// Apply pagination
	if page < 1 {
		page = 1
	}
	if size < 1 {
		size = 20
	}
	offset := (page - 1) * size

	var assets []model.Asset
	result := query.
		Preload("Category").
		Preload("Tags").
		Order("created_at DESC").
		Offset(offset).
		Limit(size).
		Find(&assets)
	if result.Error != nil {
		return nil, 0, fmt.Errorf("failed to list assets: %w", result.Error)
	}

	return assets, total, nil
}

// Update updates an asset
func (r *AssetRepository) Update(ctx context.Context, asset *model.Asset, tagNames []string) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Update tags if provided
		if tagNames != nil {
			// Clear existing tags
			if err := tx.Model(asset).Association("Tags").Clear(); err != nil {
				return fmt.Errorf("failed to clear tags: %w", err)
			}

			// Create or get new tags
			var tags []model.Tag
			for _, name := range tagNames {
				name = strings.TrimSpace(name)
				if name == "" {
					continue
				}
				var tag model.Tag
				result := tx.Where("name = ?", name).First(&tag)
				if result.Error == gorm.ErrRecordNotFound {
					tag = model.Tag{
						ID:   newUUID(),
						Name: name,
					}
					if err := tx.Create(&tag).Error; err != nil {
						return fmt.Errorf("failed to create tag: %w", err)
					}
				} else if result.Error != nil {
					return fmt.Errorf("failed to find tag: %w", result.Error)
				}
				tags = append(tags, tag)
			}

			// Associate new tags
			if err := tx.Model(asset).Association("Tags").Replace(tags); err != nil {
				return fmt.Errorf("failed to update tags: %w", err)
			}
		}

		// Update asset fields
		if err := tx.Save(asset).Error; err != nil {
			return fmt.Errorf("failed to update asset: %w", err)
		}
		return nil
	})
}

// Delete deletes an asset by ID
func (r *AssetRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Clear tag associations
		asset := &model.Asset{ID: id}
		if err := tx.Model(asset).Association("Tags").Clear(); err != nil {
			return fmt.Errorf("failed to clear tags: %w", err)
		}

		// Delete asset
		result := tx.Delete(&model.Asset{}, "id = ?", id)
		if result.Error != nil {
			return fmt.Errorf("failed to delete asset: %w", result.Error)
		}
		if result.RowsAffected == 0 {
			return fmt.Errorf("asset not found")
		}
		return nil
	})
}

// Migrate runs database migrations for asset-related tables
func (r *AssetRepository) Migrate() error {
	return r.db.AutoMigrate(&model.Tag{}, &model.Category{}, &model.Asset{})
}

// Helper function to generate UUID
func newUUID() string {
	return uuid.New().String()
}
