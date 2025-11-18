<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    /**
     * Parse date range from request: start/end or preset (7d, 30d, qtd, ytd).
     */
    private function resolveDateRange(Request $request): array
    {
        $preset = $request->query('preset');
        $start = $request->query('start');
        $end = $request->query('end');

        // Use now/endOfDay to avoid cutting off current-day data at 00:00
        $now = Carbon::now('UTC');
        if (!$start || !$end) {
            switch ($preset) {
                case '30d':
                    $startDate = $now->copy()->subDays(29)->startOfDay();
                    $endDate = $now->copy()->endOfDay();
                    break;
                case 'qtd':
                    $currentMonth = (int) $now->format('n');
                    $qStartMonth = (int) (floor(($currentMonth - 1) / 3) * 3) + 1;
                    $startDate = Carbon::create((int) $now->format('Y'), $qStartMonth, 1, 0, 0, 0, 'UTC')->startOfDay();
                    $endDate = $now->copy()->endOfDay();
                    break;
                case 'ytd':
                    $startDate = Carbon::create((int) $now->format('Y'), 1, 1, 0, 0, 0, 'UTC')->startOfDay();
                    $endDate = $now->copy()->endOfDay();
                    break;
                case '7d':
                default:
                    $startDate = $now->copy()->subDays(6)->startOfDay();
                    $endDate = $now->copy()->endOfDay();
                    break;
            }
        } else {
            $startDate = Carbon::parse($start, 'UTC')->startOfDay();
            $endDate = Carbon::parse($end, 'UTC')->endOfDay();
        }

        return [$startDate->toDateTimeString(), $endDate->toDateTimeString()];
    }

    public function summary(Request $request)
    {
        [$start, $end] = $this->resolveDateRange($request);

        // Optional filters
        $role = $request->query('role'); // server/manager/bartender/chef
        $skuOrGroup = $request->query('sku_or_group'); // sku or product group tag

        // Build WHERE fragments
        $wherePaid = "o.status = 'paid' AND o.created_at BETWEEN :start AND :end";
        $wherePending = "o.status = 'pending' AND o.created_at BETWEEN :start AND :end";
        $bindings = ['start' => $start, 'end' => $end];

        if ($role && $role !== 'all') {
            $wherePaid .= " AND EXISTS (SELECT 1 FROM users u WHERE u.id = o.user_id AND u.role = :role)";
            $wherePending .= " AND EXISTS (SELECT 1 FROM users u WHERE u.id = o.user_id AND u.role = :role)";
            $bindings['role'] = $role;
        }

        // Revenue comes from line items in JSONB array: items = [{sku,name,price,qty,flavor}, ...]
        // Filter by sku/group if provided (simple sku match).
        $skuFilter = "";
        if ($skuOrGroup && $skuOrGroup !== 'all') {
            $skuFilter = " AND (itm->>'sku' = :sku) ";
            $bindings['sku'] = $skuOrGroup;
        }

        $sql = "
        WITH paid_orders AS (
            SELECT o.id, o.seats, o.created_at, o.items
            FROM orders o
            WHERE $wherePaid
        ),
        paid_items AS (
            SELECT
                COALESCE(NULLIF(itm->>'price','')::numeric, 0) AS price,
                COALESCE(NULLIF(itm->>'qty','')::int, 0) AS qty
            FROM paid_orders p,
            LATERAL jsonb_array_elements(COALESCE(p.items::jsonb, '[]'::jsonb)) AS itm
            WHERE TRUE $skuFilter
        )
        SELECT
            COALESCE((SELECT SUM(price*qty) FROM paid_items), 0) AS revenue,
            (SELECT COUNT(*) FROM orders o WHERE $wherePaid) AS orders,
            CASE
              WHEN (SELECT COUNT(*) FROM orders o WHERE $wherePaid) > 0
              THEN ROUND(
                COALESCE((SELECT SUM(price*qty) FROM paid_items), 0)
                / (SELECT COUNT(*) FROM orders o WHERE $wherePaid), 2
              )
              ELSE 0
            END AS aov,
            (SELECT COALESCE(SUM(seats),0) FROM orders o WHERE $wherePaid) AS guests,
            (SELECT COUNT(*) FROM orders o WHERE $wherePending) AS open_tabs,
            CASE
              WHEN ((SELECT COUNT(*) FROM orders o WHERE $wherePaid)
                    + (SELECT COUNT(*) FROM orders o WHERE $wherePending)) > 0
              THEN ROUND(
                (SELECT COUNT(*) FROM orders o WHERE $wherePaid)::numeric
                / (
                  (SELECT COUNT(*) FROM orders o WHERE $wherePaid)
                  + (SELECT COUNT(*) FROM orders o WHERE $wherePending)
                ), 4
              )
              ELSE 0
            END AS payment_rate
        ;
        ";

        $row = DB::selectOne($sql, $bindings);

        return response()->json([
            'revenue' => (float) ($row->revenue ?? 0),
            'orders' => (int) ($row->orders ?? 0),
            'aov' => (float) ($row->aov ?? 0),
            'guests' => (int) ($row->guests ?? 0),
            'open_tabs' => (int) ($row->open_tabs ?? 0),
            'payment_rate' => (float) ($row->payment_rate ?? 0),
        ]);
    }

    public function products(Request $request)
    {
        [$start, $end] = $this->resolveDateRange($request);
        $bindings = ['start' => $start, 'end' => $end];

        $role = $request->query('role');
        $where = "o.status = 'paid' AND o.created_at BETWEEN :start AND :end";
        if ($role && $role !== 'all') {
            $where .= " AND EXISTS (SELECT 1 FROM users u WHERE u.id = o.user_id AND u.role = :role)";
            $bindings['role'] = $role;
        }

        $sql = "
        WITH base AS (
            SELECT o.items
            FROM orders o
            WHERE $where
        ),
        expanded AS (
            SELECT
                (itm->>'sku') AS sku,
                (itm->>'name') AS name,
                COALESCE(NULLIF(itm->>'price','')::numeric, 0) AS price,
                COALESCE(NULLIF(itm->>'qty','')::int, 0) AS qty
            FROM base,
            LATERAL jsonb_array_elements(COALESCE(items::jsonb, '[]'::jsonb)) AS itm
        )
        SELECT
            sku,
            name,
            SUM(qty) AS total_qty,
            ROUND(SUM(price*qty), 2) AS total_revenue
        FROM expanded
        GROUP BY sku, name
        ORDER BY total_qty DESC
        LIMIT 50;
        ";

        $rows = DB::select($sql, $bindings);
        return response()->json($rows);
    }

    public function staff(Request $request)
    {
        [$start, $end] = $this->resolveDateRange($request);
        $bindings = ['start' => $start, 'end' => $end];

        $role = $request->query('role');
        $where = "o.status = 'paid' AND o.created_at BETWEEN :start AND :end";
        if ($role && $role !== 'all') {
            $where .= " AND EXISTS (SELECT 1 FROM users u WHERE u.id = o.user_id AND u.role = :role)";
            $bindings['role'] = $role;
        }

        $sql = "
        WITH paid_orders AS (
            SELECT o.id, o.user_id, o.seats, o.items
            FROM orders o
            WHERE $where
        ),
        expanded AS (
            SELECT
                p.user_id,
                COALESCE(NULLIF(itm->>'price','')::numeric, 0) AS price,
                COALESCE(NULLIF(itm->>'qty','')::int, 0) AS qty
            FROM paid_orders p,
            LATERAL jsonb_array_elements(COALESCE(p.items::jsonb, '[]'::jsonb)) AS itm
        ),
        revenue_by_user AS (
            SELECT user_id, SUM(price*qty) AS revenue
            FROM expanded
            GROUP BY user_id
        )
        SELECT
            u.id AS user_id,
            COALESCE(u.name, CONCAT('User #', u.id::text)) AS name,
            u.role,
            COUNT(po.id) AS orders,
            COALESCE(r.revenue, 0)::numeric(12,2) AS revenue,
            CASE WHEN COUNT(po.id) > 0 THEN ROUND(COALESCE(r.revenue,0) / COUNT(po.id), 2) ELSE 0 END AS aov,
            COALESCE(SUM(po.seats), 0) AS guests
        FROM paid_orders po
        JOIN users u ON u.id = po.user_id
        LEFT JOIN revenue_by_user r ON r.user_id = po.user_id
        GROUP BY u.id, u.name, u.role, r.revenue
        ORDER BY revenue DESC
        LIMIT 100;
        ";

        $rows = DB::select($sql, $bindings);
        return response()->json($rows);
    }

    public function orders(Request $request)
    {
        [$start, $end] = $this->resolveDateRange($request);
        $page = max(1, (int) $request->query('page', 1));
        $perPage = min(100, max(10, (int) $request->query('per_page', 20)));
        $offset = ($page - 1) * $perPage;

        $bindings = [
            'start' => $start,
            'end' => $end,
            'limit' => $perPage,
            'offset' => $offset,
        ];

        $role = $request->query('role');
        $where = "o.created_at BETWEEN :start AND :end";
        if ($role && $role !== 'all') {
            $where .= " AND EXISTS (SELECT 1 FROM users u WHERE u.id = o.user_id AND u.role = :role)";
            $bindings['role'] = $role;
        }

        // Optional filters
        $tableId = $request->query('table_id');
        if ($tableId) {
            $where .= " AND o.table_id = :table_id";
            $bindings['table_id'] = (int) $tableId;
        }
        $q = trim((string) $request->query('q', ''));
        if ($q !== '') {
            // Search by order id, table number or ordered_by (case-insensitive)
            $where .= " AND (CAST(o.id AS TEXT) ILIKE :q OR CAST(o.table_id AS TEXT) ILIKE :q OR o.ordered_by ILIKE :q)";
            $bindings['q'] = '%' . $q . '%';
        }

        // Sorting whitelist
        $sortBy = (string) $request->query('sort_by', 'created_at');
        $sortDir = strtolower((string) $request->query('sort_dir', 'desc')) === 'asc' ? 'ASC' : 'DESC';
        $allowedSort = [
            'created_at' => 'b.created_at',
            'revenue' => 'revenue',
            'id' => 'b.id',
            'table_id' => 'b.table_id',
            'status' => 'b.status',
            'seats' => 'b.seats',
        ];
        $orderExpr = $allowedSort[$sortBy] ?? 'b.created_at';

        $sql = "
        WITH base AS (
            SELECT o.*
            FROM orders o
            WHERE $where
        ),
        expanded AS (
            SELECT
                b.id,
                COALESCE(NULLIF(itm->>'price','')::numeric, 0) AS price,
                COALESCE(NULLIF(itm->>'qty','')::int, 0) AS qty
            FROM base b,
            LATERAL jsonb_array_elements(COALESCE(b.items::jsonb, '[]'::jsonb)) AS itm
        ),
        revenue_by_order AS (
            SELECT id, SUM(price*qty) AS revenue
            FROM expanded
            GROUP BY id
        ),
        counted AS (
            SELECT COUNT(*) AS total_count FROM base
        )
        SELECT
            b.id,
            b.table_id,
            b.user_id,
            b.ordered_by,
            b.status,
            b.seats,
            b.created_at,
            b.updated_at,
            COALESCE(r.revenue, 0)::numeric(12,2) AS revenue,
            t.table_number,
            (SELECT total_count FROM counted) AS total_count
        FROM base b
        LEFT JOIN revenue_by_order r ON r.id = b.id
        LEFT JOIN tables t ON t.id = b.table_id
        ORDER BY $orderExpr $sortDir, b.id DESC
        LIMIT :limit OFFSET :offset
        ";

        $rows = DB::select($sql, $bindings);
        $total = 0;
        if (!empty($rows)) {
            $total = (int) ($rows[0]->total_count ?? 0);
        } else {
            // count separately if page empty
            $countRow = DB::selectOne("SELECT COUNT(*) AS c FROM orders o WHERE $where", $bindings);
            $total = (int) ($countRow->c ?? 0);
        }

        return response()->json([
            'data' => array_map(function ($r) {
                return [
                    'id' => (int) $r->id,
                    'table_id' => (int) $r->table_id,
                    'user_id' => (int) $r->user_id,
                    'ordered_by' => $r->ordered_by,
                    'status' => $r->status,
                    'seats' => isset($r->seats) ? (int) $r->seats : null,
                    'created_at' => $r->created_at,
                    'updated_at' => $r->updated_at,
                    'revenue' => (float) $r->revenue,
                ];
            }, $rows),
            'pagination' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => $perPage > 0 ? (int) ceil($total / $perPage) : 0,
            ],
        ]);
    }
}


