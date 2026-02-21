<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Contact\StoreContactMessageRequest;
use App\Models\ContactMessage;
use App\Traits\ApiResponseTrait;

class ContactMessageController extends Controller
{
    use ApiResponseTrait;

    public function store(StoreContactMessageRequest $request)
    {
        $message = ContactMessage::create($request->validated());

        return $this->successResponse($message, 'Message envoyé avec succès', 201);
    }
}
