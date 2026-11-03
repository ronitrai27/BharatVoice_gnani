package onboarding

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrNotFound         = errors.New("onboarding not found")
	ErrAlreadyOnboarded = errors.New("user already completed onboarding")
)

// Repository is the only thing that knows about SQL. The service depends on
// this interface, not on Postgres, which keeps it easy to test.
type Repository interface {
	Create(ctx context.Context, ownerUserID string, in CreateInput) (Profile, error)
	GetByOwner(ctx context.Context, ownerUserID string) (Profile, error)
}

type PostgresRepository struct {
	pool *pgxpool.Pool
}

func NewPostgresRepository(pool *pgxpool.Pool) *PostgresRepository {
	return &PostgresRepository{pool: pool}
}

// Create saves the business and its AI employee in ONE transaction: either
// both rows are saved or neither is.
func (r *PostgresRepository) Create(ctx context.Context, ownerUserID string, in CreateInput) (Profile, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return Profile{}, fmt.Errorf("begin tx: %w", err)
	}
	// Rollback is a no-op after a successful Commit, so it is safe to defer.
	defer tx.Rollback(ctx)

	var p Profile
	err = tx.QueryRow(ctx, `
		INSERT INTO businesses (owner_user_id, shop_name, category, city, owner_phone)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, owner_user_id, shop_name, category, city, owner_phone, created_at`,
		ownerUserID, in.ShopName, in.Category, in.City, in.Phone,
	).Scan(&p.Business.ID, &p.Business.OwnerUserID, &p.Business.ShopName, &p.Business.Category,
		&p.Business.City, &p.Business.OwnerPhone, &p.Business.CreatedAt)
	if err != nil {
		if isUniqueViolation(err) {
			return Profile{}, ErrAlreadyOnboarded
		}
		return Profile{}, fmt.Errorf("insert business: %w", err)
	}

	err = tx.QueryRow(ctx, `
		INSERT INTO ai_employees (business_id, name, language, purpose)
		VALUES ($1, $2, $3, $4)
		RETURNING id, business_id, name, language, purpose, created_at`,
		p.Business.ID, in.AIEmployeeName, in.PreferredLanguage, in.Purpose,
	).Scan(&p.AIEmployee.ID, &p.AIEmployee.BusinessID, &p.AIEmployee.Name,
		&p.AIEmployee.Language, &p.AIEmployee.Purpose, &p.AIEmployee.CreatedAt)
	if err != nil {
		return Profile{}, fmt.Errorf("insert ai employee: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return Profile{}, fmt.Errorf("commit: %w", err)
	}
	return p, nil
}

func (r *PostgresRepository) GetByOwner(ctx context.Context, ownerUserID string) (Profile, error) {
	var p Profile
	err := r.pool.QueryRow(ctx, `
		SELECT b.id, b.owner_user_id, b.shop_name, b.category, b.city, b.owner_phone, b.created_at,
		       e.id, e.business_id, e.name, e.language, e.purpose, e.created_at
		FROM businesses b
		JOIN ai_employees e ON e.business_id = b.id
		WHERE b.owner_user_id = $1
		ORDER BY e.created_at
		LIMIT 1`,
		ownerUserID,
	).Scan(&p.Business.ID, &p.Business.OwnerUserID, &p.Business.ShopName, &p.Business.Category,
		&p.Business.City, &p.Business.OwnerPhone, &p.Business.CreatedAt,
		&p.AIEmployee.ID, &p.AIEmployee.BusinessID, &p.AIEmployee.Name,
		&p.AIEmployee.Language, &p.AIEmployee.Purpose, &p.AIEmployee.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return Profile{}, ErrNotFound
	}
	if err != nil {
		return Profile{}, fmt.Errorf("get profile: %w", err)
	}
	return p, nil
}

// isUniqueViolation reports whether err is Postgres error 23505
// ("this value already exists in a unique column").
func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}
