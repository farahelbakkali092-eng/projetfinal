<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Contact\StoreContactMessageRequest;
use App\Traits\ApiResponseTrait;
use Illuminate\Support\Facades\Mail;

class ContactMessageController extends Controller
{
    use ApiResponseTrait;

    public function store(StoreContactMessageRequest $request)
    {
        $data = $request->validated();

        // Send email directly to admin
        $adminEmail = config('mail.admin_email', env('MAIL_ADMIN_EMAIL', 'admin@example.com'));

        Mail::raw(
            "Nouveau message de contact:\n\nNom: {$data['name']}\nEmail: {$data['email']}\nSujet: {$data['subject']}\n\nMessage:\n{$data['message']}",
            function ($message) use ($data, $adminEmail) {
                $message->to($adminEmail)
                        ->subject("Contact: {$data['subject']}")
                        ->replyTo($data['email'], $data['name']);
            }
        );

        return $this->successResponse(null, 'Message envoyé avec succès', 201);
    }
}
