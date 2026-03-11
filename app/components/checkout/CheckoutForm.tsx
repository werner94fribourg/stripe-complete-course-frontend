"use client";

import { useState, SubmitEvent } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useCart } from "@/app/contexts/CartContext";
import { Button } from "@/app/components/ui/Button";
import { Alert } from "@/app/components/ui/Alert";

export function CheckoutForm() {
  // NOTE: stripe and elements hooks
  const stripe = useStripe();
  const elements = useElements();
  const { clearCart } = useCart();

  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError("");

    // NOTE: Submit the fields entered by the user to validate them and tokenizes the payment data if successful
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || "An error occurred");
      setIsProcessing(false);
      return;
    }

    /** NOTE: confirm payment completes the payment process and redirects on success to the return_url */
    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed");
      setIsProcessing(false);
    } else {
      // Payment succeeded - clear cart
      clearCart();
    }
  };

  return (
    <>
      {/** NOTE: We use native form submit to improve accessibility. on submit, the following steps need to be done:
       *    1. elements.submit() call validates the fields entered by the user and tokenizes the payment data
       *    2. stripe.confirmPayment() will complete the payment process
       *      2.1. collects tokenized payment data from the Elements context
       *      2.2. sends confirmation request to Stripe's servers
       *      2.3. handles 3D Secure if the bank requires additional authentication
       *      2.4. processes the payment
       *      2.5. redirects on success to the returned url defined
       */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <Alert variant="error">{error}</Alert>}
        {/** NOTE:  Use of the PaymentElement from stripe react library */}
        {/** NOTE: Component that renders a dynamic, pre-built payment form*/}
        {/** NOTE: Component that renders a dynamic, pre-built payment form that:
         *    1. Auto detects payment methods based on account setting, payment intent information at creation and customer's location (cards, Apple Pay, PayPal, ...)
         *    2. Renders secure iframes for card input fields (no Js interaction with it)
         *    3. Handles validation
         *    4. Adapts to the payment intent based on what was returned by the client secret (e.g. bill of 50$, products to pay, ...)
         */}
        <PaymentElement />

        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          isLoading={isProcessing}
          className="w-full"
        >
          {isProcessing ? "Processing..." : "Pay Now"}
        </Button>
      </form>
    </>
  );
}
