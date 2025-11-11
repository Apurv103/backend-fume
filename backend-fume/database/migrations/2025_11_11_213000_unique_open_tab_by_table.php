<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Drop prior unique index if exists and set uniqueness by table only
        DB::statement("DROP INDEX IF EXISTS orders_unique_open_tab");
        // Cleanup: ensure at most one pending order per table by cancelling older duplicates
        DB::statement("
            WITH ranked AS (
                SELECT id, table_id, status,
                       ROW_NUMBER() OVER (PARTITION BY table_id ORDER BY id DESC) AS rn
                FROM orders
                WHERE status = 'pending'
            )
            UPDATE orders o
            SET status = 'canceled'
            FROM ranked r
            WHERE o.id = r.id
              AND r.rn > 1
        ");
        DB::statement("
            CREATE UNIQUE INDEX IF NOT EXISTS orders_unique_open_tab_by_table
            ON orders (table_id)
            WHERE status = 'pending'
        ");
    }

    public function down(): void
    {
        DB::statement("DROP INDEX IF EXISTS orders_unique_open_tab_by_table");
    }
};


