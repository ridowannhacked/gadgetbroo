import React from 'react';

export default function ReturnPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-slate-300">
      <h1 className="text-3xl font-bold text-white mb-8">Return Policy</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">1. Return Window</h2>
          <p>
            You have 7 calendar days to return an item from the date you received it. To be eligible for a return, your item must be unused and in the same condition that you received it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">2. Proof of Purchase</h2>
          <p>
            Your item must be in the original packaging. Your item needs to have the receipt or proof of purchase in order to be processed.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">3. Refunds</h2>
          <p>
            Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.
          </p>
          <p className="mt-2">
            If your return is approved, we will initiate a refund to your credit card (or original method of payment). You will receive the credit within a certain amount of days, depending on your card issuer's policies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">4. Shipping Costs</h2>
          <p>
            You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.
          </p>
        </section>

        <p className="pt-8 text-sm text-slate-500">
          Last updated: {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
