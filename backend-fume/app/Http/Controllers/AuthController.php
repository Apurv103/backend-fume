<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'pin' => ['required', 'string', 'regex:/^[0-9]{8}$/'],
        ]);

        $user = User::where('status', 'active')->first();
        if (!$user) {
            throw ValidationException::withMessages([
                'pin' => ['Invalid credentials.'],
            ]);
        }

        // Look up by role/name/email if needed. For demo, check all active users for a matching pin.
        $matched = User::where('status', 'active')->get()->first(function ($u) use ($validated) {
            return Hash::check($validated['pin'], $u->pin_hash);
        });

        if (!$matched) {
            throw ValidationException::withMessages([
                'pin' => ['Invalid credentials.'],
            ]);
        }

        $token = $matched->createToken('api', [$matched->role])->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id' => $matched->id,
                'name' => $matched->name,
                'role' => $matched->role,
                'status' => $matched->status,
            ],
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}


