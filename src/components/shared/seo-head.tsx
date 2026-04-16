import React from "react";

interface SeoHeadProps {
  title?: string;
  description?: string;
  ogImage?: string;
  url?: string;
  structuredData?: any;
}

export function SeoHead({
  title = "JobExam - Platform for Youth",
  description = "Find the best jobs, exams, and placement drives.",
  ogImage = "/og-image.png",
  url = "https://jobexam.com",
  structuredData,
}: SeoHeadProps) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </>
  );
}
