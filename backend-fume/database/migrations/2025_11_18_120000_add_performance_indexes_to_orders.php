<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Create safe indexes if not exist
        DB::statement("CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC)");
        DB::statement("CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status)");
        DB::statement("CREATE INDEX IF NOT EXISTS orders_table_id_idx ON orders (table_id)");
        DB::statement("CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders (user_id)");
        // JSONB index for items to enable future SKU filters
        DB::statement("CREATE INDEX IF NOT EXISTS orders_items_gin ON orders USING gin ((items::jsonb))");
    }

    public function down(): void
    {
        DB::statement("DROP INDEX IF EXISTS orders_items_gin");
        DB::statement("DROP INDEX IF EXISTS orders_user_id_idx");
        DB::statement("DROP INDEX IF EXISTS orders_table_id_idx");
        DB::statement("DROP INDEX IF EXISTS orders_status_idx");
        DB::statement("DROP INDEX IF EXISTS orders_created_at_idx");
    }
};


