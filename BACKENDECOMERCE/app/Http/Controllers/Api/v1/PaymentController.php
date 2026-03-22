<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\PaymentService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use RuntimeException;
use Stripe\Exception\ApiErrorException;

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
                    'session_id' => $session->id,
                ]);
            }

            if ($order->payment_method === 'cod') {
                return $this->successResponse([
                    'order_id' => $order->id,
                    'payment_method' => 'cod',
                ], 'Cash on Delivery selected. Order will be processed.');
            }

            return $this->errorResponse('Unsupported payment method', 400);
        } catch (ApiErrorException $e) {
            return $this->errorResponse('Stripe API error: ' . $e->getMessage(), 502);
        } catch (\Throwable $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Confirm a Stripe checkout session after frontend redirect.
     */
    public function processStripeSession(Request $request)
    {
        $validated = $request->validate([
            'session_id' => ['required', 'string'],
        ]);

        try {
            $session = $this->paymentService->retrieveStripeSession($validated['session_id']);

            $synced = $this->paymentService->syncOrderFromCheckoutSession($session);

            return $this->successResponse([
                'session_id' => $session->id,
                'stripe_payment_status' => $session->payment_status,
                'order' => $synced['order'],
                'payment' => $synced['payment'],
            ], 'Stripe session processed successfully');
        } catch (RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        } catch (ApiErrorException $e) {
            return $this->errorResponse('Stripe API error: ' . $e->getMessage(), 502);
        } catch (\Throwable $e) {
            return $this->errorResponse('Unable to process Stripe session', 500);
        }
    }

    /**
     * Stripe webhook endpoint.
     */
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');

        try {
            $event = $this->paymentService->constructWebhookEvent($payload, $signature);

            if ($event->type === 'checkout.session.completed') {
                $session = $event->data->object;
                $this->paymentService->syncOrderFromCheckoutSession($session);
            }

            return response()->json(['received' => true]);
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        } catch (\Throwable) {
            return response()->json([
                'message' => 'Webhook processing failed',
            ], 500);
        }
    }
}