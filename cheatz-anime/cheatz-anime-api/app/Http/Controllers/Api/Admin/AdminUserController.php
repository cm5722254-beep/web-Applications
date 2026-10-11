<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class AdminUserController extends Controller
{
    public function __construct(private AuditService $audit) {}

    public function index(Request $request): JsonResponse
    {
        $query = User::with('roles')->latest();

        if ($request->search) {
            $like = '%' . $request->search . '%';
            $query->where(fn ($q) => $q->where('name', 'ilike', $like)->orWhere('email', 'ilike', $like));
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }

        $users = $query->paginate(20);

        return response()->json([
            'data' => UserResource::collection($users),
            'meta' => ['current_page' => $users->currentPage(), 'total' => $users->total()],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $user = User::with(['roles', 'subscriptions.plan', 'paymentTransactions'])->findOrFail($id);

        return response()->json(['data' => new UserResource($user)]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name'   => ['sometimes', 'string', 'min:2', 'max:100'],
            'status' => ['sometimes', 'in:active,suspended,banned'],
        ]);

        $old = $user->toArray();
        $user->update($validated);

        $this->audit->log('user.updated', $request->user(), $user, $old, $request, $validated);

        return response()->json(['data' => new UserResource($user->fresh()->load('roles'))]);
    }

    public function suspend(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->isSuperAdmin() && ! $request->user()->isSuperAdmin()) {
            return response()->json(['message' => 'Cannot suspend a super admin.'], 403);
        }

        $user->update(['status' => 'suspended']);
        $user->tokens()->delete(); // Revoke all sessions

        $this->audit->log('user.suspended', $request->user(), $user, null, $request);

        return response()->json(['message' => 'User suspended and all sessions revoked.']);
    }

    public function activate(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->update(['status' => 'active']);

        $this->audit->log('user.activated', $request->user(), $user, null, $request);

        return response()->json(['message' => 'User activated.']);
    }

    public function syncRoles(Request $request, int $id): JsonResponse
    {
        // Only super_admin can assign roles
        if (! $request->user()->isSuperAdmin()) {
            return response()->json(['message' => 'Only super admins can manage roles.'], 403);
        }

        $request->validate([
            'roles'   => ['required', 'array'],
            'roles.*' => ['string', 'exists:roles,name'],
        ]);

        $user = User::findOrFail($id);

        // Prevent removing own super_admin role
        if ($user->id === $request->user()->id && ! in_array('super_admin', $request->roles)) {
            return response()->json(['message' => 'You cannot remove your own super_admin role.'], 422);
        }

        $user->syncRoles($request->roles);

        $this->audit->log('user.roles_synced', $request->user(), $user, null, $request, ['roles' => $request->roles]);

        return response()->json(['message' => 'Roles updated.', 'data' => new UserResource($user->fresh()->load('roles'))]);
    }
}
