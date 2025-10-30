package http

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/Brayantorres29/inventory-backend/internal/adapters/db"
	"github.com/Brayantorres29/inventory-backend/internal/application"
	"github.com/Brayantorres29/inventory-backend/internal/domain"
	"github.com/go-chi/chi/v5"
	"github.com/go-playground/validator/v10"
)

// ------------------------------
// 🔹 Estructuras y helpers base
// ------------------------------

func respondJSON(w http.ResponseWriter, code int, message string, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)

	status := "success"
	if code >= 400 {
		status = "error"
	}

	json.NewEncoder(w).Encode(APIResponse{
		Code:    code,
		Status:  status,
		Message: message,
		Data:    data,
	})
}

// ItemResponse es la estructura que enviaremos al frontend
// con CreatedAt formateado en la zona horaria correcta

type ItemResponse struct {
	ID        int64   `json:"id"`
	Name      string  `json:"name"`
	Quantity  int     `json:"quantity"`
	Price     float64 `json:"price"`
	CreatedAt string  `json:"created_at"`
}

// Convierte domain.InventoryItem a ItemResponse con zona horaria Bogotá
func toItemResponse(item domain.InventoryItem) ItemResponse {
	return ItemResponse{
		ID:        item.ID,
		Name:      item.Name,
		Quantity:  item.Quantity,
		Price:     item.Price,
		CreatedAt: item.CreatedAt.Format("2006-01-02T15:04:05Z07:00"), // mantiene UTC
	}
}

// Convierte slice de domain.InventoryItem a slice de ItemResponse
func toItemResponseList(items []domain.InventoryItem) []ItemResponse {
	resp := make([]ItemResponse, len(items))
	for i, item := range items {
		resp[i] = toItemResponse(item)
	}
	return resp
}

// APIResponse define un formato estándar para todas las respuestas HTTP
type APIResponse struct {
	Code    int         `json:"code"`           // Código HTTP, ej. 200, 404, 500
	Status  string      `json:"status"`         // "success" o "error"
	Message string      `json:"message"`        // Mensaje claro
	Data    interface{} `json:"data,omitempty"` // Datos devueltos (si los hay)
}

// ItemRequest representa la estructura de request para agregar o actualizar un item
type ItemRequest struct {
	Name     string  `json:"name" validate:"required,min=2"`
	Quantity int     `json:"quantity" validate:"required,gte=0"`
	Price    float64 `json:"price" validate:"required,gt=0"`
}

// PatchItemRequest representa los campos opcionales para un PATCH
type PatchItemRequest struct {
	Name     *string  `json:"name,omitempty"`
	Quantity *int     `json:"quantity,omitempty"`
	Price    *float64 `json:"price,omitempty"`
}

// ------------------------------
// 🔹 Movement Handler
// ------------------------------

type MovementRequest struct {
	ProductID int    `json:"product_id" validate:"required"`
	Tipo      string `json:"tipo" validate:"required,oneof=entrada salida"`
	Cantidad  int    `json:"cantidad" validate:"required,gt=0"`
	Motivo    string `json:"motivo" validate:"required"`
	//UserID    int    `json:"user_id" validate:"required"` // temporal hasta JWT
}

// Handler es el controlador principal que manejará las rutas HTTP.
type Handler struct {
	Service  *application.InventoryService
	UserRepo *db.UserRepository
}

// NewHandler crea un nuevo Handler con servicio y repositorio de usuarios
func NewHandler(service *application.InventoryService, userRepo *db.UserRepository) *Handler {
	return &Handler{
		Service:  service,
		UserRepo: userRepo,
	}
}

// RegisterRoutes configura las rutas en el router de Chi.
func (h *Handler) RegisterRoutes(r chi.Router) {
	r.Route("/api/v1", func(r chi.Router) {
		// --- Rutas públicas ---
		r.Get("/items", h.GetItems)
		r.Get("/items/{id}", h.GetItemByID)
		r.Get("/items/search", h.SearchItems)
		r.Post("/login", LoginHandler(h.UserRepo))

		// --- Grupo autenticado ---
		r.Group(func(r chi.Router) {
			r.Use(AuthMiddleware)

			// 🧑‍💻 Creador y Admin pueden crear
			r.With(RoleMiddleware("creator", "admin")).Post("/items", h.AddItem)

			// 👑 Solo Admin puede actualizar o eliminar
			r.With(RoleMiddleware("admin")).Put("/items/{id}", h.UpdateItem)
			r.With(RoleMiddleware("admin")).Patch("/items/{id}", h.PatchItem)
			r.With(RoleMiddleware("admin")).Delete("/items/{id}", h.DeleteItem)

			// 🧾 MOVIMIENTOS (también dentro de /api/v1)
			r.With(RoleMiddleware("creator", "admin")).Post("/movements", h.CreateMovement)
			r.With(RoleMiddleware("admin", "creator", "viewer")).Get("/movements", h.ListMovements)
		})
	})
}

