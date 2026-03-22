<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Stripe\Checkout\Session;
use Stripe\Event;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Stripe;
use Stripe\Webhook;
use UnexpectedValueException;

class PaymentService
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Create a Stripe checkout session for an order
     */
    public function createStripeSession(Order $order): Session
    {
        $order->loadMissing('items.product');

        $lineItems = [];
        foreach ($order->items as $item) {
            $unitAmount = (int) round(((float) $item->price) * 100);

            $lineItems[] = [
                'price_data' => [
                    'currency' => 'mad',
                    'product_data' => [
                        'name' => $item->product->name,
                    ],
                    'unit_amount' => $unitAmount,
                ],
                'quantity' => $item->quantity,
            ];
        }

        return Session::create([
            'payment_method_types' => ['card'],
            'line_items' => $lineItems,
            'mode' => 'payment',
            'success_url' => $this->getSuccessUrl(),
            'cancel_url' => $this->getCancelUrl(),
            'metadata' => [
                'order_id' => (string) $order->id,
                'order_number' => (string) $order->order_number,
            ],
        ]);
    }

    public function retrieveStripeSession(string $sessionId): Session
    {
        return Session::retrieve($sessionId);
    }

    /**
     * Sync order/payment status from a Stripe Checkout session.
     */
    public function syncOrderFromCheckoutSession(Session $session): array
    {
        $metadata = $session->metadata?->toArray() ?? [];
        $orderId = $metadata['order_id'] ?? null;

        if (!$orderId) {
            throw new RuntimeException('Stripe session metadata is missing order_id');
        }

        return DB::transaction(function () use ($session, $orderId) {
            $order = Order::with('payment')->find($orderId);

            if (!$order) {
                throw new RuntimeException('Order not found for Stripe session metadata');
            }

            $paymentStatus = $this->mapStripePaymentStatus((string) ($session->payment_status ?? 'unpaid'));
            $amount = ((int) ($session->amount_total ?? 0)) / 100;
            $transactionId = (string) ($session->payment_intent ?: $session->id);

            if ($paymentStatus === 'paid' && $order->payment_status !== 'paid') {
                $order->update([
                    'payment_status' => 'paid',
                    'status' => $order->status === 'pending' ? 'processing' : $order->status,
                ]);
            }

            if ($paymentStatus !== 'paid' && $order->payment_status === 'pending') {
                $order->update([
                    'payment_status' => $paymentStatus,
                ]);
            }

            $payment = $order->payment;

            if ($payment) {
                $payment->update([
                    'payment_method' => 'stripe',
                    'status' => $paymentStatus,
                    'transaction_id' => $transactionId,
                    'amount' => $amount,
                ]);
            } else {
                $payment = Payment::create([
                    'order_id' => $order->id,
                    'payment_method' => 'stripe',
                    'status' => $paymentStatus,
                    'transaction_id' => $transactionId,
                    'amount' => $amount,
                ]);
            }

            return [
                'order' => $order->fresh(['items.product', 'payment']),
                'payment' => $payment->fresh(),
            ];
        });
    }

    /**
     * Build and verify Stripe webhook event.
     *
     * @throws RuntimeException
     */
    public function constructWebhookEvent(string $payload, ?string $signature): Event
    {
        $webhookSecret = config('services.stripe.webhook_secret');

        if (!$webhookSecret) {
            throw new RuntimeException('Stripe webhook secret is not configured');
        }

        if (!$signature) {
            throw new RuntimeException('Missing Stripe signature header');
        }

        try {
            return Webhook::constructEvent($payload, $signature, $webhookSecret);
        } catch (UnexpectedValueException) {
            throw new RuntimeException('Invalid Stripe payload');
        } catch (SignatureVerificationException) {
            throw new RuntimeException('Invalid Stripe signature');
        }
    }

    private function mapStripePaymentStatus(string $stripePaymentStatus): string
    {
        return match ($stripePaymentStatus) {
            'paid' => 'paid',
            'no_payment_required' => 'paid',
            'unpaid' => 'pending',
            default => 'failed',
        };
    }

    private function getSuccessUrl(): string
    {
        return rtrim($this->frontendUrl(), '/') . '/order-confirmation?session_id={CHECKOUT_SESSION_ID}';
    }

    private function getCancelUrl(): string
    {
        return rtrim($this->frontendUrl(), '/') . '/order-confirmation?canceled=1';
    }

    private function frontendUrl(): string
    {
        return config('services.stripe.frontend_url') ?: config('app.frontend_url') ?: config('app.url');
    }
}