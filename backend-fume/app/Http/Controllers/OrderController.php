<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function indexForTable(Request $request, int $tableId)
    {
        $table = Table::findOrFail($tableId);

        $query = Order::where('table_id', $table->id)->orderByDesc('id');

        $user = $request->user();
        if ($user->role === 'server') {
            $query->where('user_id', $user->id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_id'    => ['required', 'integer', 'exists:tables,id'],
            'items'       => ['required', 'array', 'min:1'],
            'items.*.sku' => ['required', 'string'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'ordered_by'  => ['nullable', 'string', 'max:120'],
        ]);

        $order = Order::create([
            'table_id'   => $validated['table_id'],
            'user_id'    => $request->user()->id,
            'items'      => $validated['items'],
            'ordered_by' => $validated['ordered_by'] ?? null,
            'status'     => 'pending',
        ]);

        return response()->json($order, 201);
    }

    public function updateStatus(Request $request, int $orderId)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['pending', 'paid', 'canceled'])],
        ]);

        $order = Order::findOrFail($orderId);
        $order->status = $validated['status'];
        $order->save();

        return response()->json($order);
    }
}

