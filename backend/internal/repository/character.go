package repository

import (
	"context"
	"fmt"

	"storyboard-generator/internal/model"

	"gorm.io/gorm"
)

// CharacterRepository handles database operations for characters
type CharacterRepository struct {
	db *gorm.DB
}

// NewCharacterRepository creates a new CharacterRepository
func NewCharacterRepository(db *gorm.DB) *CharacterRepository {
	return &CharacterRepository{db: db}
}

// Create creates a new character
func (r *CharacterRepository) Create(ctx context.Context, character *model.Character) error {
	result := r.db.WithContext(ctx).Create(character)
	if result.Error != nil {
		return fmt.Errorf("failed to create character: %w", result.Error)
	}
	return nil
}

// GetByID retrieves a character by ID
func (r *CharacterRepository) GetByID(ctx context.Context, id string) (*model.Character, error) {
	var character model.Character
	result := r.db.WithContext(ctx).First(&character, "id = ?", id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get character: %w", result.Error)
	}
	return &character, nil
}

// GetByProjectID retrieves all characters for a project
func (r *CharacterRepository) GetByProjectID(ctx context.Context, projectID string) ([]model.Character, error) {
	var characters []model.Character
	result := r.db.WithContext(ctx).Where("project_id = ?", projectID).Order("created_at ASC").Find(&characters)
	if result.Error != nil {
		return nil, fmt.Errorf("failed to get characters: %w", result.Error)
	}
	return characters, nil
}

// List retrieves all characters
func (r *CharacterRepository) List(ctx context.Context) ([]model.Character, error) {
	var characters []model.Character
	result := r.db.WithContext(ctx).Order("created_at DESC").Find(&characters)
	if result.Error != nil {
		return nil, fmt.Errorf("failed to list characters: %w", result.Error)
	}
	return characters, nil
}

// Update updates a character
func (r *CharacterRepository) Update(ctx context.Context, character *model.Character) error {
	result := r.db.WithContext(ctx).Save(character)
	if result.Error != nil {
		return fmt.Errorf("failed to update character: %w", result.Error)
	}
	return nil
}

// Delete deletes a character by ID
func (r *CharacterRepository) Delete(ctx context.Context, id string) error {
	result := r.db.WithContext(ctx).Delete(&model.Character{}, "id = ?", id)
	if result.Error != nil {
		return fmt.Errorf("failed to delete character: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("character not found")
	}
	return nil
}

// Migrate runs database migrations for the character table
func (r *CharacterRepository) Migrate() error {
	return r.db.AutoMigrate(&model.Character{})
}
