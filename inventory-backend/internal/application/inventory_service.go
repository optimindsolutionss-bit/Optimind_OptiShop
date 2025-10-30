package application

import (
	"errors"
	"time"

	"github.com/Brayantorres29/inventory-backend/internal/adapters/db"
	"github.com/Brayantorres29/inventory-backend/internal/domain"
)

type InventoryService struct {
	Repo *db.PostgresRepository
}

// NewInventoryService crea un nuevo servicio con el repositorio unificado
func NewInventoryService(repo *db.PostgresRepository) *InventoryService {
	return &InventoryService{Repo: repo}
}

//////////////////////
// Items CRUD
//////////////////////

func (s *InventoryService) AddItem(name string, quantity int, price float64) (domain.InventoryItem, error) {
	item := domain.InventoryItem{
		Name:     name,
		Quantity: quantity,
		Price:    price,
	}
	err := s.Repo.AddItem(&item)
	if err != nil {
		return domain.InventoryItem{}, err
	}
	return item, nil
}

func (s *InventoryService) ListItems() ([]domain.InventoryItem, error) {
	return s.Repo.ListItems()
}

func (s *InventoryService) GetItem(id int64) (domain.InventoryItem, error) {
	return s.Repo.GetItemByID(id)
}

func (s *InventoryService) UpdateItem(id int64, name string, quantity int, price float64) error {
	item := domain.InventoryItem{
		ID:       id,
		Name:     name,
		Quantity: quantity,
		Price:    price,
	}
	return s.Repo.UpdateItem(item)
}

func (s *InventoryService) DeleteItem(id int64) error {
	return s.Repo.DeleteItem(id)
}

func (s *InventoryService) SearchItems(name string, minQuantity int, maxPrice float64) ([]domain.InventoryItem, error) {
	return s.Repo.SearchItems(name, minQuantity, maxPrice)
}

func (s *InventoryService) PatchItem(id int64, name *string, quantity *int, price *float64) (domain.InventoryItem, error) {
	item, err := s.Repo.GetItemByID(id)
	if err != nil {
		return domain.InventoryItem{}, err
	}
	if name != nil {
		item.Name = *name
	}
	if quantity != nil {
		item.Quantity = *quantity
	}
	if price != nil {
		item.Price = *price
	}
	err = s.Repo.UpdateItem(item)
	if err != nil {
		return domain.InventoryItem{}, err
	}
	return item, nil
}

//////////////////////
// Inventory Movements
//////////////////////

func (s *InventoryService) CreateMovement(movement domain.InventoryMovement) (domain.InventoryMovement, error) {
	// Validar existencia del producto
	item, err := s.Repo.GetItemByID(movement.ProductID)
	if err != nil {
		return domain.InventoryMovement{}, err
	}

	// Validar stock si es salida
	if movement.MovementType == "exit" && item.Quantity < movement.Quantity {
		return domain.InventoryMovement{}, errors.New("insufficient stock")
	}

	// Actualizar stock
	if movement.MovementType == "entry" {
		item.Quantity += movement.Quantity
	} else if movement.MovementType == "exit" {
		item.Quantity -= movement.Quantity
	}

	if err := s.Repo.UpdateItem(item); err != nil {
		return domain.InventoryMovement{}, err
	}

	// Guardar movimiento
	movement.CreatedAt = time.Now()
	err = s.Repo.AddMovement(&movement)
	if err != nil {
		return domain.InventoryMovement{}, err
	}

	return movement, nil
}

func (s *InventoryService) ListMovements() ([]domain.InventoryMovement, error) {
	return s.Repo.ListMovements()
}
