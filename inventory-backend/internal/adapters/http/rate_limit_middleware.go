package http

import (
	"net"
	"net/http"
	"sync"
	"time"
)

// RateLimiter almacena información de las solicitudes por IP
type RateLimiter struct {
	visitors map[string]*Visitor
	mu       sync.Mutex
	rate     int           // cantidad máxima de requests
	window   time.Duration // tiempo de reinicio
}

// Visitor representa un visitante (IP) con su contador y tiempo de expiración
type Visitor struct {
	lastSeen time.Time
	count    int
}

// NewRateLimiter crea un rate limiter con X requests por ventana
func NewRateLimiter(rate int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		visitors: make(map[string]*Visitor),
		rate:     rate,
		window:   window,
	}
	go rl.cleanup()
	return rl
}

// Middleware aplica el límite de peticiones por IP
func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip, _, _ := net.SplitHostPort(r.RemoteAddr)

		rl.mu.Lock()
		v, exists := rl.visitors[ip]
		if !exists || time.Since(v.lastSeen) > rl.window {
			v = &Visitor{lastSeen: time.Now(), count: 1}
			rl.visitors[ip] = v
		} else {
			v.count++
			v.lastSeen = time.Now()
		}
		rl.mu.Unlock()

		if v.count > rl.rate {
			w.WriteHeader(http.StatusTooManyRequests)
			respondJSON(w, http.StatusTooManyRequests, "Too many requests. Please try again later.", nil)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// cleanup elimina IPs inactivas
func (rl *RateLimiter) cleanup() {
	for {
		time.Sleep(time.Minute)
		rl.mu.Lock()
		for ip, v := range rl.visitors {
			if time.Since(v.lastSeen) > rl.window {
				delete(rl.visitors, ip)
			}
		}
		rl.mu.Unlock()
	}
}
