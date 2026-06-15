import { useRazorpay, type RazorpaySuccessResponse } from '@codearcade/expo-razorpay';
import client from '../api/client';

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  key: string;
  offerTitle: string;
  sellerName: string;
}

export function usePayment() {
  const { openCheckout, RazorpayUI, isVisible } = useRazorpay();

  const initiatePayment = (
    offerId: string,
    callbacks: {
      onSuccess: (data: RazorpaySuccessResponse) => void;
      onFailure: (error: string) => void;
    }
  ) => {
    client.post<RazorpayOrder>('/payments/create-order', { offerId })
      .then(({ data: order }) => {
        console.log('Razorpay checkout opening', { orderId: order.id, amount: order.amount });
        openCheckout(
          {
            key: order.key,
            amount: order.amount,
            currency: order.currency,
            name: 'CouponX',
            description: order.offerTitle,
            order_id: order.id,
            theme: { color: '#6C63FF' },
          },
          {
            onSuccess: callbacks.onSuccess,
            onFailure: (error) => {
              try {
                console.log('Razorpay checkout onFailure', JSON.stringify({ code: error.code, description: error.description, source: error.source, step: error.step, reason: error.reason }));
              } catch {}
              callbacks.onFailure(error.description || 'Payment failed');
            },
            onClose: () => {
              console.log('Razorpay checkout closed');
            },
          }
        );
      })
      .catch((err: any) => {
        console.log('Create order API failed', JSON.stringify({ message: err?.response?.data?.message, status: err?.response?.status, url: err?.config?.url }));
        callbacks.onFailure(err?.response?.data?.message || 'Failed to initiate payment');
      });
  };

  return { initiatePayment, RazorpayUI, isVisible };
}