// @Summary List all items
// @Description Get all inventory items
// @Tags items
// @Produce json
// @Success 200 {array} domain.InventoryItem
// @Failure 500 {object} map[string]string
// @Router /items [get]
func (h *Handler) GetItems(w http.ResponseWriter, r *http.Request) {
	items, err := h.Service.ListItems()
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, "Error listando items: "+err.Error(), nil)
		return
	}

	respondJSON(w, http.StatusOK, "Lista de items obtenida correctamente", toItemResponseList(items))

}

// @Summary Add a new item
// @Description Add a new item to the inventory
// @Tags items
// @Accept json
// @Produce json
// @Param item body http.ItemRequest true "Item info"
// @Success 201 {object} domain.InventoryItem
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /items [post]
func (h *Handler) AddItem(w http.ResponseWriter, r *http.Request) {
	var req ItemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		respondJSON(w, http.StatusBadRequest, "Request inválido", nil)
		return
	}

	validate := validator.New()
	if err := validate.Struct(req); err != nil {
		respondJSON(w, http.StatusBadRequest, "Validación fallida: "+err.Error(), nil)
		return
	}

	item, err := h.Service.AddItem(req.Name, req.Quantity, req.Price)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, "Error agregando item: "+err.Error(), nil)
		return
	}

	respondJSON(w, http.StatusCreated, "Item agregado con éxito", toItemResponse(item))
}

// @Summary Get item by ID
// @Description Get a single inventory item by its ID
// @Tags items
// @Produce json
// @Param id path int true "Item ID"
// @Success 200 {object} domain.InventoryItem
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /items/{id} [get]
func (h *Handler) GetItemByID(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, "ID inválido", nil)
		return
	}

	item, err := h.Service.GetItem(id)
	if err != nil {
		respondJSON(w, http.StatusNotFound, "Item no encontrado", nil)
		return
	}

	respondJSON(w, http.StatusOK, "Item encontrado", toItemResponse(item))
}

// @Summary Update an item
// @Description Update an existing inventory item
// @Tags items
// @Accept json
// @Produce json
// @Param id path int true "Item ID"
// @Param item body http.ItemRequest true "Updated item info"
// @Success 200 {object} domain.InventoryItem
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /items/{id} [put]
func (h *Handler) UpdateItem(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	var req ItemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	validate := validator.New()
	if err := validate.Struct(req); err != nil {
		http.Error(w, "Validation error: "+err.Error(), http.StatusBadRequest)
		return
	}

	err = h.Service.UpdateItem(id, req.Name, req.Quantity, req.Price)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, "Error actualizando item: "+err.Error(), nil)
		return
	}

	updatedItem, _ := h.Service.GetItem(id)
	respondJSON(w, http.StatusOK, "Item actualizado con éxito", updatedItem)
}

// @Summary Delete an item
// @Description Delete an inventory item by its ID
// @Tags items
// @Produce json
// @Param id path int true "Item ID"
// @Success 204
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /items/{id} [delete]
func (h *Handler) DeleteItem(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, "ID inválido", nil)
		return
	}

	err = h.Service.DeleteItem(id)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, "Error eliminando item: "+err.Error(), nil)
		return
	}

	respondJSON(w, http.StatusOK, "Item eliminado con éxito", nil)
}

// @Summary Search items
// @Description Search items by name
// @Tags items
// @Produce json
// @Param name query string true "Name query"
// @Success 200 {array} domain.InventoryItem
// @Failure 500 {object} map[string]string
// @Router /items/search [get]
func (h *Handler) SearchItems(w http.ResponseWriter, r *http.Request) {
	// Tomamos los parámetros de query
	name := r.URL.Query().Get("name")
	minQuantityStr := r.URL.Query().Get("minQuantity")
	maxPriceStr := r.URL.Query().Get("maxPrice")

	// Convertimos minQuantity a int
	minQuantity := -1
	if minQuantityStr != "" {
		if v, err := strconv.Atoi(minQuantityStr); err == nil {
			minQuantity = v
		}
	}

	// Convertimos maxPrice a float64
	maxPrice := -1.0
	if maxPriceStr != "" {
		if v, err := strconv.ParseFloat(maxPriceStr, 64); err == nil {
			maxPrice = v
		}
	}

	// Llamamos al servicio
	items, err := h.Service.SearchItems(name, minQuantity, maxPrice)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, "Error buscando items: "+err.Error(), nil)
		return
	}

	if len(items) == 0 {
		respondJSON(w, http.StatusNotFound, "No se encontraron items", nil)
		return
	}

	respondJSON(w, http.StatusOK, "Items encontrados", items)
}

