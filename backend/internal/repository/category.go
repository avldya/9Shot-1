package repository

import (
	"context"
	"fmt"

	"storyboard-generator/internal/model"

	"gorm.io/gorm"
)

// CategoryRepository handles database operations for categories
type CategoryRepository struct {
	db *gorm.DB
}

// NewCategoryRepository creates a new CategoryRepository
func NewCategoryRepository(db *gorm.DB) *CategoryRepository {
	return &CategoryRepository{db: db}
}

// Create creates a new category
func (r *CategoryRepository) Create(ctx context.Context, category *model.Category) error {
	result := r.db.WithContext(ctx).Create(category)
	if result.Error != nil {
		return fmt.Errorf("failed to create category: %w", result.Error)
	}
	return nil
}

// GetByID retrieves a category by ID
func (r *CategoryRepository) GetByID(ctx context.Context, id string) (*model.Category, error) {
	var category model.Category
	result := r.db.WithContext(ctx).First(&category, "id = ?", id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get category: %w", result.Error)
	}
	return &category, nil
}

// GetByName retrieves a category by name
func (r *CategoryRepository) GetByName(ctx context.Context, name string) (*model.Category, error) {
	var category model.Category
	result := r.db.WithContext(ctx).First(&category, "name = ?", name)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get category: %w", result.Error)
	}
	return &category, nil
}

// List retrieves all categories with asset counts
func (r *CategoryRepository) List(ctx context.Context) ([]model.Category, error) {
	var categories []model.Category
	result := r.db.WithContext(ctx).Order("sort_order ASC, name ASC").Find(&categories)
	if result.Error != nil {
		return nil, fmt.Errorf("failed to list categories: %w", result.Error)
	}

	// Get asset counts for each category
	for i := range categories {
		var count int64
		r.db.Model(&model.Asset{}).Where("category_id = ?", categories[i].ID).Count(&count)
		categories[i].AssetCount = int(count)
	}

	return categories, nil
}

// Update updates a category
func (r *CategoryRepository) Update(ctx context.Context, category *model.Category) error {
	result := r.db.WithContext(ctx).Save(category)
	if result.Error != nil {
		return fmt.Errorf("failed to update category: %w", result.Error)
	}
	return nil
}

// Delete deletes a category by ID
func (r *CategoryRepository) Delete(ctx context.Context, id string) error {
	// Check if category has assets
	var count int64
	r.db.Model(&model.Asset{}).Where("category_id = ?", id).Count(&count)
	if count > 0 {
		return fmt.Errorf("cannot delete category with %d assets", count)
	}

	result := r.db.WithContext(ctx).Delete(&model.Category{}, "id = ?", id)
	if result.Error != nil {
		return fmt.Errorf("failed to delete category: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("category not found")
	}
	return nil
}

// Migrate runs database migrations for the category table
func (r *CategoryRepository) Migrate() error {
	return r.db.AutoMigrate(&model.Category{})
}
