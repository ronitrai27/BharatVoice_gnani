// Package onboarding saves what a shop owner tells us when they first sign up:
// their shop, and the AI employee they want.
//
// The package is split in layers, each in its own file:
//
//	handler.go     HTTP: reads the request, writes the response
//	service.go     business rules: validate, then save
//	repository.go  SQL: the only file that talks to the database
package onboarding

import "time"

// Business is the shop owner's business (table: businesses).
type Business struct {
	ID          string    `json:"id"`
	OwnerUserID string    `json:"ownerUserId"`
	ShopName    string    `json:"shopName"`
	Category    string    `json:"category"`
	City        string    `json:"city"`
	OwnerPhone  string    `json:"ownerPhone"`
	CreatedAt   time.Time `json:"createdAt"`
}

// AIEmployee is the voice agent that works for a business (table: ai_employees).
type AIEmployee struct {
	ID         string    `json:"id"`
	BusinessID string    `json:"businessId"`
	Name       string    `json:"name"`
	Language   string    `json:"language"`
	Purpose    string    `json:"purpose"`
	CreatedAt  time.Time `json:"createdAt"`
}

// Profile is what the API returns: the business and its AI employee together.
type Profile struct {
	Business   Business   `json:"business"`
	AIEmployee AIEmployee `json:"aiEmployee"`
}

// CreateInput is the JSON body of POST /v1/onboarding, in the order the
// onboarding questions are asked.
type CreateInput struct {
	PreferredLanguage string `json:"preferredLanguage"`
	ShopName          string `json:"shopName"`
	Category          string `json:"category"`
	City              string `json:"city"`
	Purpose           string `json:"purpose"`
	Phone             string `json:"phone"`
	AIEmployeeName    string `json:"aiEmployeeName"`
}
