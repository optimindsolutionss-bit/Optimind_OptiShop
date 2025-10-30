package main

import (
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	httpSwagger "github.com/swaggo/http-swagger"

	"github.com/Brayantorres29/inventory-backend/internal/adapters/db"
	httpAdapter "github.com/Brayantorres29/inventory-backend/internal/adapters/http"
	"github.com/Brayantorres29/inventory-backend/internal/application"

	_ "github.com/Brayantorres29/inventory-backend/docs"
)

// @title Inventory API
// @version 1.0
// @description API para gestión de inventario y movimientos
// @contact.name Brayan Torres
// @contact.email tuemail@dominio.com
// @host localhost:8080
// @BasePath /api/v1
// @schemes http

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	// 🧩 1️⃣ Instancia del repositorio Postgres principal
	postgresRepo := db.NewPostgresRepository()

	// 🧩 2️⃣ Repositorio único (maneja Items y Movimientos)
	itemRepo := postgresRepo // Repo de items y movimientos
	userRepo := db.NewUserRepository(postgresRepo.Conn)

	// 🧩 3️⃣ Instancia del servicio principal
	service := application.NewInventoryService(itemRepo) // Solo un argumento

	// 🧩 4️⃣ Router principal Chi
	r := chi.NewRouter()

	// CORS y middlewares
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(httpAdapter.LoggingMiddleware)

	rateLimiter := httpAdapter.NewRateLimiter(10, time.Minute)
	r.Use(rateLimiter.Middleware)

	// 🧩 5️⃣ Rutas públicas
	r.Post("/login", httpAdapter.LoginHandler(userRepo))

	// 🧩 6️⃣ Rutas protegidas
	handler := httpAdapter.NewHandler(service, userRepo)
	handler.RegisterRoutes(r) // maneja /api/v1 internamente

	// 🧩 7️⃣ Rutas Swagger
	r.Get("/swagger/*", httpSwagger.WrapHandler)

	// 🧩 8️⃣ Iniciar servidor
	log.Println("🚀 Servidor corriendo en http://localhost:8080")
	http.ListenAndServe(":8080", r)
}
