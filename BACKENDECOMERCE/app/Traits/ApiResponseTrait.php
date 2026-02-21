<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponseTrait
{
    /**
     * Standard JSON response
     */
    protected function apiResponse($data = null, string $message = '', int $status = 200, $errors = null): JsonResponse
    {
        return response()->json([
            'status' => $status < 400 ? 'success' : 'error',
            'message' => $message,
            'data' => $data,
            'errors' => $errors,
        ], $status);
    }

    /**
     * Success JSON response
     */
    protected function successResponse($data = null, string $message = 'Operation successful', int $status = 200): JsonResponse
    {
        return $this->apiResponse($data, $message, $status);
    }

    /**
     * Error JSON response
     */
    protected function errorResponse(string $message = 'An error occurred', int $status = 400, $errors = null): JsonResponse
    {
        return $this->apiResponse(null, $message, $status, $errors);
    }
}
