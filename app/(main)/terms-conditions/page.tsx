import React from 'react';
import prisma from '@/lib/prisma';
import PolicyViewer from '@/components/storefront/PolicyViewer';

export default async function TermsConditionsPage() {
  const [pageEn, pageBn] = await Promise.all([
    prisma.page.findUnique({ where: { slug_language: { slug: 'terms-conditions', language: 'en' } } }),
    prisma.page.findUnique({ where: { slug_language: { slug: 'terms-conditions', language: 'bn' } } })
  ]);

  return (
    <PolicyViewer 
      title={{ en: "Terms & Conditions", bn: "শর্তাবলী" }}
      contentEn={pageEn?.content || ""}
      contentBn={pageBn?.content || ""}
    />
  );
}
