package domain

// User representa un usuario del sistema con su rol y credenciales.
type User struct {
	ID           int64  `json:"id"`
	Username     string `json:"username"`
	PasswordHash string `json:"-"` // no se envía al frontend
	Role         string `json:"role"`
}
