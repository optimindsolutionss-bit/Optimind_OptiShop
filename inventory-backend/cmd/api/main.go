package main

import (
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
)

/*
  main.go — Punto de entrada de la aplicación.
  Este archivo levanta un servidor HTTP básico usando el router "chi".
  Todos los comentarios estarán en español para ayudarte a entender cada parte.
*/

func main() {
	r := chi.NewRouter()

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("🏠 Welcome to the Inventory API — Backend is running"))
	})

	// Middleware simple: en el futuro agregaremos logging, CORS, etc.

	// Ruta de prueba para verificar que el servidor funciona
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Levanta el servidor en el puerto 8080
	log.Println("✅ Server running on port 8080")
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatal(err)
	}
}
