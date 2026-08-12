import React from 'react';
import prisma from '@/lib/prisma';
import PolicyViewer from '@/components/storefront/PolicyViewer';

export default async function ReturnPolicyPage() {
  const [pageEn, pageBn] = await Promise.all([
    prisma.page.findUnique({ where: { slug_language: { slug: 'return-policy', language: 'en' } } }),
    prisma.page.findUnique({ where: { slug_language: { slug: 'return-policy', language: 'bn' } } })
  ]);

  return (
    <PolicyViewer 
      title={{ en: "Return Policy", bn: "রিটার্ন পলিসি" }}
      contentEn={pageEn?.content || ""}
      contentBn={pageBn?.content || ""}
    />
  );
}
