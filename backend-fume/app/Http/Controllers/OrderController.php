<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        // Managers/Owners only (route middleware enforces this)
        $validated = $request->validate([
            'status' => ['nullable', Rule::in(['pending', 'paid', 'canceled'])],
            'table_id' => ['nullable', 'integer', 'exists:tables,id'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'page' => ['nullable', 'integer', 'min:1'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $limit = $validated['limit'] ?? 50;

        $query = Order::query()->orderByDesc('id');

        if (!empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }
        if (!empty($validated['table_id'])) {
            $query->where('table_id', $validated['table_id']);
        }
        if (!empty($validated['from'])) {
            $query->where('created_at', '>=', $validated['from']);
        }
        if (!empty($validated['to'])) {
            $query->where('created_at', '<=', $validated['to']);
        }

        return response()->json($query->paginate($limit));
    }

    public function summary(Request $request)
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $query = Order::query();
        if (!empty($validated['from'])) {
            $query->where('created_at', '>=', $validated['from']);
        }
        if (!empty($validated['to'])) {
            $query->where('created_at', '<=', $validated['to']);
        }

        $orders = $query->get();

        $totalOrders = $orders->count();
        $paidOrders = $orders->where('status', 'paid')->count();
        $unpaidOrders = $orders->where('status', 'pending')->count();

        $computeTotal = static function (array $items): float {
            $sum = 0.0;
            foreach ($items as $it) {
                $qty = (int)($it['qty'] ?? $it['quantity'] ?? 0);
                $price = (float)($it['price'] ?? 0);
                $sum += $qty * $price;
            }
            return $sum;
        };

        $totalRevenue = 0.0;
        $pendingRevenue = 0.0;
        $totalGuests = 0;

        foreach ($orders as $order) {
            $items = is_array($order->items) ? $order->items : [];
            $orderTotal = $computeTotal($items);
            if ($order->status === 'paid') {
                $totalRevenue += $orderTotal;
            } elseif ($order->status === 'pending') {
                $pendingRevenue += $orderTotal;
            }
            if (!empty($order->seats)) {
                $totalGuests += (int)$order->seats;
            }
        }

        return response()->json([
            'totalOrders' => $totalOrders,
            'paidOrders' => $paidOrders,
            'unpaidOrders' => $unpaidOrders,
            'totalRevenue' => round($totalRevenue, 2),
            'pendingRevenue' => round($pendingRevenue, 2),
            'totalGuests' => $totalGuests,
        ]);
    }

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
            'items.*.flavor' => ['nullable', 'string', 'max:120'],
            'items.*.name' => ['nullable', 'string', 'max:200'],
            'ordered_by'  => ['nullable', 'string', 'max:120'],
            'seats'       => ['nullable', 'integer', 'min:1'],
        ]);

        // Find existing open tab for this table (any server).
        $open = Order::where('status', 'pending')
            ->where('table_id', $validated['table_id'])
            ->orderByDesc('id')
            ->first();

        if ($open) {
            // Only the owning server can append; otherwise table is taken
            if ($open->user_id !== $request->user()->id) {
                return response()->json(['message' => 'Table has an open bill awaiting payment.'], 409);
            }
            // Merge items by (sku, flavor)
            $existing = is_array($open->items) ? $open->items : [];
            $index = [];
            foreach ($existing as $idx => $it) {
                $key = ($it['sku'] ?? '').'|'.($it['flavor'] ?? '');
                $index[$key] = $idx;
            }
            foreach ($validated['items'] as $newItem) {
                $key = ($newItem['sku'] ?? '').'|'.($newItem['flavor'] ?? '');
                if (isset($index[$key])) {
                    $existing[$index[$key]]['qty'] = (int)($existing[$index[$key]]['qty'] ?? 0) + (int)$newItem['qty'];
                } else {
                    $existing[] = $newItem;
                    $index[$key] = count($existing) - 1;
                }
            }
            $open->items = $existing;
            $open->ordered_by = $validated['ordered_by'] ?? $open->ordered_by;
            if (!empty($validated['seats'])) {
                $open->seats = $validated['seats'];
            }
            $open->save();
            return response()->json($open->fresh());
        }

        $order = Order::create([
            'table_id'   => $validated['table_id'],
            'user_id'    => $request->user()->id,
            'items'      => $validated['items'],
            'ordered_by' => $validated['ordered_by'] ?? null,
            'seats'      => $validated['seats'] ?? null,
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
        $user = $request->user();
        // Servers can only settle their own orders
        if ($user->role === 'server' && $order->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $order->status = $validated['status'];
        $order->save();

        return response()->json($order);
    }

    public function open(Request $request)
    {
        $validated = $request->validate([
            'table_id' => ['required', 'integer', 'exists:tables,id'],
            'server_id' => ['nullable', 'integer', 'exists:users,id'], // managers/owners may pass
        ]);
        $user = $request->user();
        $serverId = $validated['server_id'] ?? $user->id;
        if ($user->role === 'server' && $serverId !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $open = Order::where('status', 'pending')
            ->where('table_id', $validated['table_id'])
            ->orderByDesc('id')
            ->first();

        // For servers, only return if it's their own open tab
        if ($user->role === 'server' && $open && $open->user_id !== $user->id) {
            return response()->json(['message' => 'Table has an open bill for another server.'], 409);
        }

        return response()->json($open);
    }
}

