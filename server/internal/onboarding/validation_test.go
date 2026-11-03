package onboarding

import "testing"

func validInput() CreateInput {
	return CreateInput{
		PreferredLanguage: "hi",
		ShopName:          "  Gupta General Store ",
		Category:          "grocery",
		City:              "Jaipur",
		Purpose:           "  I want to answer customers on WhatsApp  ",
		Phone:             "98765 43210",
		AIEmployeeName:    "Asha",
	}
}

func TestValidate_ValidInputIsCleaned(t *testing.T) {
	got, errs := Validate(validInput())

	if len(errs) != 0 {
		t.Fatalf("expected no errors, got %v", errs)
	}
	if got.ShopName != "Gupta General Store" {
		t.Errorf("shop name not trimmed: %q", got.ShopName)
	}
	if got.Phone != "+919876543210" {
		t.Errorf("phone not normalized: %q", got.Phone)
	}
	if got.Purpose != "I want to answer customers on WhatsApp" {
		t.Errorf("purpose not trimmed: %q", got.Purpose)
	}
}

func TestValidate_RejectsBadFields(t *testing.T) {
	tests := []struct {
		name  string
		edit  func(*CreateInput)
		field string
	}{
		{"unknown language", func(i *CreateInput) { i.PreferredLanguage = "fr" }, "preferredLanguage"},
		{"short shop name", func(i *CreateInput) { i.ShopName = "A" }, "shopName"},
		{"unknown category", func(i *CreateInput) { i.Category = "spaceship" }, "category"},
		{"empty city", func(i *CreateInput) { i.City = " " }, "city"},
		{"empty purpose", func(i *CreateInput) { i.Purpose = " " }, "purpose"},
		{"short phone", func(i *CreateInput) { i.Phone = "12345" }, "phone"},
		{"phone not starting 6-9", func(i *CreateInput) { i.Phone = "1234567890" }, "phone"},
		{"empty agent name", func(i *CreateInput) { i.AIEmployeeName = "" }, "aiEmployeeName"},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			in := validInput()
			tc.edit(&in)

			_, errs := Validate(in)
			if _, ok := errs[tc.field]; !ok {
				t.Errorf("expected an error on %q, got %v", tc.field, errs)
			}
		})
	}
}

func TestNormalizePhone(t *testing.T) {
	tests := map[string]string{
		"9876543210":      "+919876543210",
		"+91 98765-43210": "+919876543210",
		"09876543210":     "+919876543210",
		"919876543210":    "+919876543210",
	}
	for raw, want := range tests {
		got, ok := normalizePhone(raw)
		if !ok || got != want {
			t.Errorf("normalizePhone(%q) = %q, %v; want %q", raw, got, ok, want)
		}
	}
}