// ------------------------------
// 🔹 Métodos Movement
// ------------------------------

// @Summary Crear un nuevo movimiento de inventario
// @Description Registra una entrada o salida de inventario
// @Tags Movements
// @Accept json
// @Produce json
// @Param movement body MovementRequest true "Datos del movimiento"
// @Success 201 {object} domain.InventoryMovement
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /movements [post]
// @Security BearerAuth
func (h *Handler) CreateMovement(w http.ResponseWriter, r *http.Request) {
	var req MovementRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, "JSON inválido", nil)
		return
	}

	validate := validator.New()
	if err := validate.Struct(req); err != nil {
		respondJSON(w, http.StatusBadRequest, "Validación fallida: "+err.Error(), nil)
		return
	}

	// Obtener username del JWT (puesto por AuthMiddleware)
	username := r.Header.Get("X-User")
	_ = r.Header.Get("X-Role") // evita error temporal

	// Buscar usuario en la base de datos para obtener ID
	user, err := h.UserRepo.GetByUsername(username)
	if err != nil {
		respondJSON(w, http.StatusUnauthorized, "Usuario no encontrado", nil)
		return
	}

	movement := domain.InventoryMovement{
		ProductID:    int64(req.ProductID),
		MovementType: req.Tipo,     // 🔁 mapea "tipo" -> "movement_type"
		Quantity:     req.Cantidad, // 🔁 mapea cantidad igual
		Reason:       req.Motivo,   // 🔁 mapea "motivo" -> "reason"
		UserID:       user.ID,
		CreatedAt:    time.Now(), // ⏰ genera la fecha actual
	}

	createdMovement, err := h.Service.CreateMovement(movement)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, "Error creando movimiento: "+err.Error(), nil)
		return
	}

	respondJSON(w, http.StatusCreated, "Movimiento registrado con éxito", createdMovement)
}

// @Summary Listar todos los movimientos de inventario
// @Description Obtiene la lista completa de movimientos registrados
// @Tags Movements
// @Produce json
// @Success 200 {array} domain.InventoryMovement
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /movements [get]
// @Security BearerAuth
func (h *Handler) ListMovements(w http.ResponseWriter, r *http.Request) {
	movements, err := h.Service.ListMovements()
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, "Error obteniendo movimientos", nil)
		return
	}

	respondJSON(w, http.StatusOK, "Lista de movimientos obtenida correctamente", movements)
}

// @Summary Partially update an item
// @Description Update only the fields provided of an inventory item
// @Tags items
// @Accept json
// @Produce json
// @Param id path int true "Item ID"
// @Param item body http.PatchItemRequest true "Fields to update"
// @Success 200 {object} domain.InventoryItem
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /items/{id} [patch]
func (h *Handler) PatchItem(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	var req PatchItemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Validación mínima (opcional)
	if req.Name == nil && req.Quantity == nil && req.Price == nil {
		http.Error(w, "Debe enviar al menos un campo para actualizar", http.StatusBadRequest)
		return
	}

	// Llamamos al servicio PatchItem
	updatedItem, err := h.Service.PatchItem(id, req.Name, req.Quantity, req.Price)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, "Error actualizando item: "+err.Error(), nil)
		return
	}

	respondJSON(w, http.StatusOK, "Item parcialmente actualizado", updatedItem)
}

// LoginRequest representa el cuerpo JSON de inicio de sesión
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// LoginResponse es lo que devolveremos al usuario tras iniciar sesión
type LoginResponse struct {
	Token string `json:"token"`
	Role  string `json:"role"`
}

// LoginHandler permite autenticar un usuario y devolver su token JWT
func LoginHandler(userRepo *db.UserRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req LoginRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			respondJSON(w, http.StatusBadRequest, "Error en formato JSON", nil)
			return
		}

		// Buscar usuario
		user, err := userRepo.GetByUsername(req.Username)
		if err != nil {
			respondJSON(w, http.StatusUnauthorized, "Usuario no encontrado", nil)
			return
		}

		// Verificar contraseña
		valid, err := application.CheckPassword(req.Password, user.PasswordHash)
		if err != nil || !valid {
			respondJSON(w, http.StatusUnauthorized, "Contraseña incorrecta", nil)
			return
		}

		// Generar token
		token, err := application.GenerateJWT(user.Username, user.Role)
		if err != nil {
			respondJSON(w, http.StatusInternalServerError, "Error generando token", nil)
			return
		}

		respondJSON(w, http.StatusOK, "Inicio de sesión exitoso", LoginResponse{
			Token: token,
			Role:  user.Role,
		})
	}
}
