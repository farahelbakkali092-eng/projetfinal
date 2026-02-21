<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserRoleRequest;
use App\Http\Requests\Admin\UpdateUserStatusRequest;
use App\Models\Role;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $query = User::query()->with('role');

        if ($request->filled('search')) {
           $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('email', 'ILIKE', "%{$search}%")
                    ->orWhere('first_name', 'ILIKE', "%{$search}%")
                    ->orWhere('last_name', 'ILIKE', "%{$search}%")
                    ->orWhere('phone', 'ILIKE', "%{$search}%");
            });
        }

        $users = $query->orderByDesc('id')->paginate($request->integer('per_page', 15));

        return $this->successResponse($users, 'Users retrieved successfully');
    }

    public function roles()
    {
        $roles = Role::orderBy('name')->get();
        return $this->successResponse($roles, 'Roles retrieved successfully');
    }

    public function updateRole(UpdateUserRoleRequest $request, int $id)
    {
        $user = User::with('role')->find($id);

        if (!$user) {
            return $this->errorResponse('User not found', 404);
        }

        $user->update(['role_id' => $request->validated()['role_id']]);

        return $this->successResponse($user->fresh()->load('role'), 'User role updated successfully');
    }

    public function updateStatus(UpdateUserStatusRequest $request, int $id)
    {
        $user = User::with('role')->find($id);

        if (!$user) {
            return $this->errorResponse('User not found', 404);
        }

        $user->update(['is_active' => $request->validated()['is_active']]);

        return $this->successResponse($user->fresh()->load('role'), 'User status updated successfully');
    }
}
