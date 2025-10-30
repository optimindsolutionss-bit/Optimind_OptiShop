package http

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/Brayantorres29/inventory-backend/internal/application"
	"github.com/Brayantorres29/inventory-backend/internal/domain"
	"github.com/go-chi/chi/v5"
)

// MovementHandler maneja las rutas de movimientos de inventario
type MovementHandler struct {
	Service *application.InventoryService
}

// NewMovementHandler constructor
func NewMovementHandler(service *application.InventoryService) *MovementHandler {
	return &MovementHandler{Service: service}
}

// RegisterRoutes registra las rutas en el router principal
func (h *MovementHandler) RegisterRoutes(r chi.Router) {
	r.Route("/api/v1/movements", func(r chi.Router) {
		r.Post("/movements", h.CreateMovement)
		r.Get("/movements", h.ListMovements)
	})
}

// CreateMovement maneja POST /api/v1/movements
func (h *MovementHandler) CreateMovement(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ProductID    int64  `json:"product_id"`
		MovementType string `json:"movement_type"` // "entry" o "exit"
		Quantity     int    `json:"quantity"`
		UserID       int64  `json:"user_id"` // ⚠️ Temporal: luego vendrá del JWT
		Reason       string `json:"reason"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	movement := domain.InventoryMovement{
		ProductID:    req.ProductID,
		MovementType: req.MovementType,
		Quantity:     req.Quantity,
		UserID:       req.UserID,
		Reason:       req.Reason,
	}

	created, err := h.Service.CreateMovement(movement)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(created)
}

// ListMovements maneja GET /api/v1/movements
func (h *MovementHandler) ListMovements(w http.ResponseWriter, r *http.Request) {
	// Por ahora los filtros no se usan, pero los dejamos listos para futuro
	productIDStr := r.URL.Query().Get("product_id")
	userIDStr := r.URL.Query().Get("user_id")

	if productIDStr != "" {
		if _, err := strconv.Atoi(productIDStr); err != nil {
			http.Error(w, "Invalid product_id", http.StatusBadRequest)
			return
		}
	}
	if userIDStr != "" {
		if _, err := strconv.Atoi(userIDStr); err != nil {
			http.Error(w, "Invalid user_id", http.StatusBadRequest)
			return
		}
	}

	movements, err := h.Service.ListMovements()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(movements)
}
