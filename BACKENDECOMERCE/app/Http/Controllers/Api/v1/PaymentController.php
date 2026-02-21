<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\PaymentService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    use ApiResponseTrait;

    protected $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Initiate payment for an order
     */
    public function initiatePayment(Request $request, $orderId)
    {
        $order = Order::with('items.product')->find($orderId);

        if (!$order) {
            return $this->errorResponse('Order not found', 404);
        }

        if ($order->user_id !== $request->user()->id) {
            return $this->errorResponse('Unauthorized', 403);
        }

        if ($order->payment_status === 'paid') {
            return $this->errorResponse('Order already paid', 400);
        }

        try {
            if ($order->payment_method === 'stripe') {
                $session = $this->paymentService->createStripeSession($order);
                return $this->successResponse([
                    'checkout_url' => $session->url,
                    'session_id' => $session->id
                ]);
            }

            // COD logic
            if ($order->payment_method === 'cod') {
                return $this->successResponse(null, 'Cash on Delivery selected. Order will be processed.');
            }

            return $this->errorResponse('Unsupported payment method', 400);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Stripe Webhook (Simplified)
     */
    public function handleWebhook(Request $request)
    {
        // In a real app, verify Stripe signature
        $payload = $request->all();
        $event = $payload['type'] ?? null;

       if ($event === 'checkout.session.completed') {
            $session = $payload['data']['object'];
            $orderId = $session['metadata']['order_id'] ?? null;

            if ($orderId) {
                $order = Order::find($orderId);
                
                // AJOUTE CETTE VÉRIFICATION :
                if ($order) {
                    $order->update(['payment_status' => 'paid', 'status' => 'processing']);
                    $order->payment()->create([
                        'payment_method' => 'stripe',
                        'status' => 'paid',
                        'transaction_id' => $session['id'],
                        'amount' => $session['amount_total'] / 100,
                    ]);
                }
            }
        }

        return response()->json(['status' => 'success']);
    }
}
