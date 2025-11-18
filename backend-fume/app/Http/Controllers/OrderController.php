<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

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
        // Managers only see today's data, regardless of provided filters
        $user = $request->user();
        if ($user && $user->role === 'manager') {
            $start = Carbon::now('UTC')->startOfDay()->toDateTimeString();
            $end = Carbon::now('UTC')->endOfDay()->toDateTimeString();
            $query->whereBetween('created_at', [$start, $end]);
        } else {
            if (!empty($validated['from'])) {
                $query->where('created_at', '>=', $validated['from']);
            }
            if (!empty($validated['to'])) {
                $query->where('created_at', '<=', $validated['to']);
            }
        }

        return response()->json($query->paginate($limit));
    }

    public function summary(Request $request)
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $bindings = [];
        $where = '1=1';
        $user = $request->user();
        if ($user && $user->role === 'manager') {
            // Force current day window for managers
            $from = Carbon::now('UTC')->startOfDay()->toDateTimeString();
            $to = Carbon::now('UTC')->endOfDay()->toDateTimeString();
            $where .= ' AND o.created_at BETWEEN :from AND :to';
            $bindings['from'] = $from;
            $bindings['to'] = $to;
        } else {
            if (!empty($validated['from'])) {
                $where .= ' AND o.created_at >= :from';
                $bindings['from'] = $validated['from'];
            }
            if (!empty($validated['to'])) {
                $where .= ' AND o.created_at <= :to';
                $bindings['to'] = $validated['to'];
            }
        }

        // Use SQL with JSONB expansion to avoid loading all orders in memory.
        $sql = "
        WITH base AS (
            SELECT o.*
            FROM orders o
            WHERE $where
        ),
        paid AS (
            SELECT * FROM base WHERE status = 'paid'
        ),
        pending AS (
            SELECT * FROM base WHERE status = 'pending'
        ),
        paid_items AS (
            SELECT COALESCE(NULLIF(itm->>'price','')::numeric,0) AS price,
                   COALESCE(NULLIF(itm->>'qty','')::int,0) AS qty
            FROM paid, LATERAL jsonb_array_elements(paid.items::jsonb) AS itm
        ),
        pending_items AS (
            SELECT COALESCE(NULLIF(itm->>'price','')::numeric,0) AS price,
                   COALESCE(NULLIF(itm->>'qty','')::int,0) AS qty
            FROM pending, LATERAL jsonb_array_elements(pending.items::jsonb) AS itm
        )
        SELECT
            (SELECT COUNT(*) FROM base) AS total_orders,
            (SELECT COUNT(*) FROM paid) AS paid_orders,
            (SELECT COUNT(*) FROM pending) AS unpaid_orders,
            COALESCE((SELECT SUM(price*qty) FROM paid_items), 0)::numeric(12,2) AS total_revenue,
            COALESCE((SELECT SUM(price*qty) FROM pending_items), 0)::numeric(12,2) AS pending_revenue,
            COALESCE((SELECT SUM(seats) FROM base WHERE seats IS NOT NULL), 0) AS total_guests;
        ";

        $row = \DB::selectOne($sql, $bindings);

        return response()->json([
            'totalOrders' => (int) ($row->total_orders ?? 0),
            'paidOrders' => (int) ($row->paid_orders ?? 0),
            'unpaidOrders' => (int) ($row->unpaid_orders ?? 0),
            'totalRevenue' => (float) ($row->total_revenue ?? 0),
            'pendingRevenue' => (float) ($row->pending_revenue ?? 0),
            'totalGuests' => (int) ($row->total_guests ?? 0),
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
        if ($user->role === 'manager') {
            $start = Carbon::now('UTC')->startOfDay()->toDateTimeString();
            $end = Carbon::now('UTC')->endOfDay()->toDateTimeString();
            $query->whereBetween('created_at', [$start, $end]);
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

