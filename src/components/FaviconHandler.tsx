'use client';

import Head from 'next/head';

export default function FaviconHandler() {
  return (
    <Head>
      <link
        rel="icon"
        type="image/png"
        href={`/nepal-emblem.png?t=${Date.now()}`}
      />
    </Head>
  );
} 