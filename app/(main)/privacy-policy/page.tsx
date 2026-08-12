import React from 'react';
import prisma from '@/lib/prisma';
import PolicyViewer from '@/components/storefront/PolicyViewer';

export default async function PrivacyPolicyPage() {
  const [pageEn, pageBn] = await Promise.all([
    prisma.page.findUnique({ where: { slug_language: { slug: 'privacy-policy', language: 'en' } } }),
    prisma.page.findUnique({ where: { slug_language: { slug: 'privacy-policy', language: 'bn' } } })
  ]);

  return (
    <PolicyViewer 
      title={{ en: "Privacy Policy", bn: "গোপনীয়তা নীতি" }}
      contentEn={pageEn?.content || ""}
      contentBn={pageBn?.content || ""}
    />
  );
}
