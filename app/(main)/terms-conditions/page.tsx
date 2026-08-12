import React from 'react';

export default function TermsConditionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-slate-300">
      <h1 className="text-3xl font-bold text-white mb-8">Terms & Conditions</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
          <p>
            GadgetBroo provides users with access to a rich collection of resources, including various communications tools, forums, shopping services, and personalized content.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">3. User Conduct</h2>
          <p>
            You agree to not use the Service to: upload, post, email, transmit or otherwise make available any Content that is unlawful, harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically or otherwise objectionable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">4. Intellectual Property</h2>
          <p>
            All content included on this site, such as text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and software, is the property of GadgetBroo or its content suppliers and protected by international copyright laws.
          </p>
        </section>

        <p className="pt-8 text-sm text-slate-500">
          Last updated: {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
