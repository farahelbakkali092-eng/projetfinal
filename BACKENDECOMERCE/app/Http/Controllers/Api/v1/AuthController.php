<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\UpdatePasswordRequest;
use App\Traits\ApiResponseTrait;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    use ApiResponseTrait;

    /**
     * Register a new user
     */
    public function register(RegisterRequest $request)
    {
        $role = Role::where('name', 'client')->first();
        
        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => $request->password,
            'role_id' => $request->role_id ?? $role->id,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->successResponse([
            'user' => $user->load('role'),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 'User registered successfully', 201);
    }

    /**
     * Login user and create token
     */
    public function login(LoginRequest $request)
    {
        $user = User::where('email', strtolower($request->email))->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return $this->errorResponse('Invalid credentials', 401);
        }

       if (!$user->is_active) { 
            return $this->errorResponse('Account disabled', 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->successResponse([
            'user' => $user->load('role'),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 'Login successful');
    }

    /**
     * Gère la demande de lien de réinitialisation de mot de passe.
     */
    public function forgotPassword(Request $request)
    {
        // 1. On valide que l'email est bien fourni et valide
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ], [
            'email.exists' => 'Aucun compte ne correspond à cette adresse email.'
        ]);

        // 2. On demande à Laravel de générer et d'envoyer le lien de réinitialisation
        $status = Password::sendResetLink(
            $request->only('email')
        );

        // 3. On retourne la réponse au frontend React
        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'status' => 'success',
                'message' => 'Un lien de réinitialisation vous a été envoyé par email.'
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Impossible d\'envoyer le lien. Veuillez réessayer.'
        ], 400);
    }

    /**
     * Logout user (Revoke token)
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return $this->successResponse(null, 'Successfully logged out');
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request)
    {
        return $this->successResponse($request->user()->load('role'));
    }

    /**
     * Update authenticated user's password
     */
    public function updatePassword(UpdatePasswordRequest $request)
    {
        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return $this->errorResponse('Mot de passe actuel incorrect', 422);
        }

       $user->password = Hash::make($request->password);
        $user->save();

        return $this->successResponse(null, 'Mot de passe mis à jour');
    }
}
