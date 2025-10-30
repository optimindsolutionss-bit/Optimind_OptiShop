package domain

import "time"

// InventoryItem representa un producto dentro del inventario.
// Esta es una entidad del dominio central.
type InventoryItem struct {
	ID        int64     `json:"id"`                                 // Identificador único del ítem
	Name      string    `json:"name" validate:"required"`           // Nombre del producto
	Quantity  int       `json:"quantity" validate:"required,get=1"` // Cantidad disponible en inventario
	Price     float64   `json:"price" validate:"required,get=0"`    // Precio unitario del producto
	CreatedAt time.Time `json:"created_at"`
}
