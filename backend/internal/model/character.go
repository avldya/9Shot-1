package model

import (
	"time"
)

// Character represents a character in a storyboard project
type Character struct {
	ID             string    `json:"id" gorm:"primaryKey;size:36"`
	ProjectID      string    `json:"projectId" gorm:"index;size:36"`
	Name           string    `json:"name" gorm:"size:100;not null"`
	Description    string    `json:"description" gorm:"type:text"`
	ReferenceImage string    `json:"referenceImage,omitempty" gorm:"size:500"`
	CreatedAt      time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt      time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName returns the table name for Character
func (Character) TableName() string {
	return "characters"
}

// CreateCharacterRequest represents the request to create a character
type CreateCharacterRequest struct {
	ProjectID      string `json:"projectId"`
	Name           string `json:"name" binding:"required"`
	Description    string `json:"description"`
	ReferenceImage string `json:"referenceImage,omitempty"`
}

// UpdateCharacterRequest represents the request to update a character
type UpdateCharacterRequest struct {
	Name           *string `json:"name,omitempty"`
	Description    *string `json:"description,omitempty"`
	ReferenceImage *string `json:"referenceImage,omitempty"`
}

// AnalyzeScriptRequest represents the request to analyze a script
type AnalyzeScriptRequest struct {
	Script string `json:"script" binding:"required"`
	Style  string `json:"style"`
}

// AnalyzeScriptResponse represents the response from script analysis
type AnalyzeScriptResponse struct {
	Characters []CharacterInfo `json:"characters"`
}

// CharacterInfo represents basic character information from AI analysis
type CharacterInfo struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

// GenerateImageRequest represents the request to generate a character image
type GenerateImageRequest struct {
	Script               string `json:"script"`
	CharacterName        string `json:"characterName" binding:"required"`
	CharacterDescription string `json:"characterDescription" binding:"required"`
}

// GenerateImageResponse represents the response from image generation
type GenerateImageResponse struct {
	ImageURL string `json:"imageUrl"`
}

// GenerateGrid9Request represents the request to generate a 9-grid storyboard
type GenerateGrid9Request struct {
	Script         string         `json:"script" binding:"required"`
	Style          string         `json:"style"`
	Characters     []CharacterRef `json:"characters"`
	PromptTemplate string         `json:"promptTemplate,omitempty"`
}

// CharacterRef represents a character reference for image generation
type CharacterRef struct {
	Name           string `json:"name"`
	ReferenceImage string `json:"referenceImage,omitempty"`
}

// GenerateGrid4Request represents the request to generate a 4-grid multi-angle view
type GenerateGrid4Request struct {
	SourceImage    string `json:"sourceImage" binding:"required"`
	CellIndex      int    `json:"cellIndex"`
	MainCharacter  string `json:"mainCharacter"`
	PromptTemplate string `json:"promptTemplate,omitempty"`
}

// HDRedrawRequest represents the request to perform HD redraw
type HDRedrawRequest struct {
	SourceImage    string `json:"sourceImage" binding:"required"`
	Angle          string `json:"angle" binding:"required,oneof=wide medium close extreme"`
	PromptTemplate string `json:"promptTemplate,omitempty"`
}
