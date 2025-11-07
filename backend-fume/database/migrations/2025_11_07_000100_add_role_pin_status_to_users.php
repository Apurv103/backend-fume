<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('pin_hash')->after('password')->nullable();
            $table->string('role')->default('server')->index();
            $table->string('status')->default('active')->index();
            $table->dropColumn('password'); // we use pin_hash instead
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('password')->nullable();
            $table->dropColumn(['pin_hash', 'role', 'status']);
        });
    }
};


