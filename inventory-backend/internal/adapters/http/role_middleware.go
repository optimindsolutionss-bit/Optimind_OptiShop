package http

import (
	"net/http"
	"strings"

	"github.com/Brayantorres29/inventory-backend/internal/application"
)

// RoleMiddleware verifica si el usuario tiene permiso para acceder a una ruta
func RoleMiddleware(allowedRoles ...string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				respondJSON(w, http.StatusUnauthorized, "Authorization header missing", nil)
				return
			}

			tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

			claims, err := application.ValidateJWT(tokenStr)
			if err != nil {
				respondJSON(w, http.StatusUnauthorized, "Invalid or expired token", nil)
				return
			}

			role, ok := claims["role"].(string)
			if !ok {
				respondJSON(w, http.StatusForbidden, "Invalid role in token", nil)
				return
			}

			// Verificar si el rol está permitido
			for _, allowed := range allowedRoles {
				if role == allowed {
					next.ServeHTTP(w, r)
					return
				}
			}

			// 🚫 Rol no autorizado
			respondJSON(w, http.StatusForbidden, "Access denied: insufficient permissions", nil)
		})
	}
}
