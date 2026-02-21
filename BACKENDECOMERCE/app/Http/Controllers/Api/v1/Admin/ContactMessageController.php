<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 15);

        $query = ContactMessage::query()->orderByDesc('created_at');

        if ($request->filled('is_read')) {
            $query->where('is_read', filter_var($request->input('is_read'), FILTER_VALIDATE_BOOLEAN));
        }

        $messages = $query->paginate($perPage);

        return $this->successResponse($messages, 'Messages récupérés');
    }

    public function show(int $id)
    {
        $message = ContactMessage::findOrFail($id);

        return $this->successResponse($message, 'Message récupéré');
    }

    public function markRead(int $id)
    {
        $message = ContactMessage::findOrFail($id);

        if (!$message->is_read) {
            $message->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }

        return $this->successResponse($message, 'Message marqué comme lu');
    }
}
