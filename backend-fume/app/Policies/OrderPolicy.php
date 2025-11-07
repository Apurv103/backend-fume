<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function view(User $user, Order $order): bool
    {
        if (in_array($user->role, ['manager', 'owner'], true)) {
            return true;
        }
        return $user->role === 'server' && $order->user_id === $user->id;
    }

    public function updateStatus(User $user, Order $order): bool
    {
        return in_array($user->role, ['manager', 'owner'], true);
    }
}


