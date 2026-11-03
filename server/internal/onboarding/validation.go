package onboarding

import (
	"regexp"
	"slices"
	"strings"
	"unicode/utf8"
)

// Option is one choice shown in the onboarding UI.
type Option struct {
	Value string `json:"value"`
	Label string `json:"label"`
}

// The allowed answers live here, in one place. The UI loads them from
// GET /v1/onboarding/options, so the two can never drift apart.
//
// Languages: only the ones Gnani's voice layer handles best.
var (
	Languages = []Option{
		{"hi", "Hindi"},
		{"en", "English"},
		{"ta", "Tamil"},
		{"te", "Telugu"},
		{"kn", "Kannada"},
		{"ml", "Malayalam"},
		{"mr", "Marathi"},
		{"bn", "Bengali"},
		{"gu", "Gujarati"},
		{"pa", "Punjabi"},
	}

	Categories = []Option{
		{"grocery", "Kirana / Grocery"},
		{"restaurant", "Restaurant / Cafe"},
		{"fashion", "Clothing / Fashion"},
		{"electronics", "Electronics / Mobile"},
		{"pharmacy", "Pharmacy / Medical"},
		{"salon", "Salon / Beauty"},
		{"education", "Coaching / Education"},
		{"services", "Local services"},
		{"other", "Something else"},
	}
)

// Indian mobile numbers: 10 digits starting with 6-9.
var indianMobile = regexp.MustCompile(`^[6-9]\d{9}$`)

// Fields maps a field name to its error message. Empty means the input is valid.
type Fields map[string]string

// Validate checks the input and returns a cleaned copy (trimmed text, phone
// in +91XXXXXXXXXX form) together with any field errors.
func Validate(in CreateInput) (CreateInput, Fields) {
	errs := Fields{}

	in.ShopName = strings.TrimSpace(in.ShopName)
	in.City = strings.TrimSpace(in.City)
	in.AIEmployeeName = strings.TrimSpace(in.AIEmployeeName)
	in.Purpose = strings.TrimSpace(in.Purpose)

	if !hasValue(Languages, in.PreferredLanguage) {
		errs["preferredLanguage"] = "Choose one of the supported languages."
	}
	if !validLength(in.ShopName, 2, 80) {
		errs["shopName"] = "Shop name must be 2 to 80 characters."
	}
	if !hasValue(Categories, in.Category) {
		errs["category"] = "Choose a category."
	}
	if !validLength(in.City, 2, 60) {
		errs["city"] = "City must be 2 to 60 characters."
	}
	if !validLength(in.Purpose, 3, 500) {
		errs["purpose"] = "Tell us in 3 to 500 characters."
	}

	phone, ok := normalizePhone(in.Phone)
	if !ok {
		errs["phone"] = "Enter a valid 10-digit Indian mobile number."
	}
	in.Phone = phone

	if !validLength(in.AIEmployeeName, 2, 30) {
		errs["aiEmployeeName"] = "Name must be 2 to 30 characters."
	}

	return in, errs
}

// normalizePhone accepts "98765 43210", "+91 98765-43210", "09876543210" and
// returns "+919876543210".
func normalizePhone(raw string) (string, bool) {
	var digits strings.Builder
	for _, r := range raw {
		if r >= '0' && r <= '9' {
			digits.WriteRune(r)
		}
	}
	d := digits.String()
	switch {
	case len(d) == 12 && strings.HasPrefix(d, "91"):
		d = d[2:]
	case len(d) == 11 && strings.HasPrefix(d, "0"):
		d = d[1:]
	}
	if !indianMobile.MatchString(d) {
		return raw, false
	}
	return "+91" + d, true
}

func hasValue(options []Option, value string) bool {
	return slices.ContainsFunc(options, func(o Option) bool { return o.Value == value })
}

func validLength(s string, min, max int) bool {
	n := utf8.RuneCountInString(s)
	return n >= min && n <= max
}
