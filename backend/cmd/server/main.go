package main

import (
	"context"
	"log"
	"os"

	"storyboard-generator/internal/handler"
	"storyboard-generator/internal/repository"
	"storyboard-generator/internal/service"
	"storyboard-generator/pkg/gemini"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	// Get API key from environment
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Println("Warning: GEMINI_API_KEY not set, AI features will not work")
	}

	// Initialize database
	db, err := gorm.Open(sqlite.Open("storyboard.db"), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Initialize Gemini client
	ctx := context.Background()
	var geminiClient *gemini.Client
	if apiKey != "" {
		geminiClient, err = gemini.NewClient(ctx, apiKey)
		if err != nil {
			log.Printf("Warning: Failed to create Gemini client: %v", err)
		}
	}

	// Initialize repositories
	characterRepo := repository.NewCharacterRepository(db)
	assetRepo := repository.NewAssetRepository(db)
	categoryRepo := repository.NewCategoryRepository(db)

	// Run migrations
	if err := characterRepo.Migrate(); err != nil {
		log.Fatalf("Failed to run character migrations: %v", err)
	}
	if err := assetRepo.Migrate(); err != nil {
		log.Fatalf("Failed to run asset migrations: %v", err)
	}

	// Initialize services
	var scriptParser *service.ScriptParser
	if geminiClient != nil {
		scriptParser = service.NewScriptParser(geminiClient)
	}

	// Initialize handlers
	characterHandler := handler.NewCharacterHandler(characterRepo, scriptParser)
	storyboardHandler := handler.NewStoryboardHandler(scriptParser, geminiClient)
	assetHandler := handler.NewAssetHandler(assetRepo, categoryRepo)

	// Initialize Gin router
	r := gin.Default()

	// Configure CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// API routes
	api := r.Group("/api/v1")
	{
		// Storyboard routes
		storyboard := api.Group("/storyboard")
		{
			storyboard.POST("/analyze", storyboardHandler.Analyze)
			storyboard.POST("/generate-grid9", storyboardHandler.GenerateGrid9)
			storyboard.POST("/generate-grid4", storyboardHandler.GenerateGrid4)
			storyboard.POST("/hd-redraw", storyboardHandler.HDRedraw)
		}

		// Character routes
		characters := api.Group("/characters")
		{
			characters.GET("", characterHandler.List)
			characters.GET("/:id", characterHandler.GetByID)
			characters.POST("", characterHandler.Create)
			characters.PUT("/:id", characterHandler.Update)
			characters.DELETE("/:id", characterHandler.Delete)
			characters.POST("/:id/generate-image", storyboardHandler.GenerateCharacterImage)
		}

		// Asset routes
		assets := api.Group("/assets")
		{
			assets.GET("", assetHandler.ListAssets)
			assets.GET("/:id", assetHandler.GetAsset)
			assets.POST("", assetHandler.CreateAsset)
			assets.PUT("/:id", assetHandler.UpdateAsset)
			assets.DELETE("/:id", assetHandler.DeleteAsset)
		}

		// Category routes
		categories := api.Group("/categories")
		{
			categories.GET("", assetHandler.ListCategories)
			categories.GET("/:id", assetHandler.GetCategory)
			categories.POST("", assetHandler.CreateCategory)
			categories.PUT("/:id", assetHandler.UpdateCategory)
			categories.DELETE("/:id", assetHandler.DeleteCategory)
		}
	}

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
