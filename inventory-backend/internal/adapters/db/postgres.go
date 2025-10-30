package db

import (
	"context"
	"fmt"
	"log"

	"github.com/Brayantorres29/inventory-backend/internal/domain"
	"github.com/jackc/pgx/v5"
)

type PostgresRepository struct {
	Conn *pgx.Conn
}

// 🔌 Conecta a PostgreSQL y asegura que las tablas existan
func NewPostgresRepository() *PostgresRepository {
	url := "postgres://postgres:admin@localhost:5432/inventory_app"
	conn, err := pgx.Connect(context.Background(), url)
	if err != nil {
		log.Fatalf("❌ Error al conectar a PostgreSQL: %v", err)
	}
	fmt.Println("✅ Conectado a PostgreSQL")

	// Crear tabla items si no existe
	createTable := `
	CREATE TABLE IF NOT EXISTS items (
		id SERIAL PRIMARY KEY,
		name TEXT,
		quantity INT,
		price NUMERIC,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`
	_, err = conn.Exec(context.Background(), createTable)
	if err != nil {
		log.Fatalf("❌ Error creando tabla items: %v", err)
	}

	// Crear tabla inventory_movements si no existe
	createMovements := `
	CREATE TABLE IF NOT EXISTS inventory_movements (
		id SERIAL PRIMARY KEY,
		product_id INT REFERENCES items(id) ON DELETE CASCADE,
		movement_type VARCHAR(10) NOT NULL,
		quantity INT NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		user_id INT,
		reason TEXT
	);`
	_, err = conn.Exec(context.Background(), createMovements)
	if err != nil {
		log.Fatalf("❌ Error creando tabla inventory_movements: %v", err)
	}

	return &PostgresRepository{Conn: conn}
}

// /////////////////////////
// ITEMS
// /////////////////////////
func (r *PostgresRepository) AddItem(item *domain.InventoryItem) error {
	query := `INSERT INTO items (name, quantity, price) VALUES ($1, $2, $3) RETURNING id, created_at`
	return r.Conn.QueryRow(context.Background(), query, item.Name, item.Quantity, item.Price).
		Scan(&item.ID, &item.CreatedAt)
}

func (r *PostgresRepository) ListItems() ([]domain.InventoryItem, error) {
	rows, err := r.Conn.Query(context.Background(),
		`SELECT id, name, quantity, price, created_at FROM items ORDER BY id ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []domain.InventoryItem
	for rows.Next() {
		var item domain.InventoryItem
		if err := rows.Scan(&item.ID, &item.Name, &item.Quantity, &item.Price, &item.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}

func (r *PostgresRepository) GetItemByID(id int64) (domain.InventoryItem, error) {
	var item domain.InventoryItem
	err := r.Conn.QueryRow(context.Background(),
		`SELECT id, name, quantity, price, created_at FROM items WHERE id=$1`, id).
		Scan(&item.ID, &item.Name, &item.Quantity, &item.Price, &item.CreatedAt)
	if err != nil {
		return domain.InventoryItem{}, err
	}
	return item, nil
}

func (r *PostgresRepository) UpdateItem(item domain.InventoryItem) error {
	_, err := r.Conn.Exec(context.Background(),
		`UPDATE items SET name=$1, quantity=$2, price=$3 WHERE id=$4`,
		item.Name, item.Quantity, item.Price, item.ID)
	return err
}

func (r *PostgresRepository) DeleteItem(id int64) error {
	_, err := r.Conn.Exec(context.Background(), `DELETE FROM items WHERE id=$1`, id)
	return err
}

// /////////////////////////
// MOVIMIENTOS DE INVENTARIO
// /////////////////////////
func (r *PostgresRepository) AddMovement(m *domain.InventoryMovement) error {
	query := `INSERT INTO inventory_movements 
	(product_id, movement_type, quantity, user_id, reason)
	VALUES ($1,$2,$3,$4,$5) RETURNING id, created_at`
	return r.Conn.QueryRow(context.Background(), query,
		m.ProductID, m.MovementType, m.Quantity, m.UserID, m.Reason).
		Scan(&m.ID, &m.CreatedAt)
}

func (r *PostgresRepository) ListMovements() ([]domain.InventoryMovement, error) {
	rows, err := r.Conn.Query(context.Background(),
		`SELECT id, product_id, movement_type, quantity, created_at, user_id, reason
		 FROM inventory_movements ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var movements []domain.InventoryMovement
	for rows.Next() {
		var m domain.InventoryMovement
		if err := rows.Scan(&m.ID, &m.ProductID, &m.MovementType, &m.Quantity, &m.CreatedAt, &m.UserID, &m.Reason); err != nil {
			return nil, err
		}
		movements = append(movements, m)
	}
	return movements, nil

}

// 🔎 Buscar productos según filtros
func (r *PostgresRepository) SearchItems(name string, minQuantity int, maxPrice float64) ([]domain.InventoryItem, error) {
	query := `SELECT id, name, quantity, price, created_at FROM items WHERE 1=1`
	args := []interface{}{}
	argID := 1

	if name != "" {
		query += fmt.Sprintf(" AND name ILIKE $%d", argID)
		args = append(args, "%"+name+"%")
		argID++
	}
	if minQuantity >= 0 {
		query += fmt.Sprintf(" AND quantity >= $%d", argID)
		args = append(args, minQuantity)
		argID++
	}
	if maxPrice >= 0 {
		query += fmt.Sprintf(" AND price <= $%d", argID)
		args = append(args, maxPrice)
		argID++
	}

	rows, err := r.Conn.Query(context.Background(), query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []domain.InventoryItem
	for rows.Next() {
		var item domain.InventoryItem
		if err := rows.Scan(&item.ID, &item.Name, &item.Quantity, &item.Price, &item.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}
