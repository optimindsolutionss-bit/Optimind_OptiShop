package http

import (
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/Brayantorres29/inventory-backend/internal/application"
)

// LoggingMiddleware registra detalles de cada petición HTTP
func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Extraer usuario del token si existe
		authHeader := r.Header.Get("Authorization")
		username := "anonymous"
		role := "none"

		if strings.HasPrefix(authHeader, "Bearer ") {
			tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
			if claims, err := application.ValidateJWT(tokenStr); err == nil {
				if u, ok := claims["username"].(string); ok {
					username = u
				}
				if r, ok := claims["role"].(string); ok {
					role = r
				}
			}
		}

		// Crear un ResponseWriter temporal para capturar el código de estado
		lrw := &loggingResponseWriter{ResponseWriter: w, statusCode: http.StatusOK}

		// Pasar al siguiente handler
		next.ServeHTTP(lrw, r)

		// Tiempo total
		duration := time.Since(start)

		// Log final
		log.Printf("[INFO] user=%s role=%s method=%s path=%s status=%d duration=%v",
			username, role, r.Method, r.URL.Path, lrw.statusCode, duration)
	})
}

// loggingResponseWriter permite capturar el código de estado HTTP
type loggingResponseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (lrw *loggingResponseWriter) WriteHeader(code int) {
	lrw.statusCode = code
	lrw.ResponseWriter.WriteHeader(code)
}
