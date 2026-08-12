import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-slate-300">
      <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">2. Use of Information</h2>
          <p>
            We may use the information we collect about you to provide, maintain, and improve our services, including, for example, to facilitate payments, send receipts, provide products and services you request, and send related information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">3. Sharing of Information</h2>
          <p>
            We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including as follows: with third parties to provide you a service you requested through a partnership or promotional offering made by a third party or us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">4. Security</h2>
          <p>
            We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
          </p>
        </section>

        <p className="pt-8 text-sm text-slate-500">
          Last updated: {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
