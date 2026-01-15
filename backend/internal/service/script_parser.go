package service

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"storyboard-generator/pkg/gemini"
)

// Character represents a parsed character from the script
type Character struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

// CharacterParseResult represents the result of character parsing
type CharacterParseResult struct {
	Characters []Character `json:"characters"`
}

// ScriptParser handles script analysis and character extraction
type ScriptParser struct {
	geminiClient *gemini.Client
}

// NewScriptParser creates a new ScriptParser instance
func NewScriptParser(geminiClient *gemini.Client) *ScriptParser {
	return &ScriptParser{
		geminiClient: geminiClient,
	}
}

// ParseCharacters extracts characters from a script using Gemini AI
func (p *ScriptParser) ParseCharacters(ctx context.Context, script, style string) (*CharacterParseResult, error) {
	if script == "" {
		return nil, fmt.Errorf("script is required")
	}

	// Call Gemini to analyze the script
	response, err := p.geminiClient.AnalyzeCharacters(ctx, script, style)
	if err != nil {
		return nil, fmt.Errorf("failed to analyze script: %w", err)
	}

	// Parse the JSON response
	result, err := parseCharacterResponse(response.Content)
	if err != nil {
		return nil, fmt.Errorf("failed to parse character response: %w", err)
	}

	// Validate the result
	if err := validateCharacters(result.Characters); err != nil {
		return nil, fmt.Errorf("invalid character data: %w", err)
	}

	return result, nil
}

// parseCharacterResponse parses the Gemini response into CharacterParseResult
func parseCharacterResponse(content string) (*CharacterParseResult, error) {
	// Clean up the response - remove markdown code blocks if present
	content = cleanJSONResponse(content)

	var result CharacterParseResult
	if err := json.Unmarshal([]byte(content), &result); err != nil {
		// Try to extract JSON from the response
		jsonStart := strings.Index(content, "{")
		jsonEnd := strings.LastIndex(content, "}")
		if jsonStart >= 0 && jsonEnd > jsonStart {
			content = content[jsonStart : jsonEnd+1]
			if err := json.Unmarshal([]byte(content), &result); err != nil {
				return nil, fmt.Errorf("failed to parse JSON: %w", err)
			}
		} else {
			return nil, fmt.Errorf("no valid JSON found in response")
		}
	}

	return &result, nil
}

// cleanJSONResponse removes markdown code blocks and extra whitespace
func cleanJSONResponse(content string) string {
	// Remove markdown code blocks
	content = strings.TrimSpace(content)

	// Remove ```json prefix
	if strings.HasPrefix(content, "```json") {
		content = strings.TrimPrefix(content, "```json")
	} else if strings.HasPrefix(content, "```") {
		content = strings.TrimPrefix(content, "```")
	}

	// Remove ``` suffix
	if strings.HasSuffix(content, "```") {
		content = strings.TrimSuffix(content, "```")
	}

	return strings.TrimSpace(content)
}

// validateCharacters validates the parsed characters
func validateCharacters(characters []Character) error {
	for i, char := range characters {
		if char.Name == "" {
			return fmt.Errorf("character at index %d has empty name", i)
		}
		if char.Description == "" {
			return fmt.Errorf("character '%s' has empty description", char.Name)
		}
	}
	return nil
}

// ExtractCharacterNames returns just the names of all characters
func (r *CharacterParseResult) ExtractCharacterNames() []string {
	names := make([]string, len(r.Characters))
	for i, char := range r.Characters {
		names[i] = char.Name
	}
	return names
}

// FindCharacterByName finds a character by name (case-insensitive)
func (r *CharacterParseResult) FindCharacterByName(name string) *Character {
	nameLower := strings.ToLower(name)
	for i := range r.Characters {
		if strings.ToLower(r.Characters[i].Name) == nameLower {
			return &r.Characters[i]
		}
	}
	return nil
}

// ToGeminiCharacterRefs converts characters to Gemini CharacterRef format
func (r *CharacterParseResult) ToGeminiCharacterRefs() []gemini.CharacterRef {
	refs := make([]gemini.CharacterRef, len(r.Characters))
	for i, char := range r.Characters {
		refs[i] = gemini.CharacterRef{
			Name:        char.Name,
			Description: char.Description,
		}
	}
	return refs
}

// HasCharacter checks if a character with the given name exists
func (r *CharacterParseResult) HasCharacter(name string) bool {
	return r.FindCharacterByName(name) != nil
}

// Count returns the number of characters
func (r *CharacterParseResult) Count() int {
	return len(r.Characters)
}
