<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $users = [
            ['name' => 'Owner Demo', 'email' => 'owner@example.com', 'role' => 'owner', 'pin' => '11112222'],
            ['name' => 'Manager Demo', 'email' => 'manager@example.com', 'role' => 'manager', 'pin' => '22223333'],
            ['name' => 'Server Demo', 'email' => 'server@example.com', 'role' => 'server', 'pin' => '33334444'],
        ];

        foreach ($users as $u) {
            DB::table('users')->updateOrInsert(
                ['name' => $u['name']],
                [
                    'email' => $u['email'],
                    'pin_hash' => Hash::make($u['pin']),
                    'role' => $u['role'],
                    'status' => 'active',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }
}


