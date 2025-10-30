package http

import (
	"net/http"
	"strings"

	"github.com/Brayantorres29/inventory-backend/internal/application"
)

// AuthMiddleware protege rutas que requieren JWT válido
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			respondJSON(w, http.StatusUnauthorized, "Falta header Authorization", nil)
			return
		}

		// Extrae el token (Bearer <token>)
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			respondJSON(w, http.StatusUnauthorized, "Formato de token inválido", nil)
			return
		}

		tokenStr := parts[1]
		claims, err := application.ValidateJWT(tokenStr)
		if err != nil {
			respondJSON(w, http.StatusUnauthorized, "Token inválido o expirado", nil)
			return
		}

		// ✅ Guardamos datos del usuario autenticado en el header de la request
		if username, ok := claims["username"].(string); ok {
			r.Header.Set("X-User", username)
		}
		if role, ok := claims["role"].(string); ok {
			r.Header.Set("X-Role", role)
		}

		// Si todo está bien, pasa al siguiente handler
		next.ServeHTTP(w, r)
	})
}
