<?php

namespace App\Http\Controllers;

use App\Models\Table;

class TableController extends Controller
{
    public function index()
    {
        $tables = Table::orderBy('table_number')->get();
        return response()->json($tables);
    }
}


