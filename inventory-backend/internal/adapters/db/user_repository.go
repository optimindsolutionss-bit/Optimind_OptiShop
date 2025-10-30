package db

import (
	"context"
	"errors"

	"github.com/Brayantorres29/inventory-backend/internal/domain"
	"github.com/jackc/pgx/v5"
)

type UserRepository struct {
	Conn *pgx.Conn
}

func NewUserRepository(conn *pgx.Conn) *UserRepository {
	return &UserRepository{Conn: conn}
}

func (r *UserRepository) GetByUsername(username string) (*domain.User, error) {
	row := r.Conn.QueryRow(context.Background(),
		`SELECT id, username, password_hash, role FROM users WHERE username=$1`, username)

	var user domain.User
	if err := row.Scan(&user.ID, &user.Username, &user.PasswordHash, &user.Role); err != nil {
		if err.Error() == "no rows in result set" {
			return nil, errors.New("usuario no encontrado")
		}
		return nil, err
	}
	return &user, nil
}
