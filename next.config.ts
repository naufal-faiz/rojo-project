/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextConfig } from "next";

// Ambil hostname Supabase dengan aman. Nilai env bisa kosong saat build
// (mis. environment Preview belum di-set), jadi jangan pakai `!` + split()
// yang akan crash "Cannot read properties of undefined (reading 'split')".
function getSupabaseHostname(): string | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return undefined;
  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

const supabaseHostname = getSupabaseHostname();

const nextConfig: NextConfig = {
  images: {
    // Hanya tambahkan remote pattern jika hostname berhasil di-resolve,
    // agar build tetap jalan walau env belum tersedia di environment tsb.
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  webpack(config: any) {
    // Find the default rule that handles SVG
    const fileLoaderRule = config.module.rules.find((rule: any) =>
      rule.test?.test?.(".svg")
    );
    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/;
    }

    config.module.rules.push({
      test: /\.svg$/i,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

export default nextConfig;
