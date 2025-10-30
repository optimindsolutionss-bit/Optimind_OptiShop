package domain

import "time"

type InventoryMovement struct {
	ID           int64     `json:"id"`
	ProductID    int64     `json:"product_id"`
	MovementType string    `json:"movement_type"` // "entry" or "exit"
	Quantity     int       `json:"quantity"`
	CreatedAt    time.Time `json:"created_at"`
	UserID       int64     `json:"user_id"`
	Reason       string    `json:"reason"`
}
