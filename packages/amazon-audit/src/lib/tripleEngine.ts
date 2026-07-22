/**
 * Triple engine — LLM orchestration for Copilot, PDF narrative, slides, insight cards.
 * Uses Gemini when GEMINI_API_KEY is set; otherwise deterministic SLM templates.
 */

import { GoogleGenAI } from '@google/genai';
import { assertNoFileReferences, sanitizeTextForGemini } from './geminiRequestGuard';
import { extractTextFromGenerateContentResponse } from './geminiResponse';

export const engineLogBuffer: Array<{ taskType: string; durationMs?: number }> = [];

export interface TripleEngineOptions {
  task: string;
  maxTokens: number;
  metrics?: object;
  system?: string;
  prompt?: string;
  slmTemplate?: string;
  jsonMode?: boolean;
}

export interface TripleEngineResult {
  text: string;
  modelUsed?: 'claude' | 'gemini' | 'slm';
  fallbackUsed?: boolean;
  confidence?: number;
  warnings?: string[];
}

function currencySymbolFromMetrics(m: Record<string, unknown>): string {
  const c = String(m.currency ?? '').trim();
  if (c === '€' || c === '£' || c === '$' || c === '₹') return c;
  const code = c.toUpperCase();
  if (code === 'EUR') return '€';
  if (code === 'GBP') return '£';
  if (code === 'INR') return '₹';
  if (code === 'USD') return '$';
  // Prefer EUR when store sales look European (legacy default was £)
  return '€';
}

function buildSlmFallback(options: TripleEngineOptions): string {
  const { task, slmTemplate, metrics } = options;
  const m = (metrics || {}) as Record<string, unknown>;
  const currency = currencySymbolFromMetrics(m);

  if (task === 'pdf_narrative' || task === 'pptx_narrative') {
    const totalStoreSales = Number(m.totalStoreSales ?? m.totalSales ?? 0);
    const adSpend = Number(m.adSpend ?? 0);
    const adSales = Number(m.adSales ?? 0);
    const acosValue = m.acos != null ? Number(m.acos) * (Number(m.acos) <= 1 ? 100 : 1) : 0;
    const tacosValue = m.tacos != null ? Number(m.tacos) * (Number(m.tacos) <= 1 ? 100 : 1) : 0;
    const adSalesPercent = totalStoreSales > 0 ? (adSales / totalStoreSales) * 100 : 0;
    const roasValue = m.roas != null ? Number(m.roas) : 0;
    const dependency = tacosValue > 35 ? 'heavy' : tacosValue > 20 ? 'moderate' : 'healthy';

    return `**Overview:** The account generated ${currency}${totalStoreSales.toFixed(2)} in total store sales with ${currency}${adSpend.toFixed(2)} in advertising spend, resulting in an ACOS of ${acosValue.toFixed(1)}%.

**Key Finding:** Ad sales contributed ${adSalesPercent.toFixed(1)}% of total revenue with a ROAS of ${roasValue.toFixed(2)}x.

**Impact:** Current TACoS of ${tacosValue.toFixed(1)}% indicates ${dependency} ad dependency.

**Recommendation:** Review campaign efficiency and optimize high-spend, low-conversion keywords to improve overall profitability.`;
  }

  if (slmTemplate && typeof slmTemplate === 'string') {
    return slmTemplate
      .replace(/\{\{acos\}\}/g, m.acos != null ? String(m.acos) : '—')
      .replace(/\{\{roas\}\}/g, m.roas != null ? String(m.roas) : '—')
      .replace(/\{\{tacos\}\}/g, m.tacos != null ? String(m.tacos) : '—')
      .replace(/\{\{currency\}\}/g, currency)
      .replace(/\{\{adSpend\}\}/g, (m.adSpend != null ? Number(m.adSpend) : 0).toFixed(2))
      .replace(/\{\{adSales\}\}/g, (m.adSales != null ? Number(m.adSales) : 0).toFixed(2));
  }

  return 'Analysis will appear here once the LLM engine is configured. Upload reports and run the audit for data-backed insights.';
}

async function callGemini(options: TripleEngineOptions): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const system = options.system || 'You are an Amazon advertising analyst. Be precise and numeric.';
  const prompt = options.prompt || '';
  if (!prompt.trim()) return null;

  const userText = sanitizeTextForGemini(prompt);
  assertNoFileReferences(userText);

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    config: {
      systemInstruction: sanitizeTextForGemini(system),
      maxOutputTokens: Math.min(options.maxTokens || 2048, 8192),
      temperature: 0.2,
      ...(options.jsonMode ? { responseMimeType: 'application/json' as const } : {}),
    },
    contents: [{ role: 'user' as const, parts: [{ text: userText }] }],
  });
  const text = extractTextFromGenerateContentResponse(response)?.trim();
  return text || null;
}

export async function tripleEngine(options: TripleEngineOptions): Promise<TripleEngineResult> {
  const start = Date.now();
  const warnings: string[] = [];

  try {
    const geminiText = await callGemini(options);
    if (geminiText) {
      engineLogBuffer.push({ taskType: options.task, durationMs: Date.now() - start });
      return {
        text: geminiText,
        modelUsed: 'gemini',
        fallbackUsed: false,
        confidence: 0.9,
        warnings,
      };
    }
  } catch (err) {
    warnings.push(err instanceof Error ? err.message : 'Gemini call failed');
  }

  const text = buildSlmFallback(options);
  warnings.push('Used deterministic SLM fallback (GEMINI_API_KEY missing or call failed)');
  engineLogBuffer.push({ taskType: options.task, durationMs: Date.now() - start });
  return {
    text,
    modelUsed: 'slm',
    fallbackUsed: true,
    confidence: 0.75,
    warnings,
  };
}
