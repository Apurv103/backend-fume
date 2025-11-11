<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Partial unique index: only for pending tabs
        DB::statement("
            CREATE UNIQUE INDEX IF NOT EXISTS orders_unique_open_tab
            ON orders (user_id, table_id, COALESCE(ordered_by, ''))
            WHERE status = 'pending'
        ");
    }

    public function down(): void
    {
        DB::statement("DROP INDEX IF EXISTS orders_unique_open_tab");
    }
};


