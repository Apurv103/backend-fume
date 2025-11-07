<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TablesSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [];
        for ($i = 1; $i <= 15; $i++) {
            $rows[] = [
                'table_number' => $i,
                'seat_count' => $i <= 5 ? 4 : ($i <= 10 ? 6 : 8),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('tables')->upsert($rows, ['table_number']);
    }
}


