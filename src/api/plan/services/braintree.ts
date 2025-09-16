import braintree from 'braintree';

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox, // Switch to Production in live
  merchantId: process.env.BRAINTREE_MERCHANT_ID!,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY!,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY!,
});

// Generate client token for frontend
export const generateClientToken = async () => {
  const response = await gateway.clientToken.generate({});
  return response.clientToken;
};

// Create a transaction (payment)
export const createTransaction = async (nonce: string, amount: string) => {
  const result = await gateway.transaction.sale({
    amount,
    paymentMethodNonce: nonce,
    options: { submitForSettlement: true },
  });
  return result;
};

