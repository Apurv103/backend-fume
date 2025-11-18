<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrdersSeeder extends Seeder
{
    public function run(): void
    {
        // Find a server user to own the historical orders
        $serverId = (int) DB::table('users')->where('role', 'server')->value('id');
        if (!$serverId) {
            $serverId = (int) DB::table('users')->insertGetId([
                'name' => 'Server Auto',
                'email' => 'server.auto@example.com',
                'pin_hash' => bcrypt('33334444'),
                'role' => 'server',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Ensure tables exist
        $tableCount = (int) DB::table('tables')->count();
        if ($tableCount === 0) {
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
            $tableCount = 15;
        }

        // Minimal "menu" catalog for items (sku, name, price)
        $menu = [
            ['sku' => 'signature', 'name' => 'Signature Cocktail', 'price' => 16.00],
            ['sku' => 'classic',   'name' => 'Classic Cocktail',   'price' => 12.00],
            ['sku' => 'beer',      'name' => 'Beer',               'price' => 8.00],
            ['sku' => 'wine',      'name' => 'Wine Glass',         'price' => 10.00],
            ['sku' => 'food',      'name' => 'Food Item',          'price' => 14.00],
            ['sku' => 'shisha',    'name' => 'Shisha',             'price' => 25.00],
        ];

        // Target ~36,500 orders across last 365 days, ~1,000,000 revenue
        $days = 365;
        $ordersPerDay = 100; // 100 * 365 = 36,500

        // Use UTC timestamps consistently
        $nowTs = strtotime(gmdate('Y-m-d H:i:s'));
        $oneDay = 86400;

        $batch = [];
        $batchSize = 500;

        $initials = [
            'AA','AB','AC','AD','AE','AF','AG','AH','AI','AJ',
            'BA','BB','BC','BD','BE','BF','BG','BH','BI','BJ',
            'CA','CB','CC','CD','CE','CF','CG','CH','CI','CJ',
            'DA','DB','DC','DD','DE','DF','DG','DH','DI','DJ',
        ];

        for ($d = 0; $d < $days; $d++) {
            $dayStartTs = $nowTs - ($d * $oneDay);
            for ($i = 0; $i < $ordersPerDay; $i++) {
                // Random time within the day
                $ts = $dayStartTs - rand(0, $oneDay - 1);
                $createdAt = gmdate('Y-m-d H:i:s', $ts);

                // Choose 1-3 items and compute total around ~ $25-35
                $numItems = rand(1, 3);
                $items = [];
                $total = 0.0;
                for ($k = 0; $k < $numItems; $k++) {
                    $item = $menu[array_rand($menu)];
                    $qty = rand(1, 2);
                    $items[] = [
                        'sku' => $item['sku'],
                        'name' => $item['name'],
                        'price' => $item['price'],
                        'qty' => $qty,
                    ];
                    $total += $item['price'] * $qty;
                }
                // If total a bit low, optionally top up with a beer/wine
                if ($total < 18) {
                    $top = (rand(0,1) ? $menu[2] : $menu[3]);
                    $items[] = ['sku' => $top['sku'], 'name' => $top['name'], 'price' => $top['price'], 'qty' => 1];
                    $total += $top['price'];
                }

                // Customer initials + 2-digit suffix for readability
                $cust = $initials[array_rand($initials)] . sprintf('%02d', rand(0, 99));

                $batch[] = [
                    'table_id' => rand(1, $tableCount),
                    'user_id' => $serverId,
                    'items' => json_encode($items),
                    'ordered_by' => $cust,
                    'seats' => rand(1, 6),
                    'status' => 'paid', // keep historical dataset paid to avoid pending unique index conflicts
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ];

                if (count($batch) >= $batchSize) {
                    DB::table('orders')->insert($batch);
                    $batch = [];
                }
            }
        }

        if (!empty($batch)) {
            DB::table('orders')->insert($batch);
        }
    }
}


