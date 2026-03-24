import { isValidIabSize } from "@/lib/iab-sizes";

export interface CreativeScanResult {
  passed: boolean;
  issues: string[];
  warnings: string[];
  imageWidth?: number;
  imageHeight?: number;
  fileSizeBytes?: number;
  mimeType?: string;
  iabSizeMatch: boolean;
}

const IAB_STANDARD_SIZES_SCANNER = new Set([
  "300x250",
  "728x90",
  "160x600",
  "320x50",
  "300x600",
  "970x250",
  "970x90",
  "320x100",
  "336x280",
  "250x250",
  "200x200",
  "468x60",
  "120x600",
  "300x1050",
  "320x480",
  "480x320",
  "1024x768",
  "768x1024"
]);

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

export async function scanCreativeUrl(imageUrl: string, declaredSize: string): Promise<CreativeScanResult> {
  const issues: string[] = [];
  const warnings: string[] = [];

  const normSize = String(declaredSize).trim().toLowerCase();
  const iabSizeMatch = IAB_STANDARD_SIZES_SCANNER.has(normSize) || isValidIabSize(normSize);
  if (!iabSizeMatch) {
    warnings.push(`Non-standard size: ${declaredSize}. May have lower fill rates.`);
  }

  if (!imageUrl.startsWith("https://")) {
    issues.push("Creative URL must use HTTPS for secure inventory.");
    return { passed: false, issues, warnings, iabSizeMatch: IAB_STANDARD_SIZES_SCANNER.has(normSize) };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    let response = await fetch(imageUrl, {
      signal: controller.signal,
      method: "HEAD",
      cache: "no-store"
    }).finally(() => clearTimeout(timeout));

    if (!response.ok || response.status === 405) {
      const ctrl2 = new AbortController();
      const t2 = setTimeout(() => ctrl2.abort(), 8000);
      response = await fetch(imageUrl, {
        signal: ctrl2.signal,
        method: "GET",
        cache: "no-store",
        headers: { Range: "bytes=0-0" }
      }).finally(() => clearTimeout(t2));
    }

    if (!response.ok) {
      issues.push(`Creative URL not accessible: ${response.status}`);
      return { passed: false, issues, warnings, iabSizeMatch };
    }

    const contentType = (response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    const lenHeader = response.headers.get("content-length");
    const contentLength = lenHeader ? parseInt(lenHeader, 10) : 0;

    if (!ALLOWED_MIME.has(contentType)) {
      issues.push(`Invalid content type: ${contentType || "unknown"}. Must be JPEG, PNG, GIF, or WebP.`);
    }

    if (contentLength > 2 * 1024 * 1024) {
      issues.push(`File too large: ${(contentLength / 1024 / 1024).toFixed(2)}MB. Max 2MB.`);
    } else if (contentLength > 150 * 1024) {
      warnings.push(`Large file size: ${(contentLength / 1024).toFixed(0)}KB. Recommend <150KB for fast loading.`);
    }

    return {
      passed: issues.length === 0,
      issues,
      warnings,
      fileSizeBytes: contentLength || undefined,
      mimeType: contentType,
      iabSizeMatch: IAB_STANDARD_SIZES_SCANNER.has(normSize) || isValidIabSize(normSize)
    };
  } catch (error) {
    issues.push(`Failed to fetch creative: ${error instanceof Error ? error.message : "unknown error"}`);
    return { passed: false, issues, warnings, iabSizeMatch };
  }
}
