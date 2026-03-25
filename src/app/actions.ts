'use server';

import { cookies } from 'next/headers';
import { encrypt, decrypt } from '@/utils/crypto';

const DEFAULT_GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const COOKIE_NAME = 'GEMINI_SESSION_KEY';

export interface BrandData {
  companyName: string;
  website: string;
  products: string;
  category: string;
  targetAudience: string;
  competitors: string;
  customGeminiKey?: string;
}

export interface OutreachResult {
  brandSummary: string;
  queries: string;
  rankingAudit: string;
  report: string;
  connectionMsg: string;
  followUpMsg: string;
  revenueImpact: string;
}

export interface ActionResponse {
  success: boolean;
  data?: OutreachResult;
  error?: string;
}

export async function generateOutreachAction(formData: BrandData): Promise<ActionResponse> {
  const prompt = `You are a senior AEO (AI Engine Optimization) strategist preparing a high-stakes sales intelligence report. This report will be shared directly with the brand's founder/CMO to convince them to invest in your AEO services TODAY.

CRITICAL: Use "Google Search" extensively to gather REAL data. Do NOT hallucinate any numbers.

RESEARCH STEPS (do all of these using Google Search):
1. Visit ${formData.website} — find their exact product range, price points, and unique selling propositions.
2. Search for "${formData.companyName}" on Google to see their current online presence, reviews, and press mentions.
3. Research competitors (${formData.competitors || 'top 3 brands in their category'}) to understand what they're doing differently for online visibility.
4. Find the brand's realistic AOV from their product pricing on their website. For small D2C brands, this is usually ₹300-₹1500, NOT enterprise-level numbers.

Company Details:
- Brand: ${formData.companyName}
- Website: ${formData.website}
- Products: ${formData.products}
- Category: ${formData.category}
- Target Audience: ${formData.targetAudience}
- Known Competitors: ${formData.competitors}

Now generate the following sections. Use EXACTLY these headers on their own lines:

### BRAND SUMMARY
Write a sharp, data-backed brand profile (150 words max). Include:
- What ${formData.companyName} actually sells and their price range (from real website data)
- Their unique value proposition — what makes them DIFFERENT (e.g., jaggery-based, organic, artisanal)
- Current market positioning vs. competitors
- Key strength that can be leveraged for AI visibility

### QUERIES
Generate exactly 5 hyper-specific search queries that a real customer would ask an AI assistant (ChatGPT, Gemini, Perplexity). These should be queries where ${formData.companyName} SHOULD show up but probably doesn't.
Format each as: "Query text"

### RANKING AUDIT
For EACH of the 5 queries above, use Google Search to actually check:
- Does ${formData.companyName} appear in the top results? Yes/No
- Which competitors DO appear instead?
- What's the gap — why are competitors ranking and ${formData.companyName} isn't?

Format as a table-like list:
**Query 1:** "[query]"
- ${formData.companyName} Found: ❌ Not found / ✅ Found (position)
- Instead found: [competitor names]
- Gap: [one-line reason]

(Repeat for all 5 queries)

### MINI REPORT
Write a compelling, punchy intelligence report (300 words max). Structure it with these sub-sections:

**🔍 The AI Visibility Problem**
Why is ${formData.companyName} invisible to AI agents right now? Be specific — mention content gaps, missing structured data, weak topical authority, etc.

**⚡ The UVP Advantage (Untapped)**
Here's the exciting part: explain how ${formData.companyName}'s unique value proposition (${formData.products}) gives them a NATURAL EDGE if properly optimized. For example, if they're in a niche like jaggery-based snacks, that specificity is actually an advantage for AI recommendations because AI loves recommending specific, differentiated products over generic ones.

**📊 Competitor Intelligence**
What are competitors (${formData.competitors}) doing that ${formData.companyName} isn't? Mention specific content strategies, structured data, review presence, etc.

**🚀 Quick Wins (Teaser)**
List 2-3 specific, actionable quick wins they could implement. But frame it as: "In our full audit, we identify 15-20 optimization opportunities. Here's a preview of what we'd cover..."

Make this section feel like: "holy shit, they really understand our brand and this is just the FREE version?"

### CONNECTION MESSAGE
LinkedIn connection request (max 250 chars). Must reference a SPECIFIC finding from your research — not generic. Make the founder think "how do they know this about my brand?"

### FOLLOW-UP MESSAGE
LinkedIn follow-up message (max 500 chars). Reference the ranking audit findings. Offer to share the "mini intelligence report" you've prepared. Create urgency by mentioning that competitors are already being recommended by AI agents while they're not. End with a soft CTA for a 15-min call.

### REVENUE IMPACT
One powerful line showing the realistic revenue at stake. Use REAL AOV from their website and estimate monthly lost AI-driven conversions. For smaller brands, be conservative but impactful.
Format: "Estimated monthly revenue gap: ₹X,XX,XXX — based on ~Y monthly AI-driven queries at Z% conversion rate and ₹W AOV."`;

  return generateWithGemini(prompt, formData.customGeminiKey);
}

export async function saveApiKeyAction(apiKey: string) {
  if (!apiKey) return;
  const encrypted = encrypt(apiKey);
  (await cookies()).set(COOKIE_NAME, encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
}

export async function clearApiKeyAction() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function hasSavedKeyAction(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.has(COOKIE_NAME);
}

async function generateWithGemini(prompt: string, customKey?: string): Promise<ActionResponse> {
  let apiKey = customKey;

  // If no ephemeral key provided, try to get from session cookie
  if (!apiKey) {
    const cookieStore = await cookies();
    const savedKey = cookieStore.get(COOKIE_NAME);
    if (savedKey?.value) {
      try {
        apiKey = decrypt(savedKey.value);
      } catch (e) {
        console.error('Failed to decrypt saved API key');
        // If decryption fails (e.g. secret changed), clear the cookie
        cookieStore.delete(COOKIE_NAME);
      }
    }
  }

  // Fallback to env default if still none
  apiKey = apiKey || DEFAULT_GEMINI_API_KEY;
  
  if (!apiKey) {
    return { success: false, error: 'Gemini API Key is missing. Please provide one in Settings.' };
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    tools: [
      {
        google_search: {}
      }
    ]
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        return { success: false, error: 'Gemini rate limit exceeded. Please try again later or provide your own API key in Settings.' };
      }
      if (response.status === 401 || response.status === 403) {
        return { success: false, error: 'Invalid Gemini API Key. Please verify your key in Settings.' };
      }
      return { success: false, error: `Gemini API error: ${errorData.error?.message || response.statusText}` };
    }

    const data = await response.json();
    
    // Gemini with grounding may return multiple parts — concatenate all text parts
    const parts = data.candidates?.[0]?.content?.parts;
    if (!parts || parts.length === 0) {
      return { success: false, error: 'Gemini returned an empty response. This might happen if grounding failed or the content was filtered.' };
    }
    
    const content = parts
      .filter((p: any) => p.text)
      .map((p: any) => p.text)
      .join('\n');
    
    if (!content) {
      return { success: false, error: 'Gemini returned an empty response. This might happen if grounding failed or the content was filtered.' };
    }

    return { success: true, data: parseAIResponse(content) };
  } catch (error: any) {
    return { success: false, error: error.message || 'An unexpected error occurred during generation.' };
  }
}

function parseAIResponse(content: string): OutreachResult {
  const headers = [
    'BRAND SUMMARY',
    'QUERIES',
    'RANKING AUDIT',
    'MINI REPORT',
    'CONNECTION MESSAGE',
    'FOLLOW-UP MESSAGE',
    'REVENUE IMPACT'
  ];

  const getSection = (header: string) => {
    // Build a pattern that matches the header with optional markdown formatting
    const escapedHeader = header.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
    const otherHeaders = headers
      .filter(h => h !== header)
      .map(h => h.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'));
    
    // Match: optional ### or ** before the header, then capture until the next header or end
    const pattern = new RegExp(
      `(?:^|\\n)\\s*(?:#{1,4}\\s*)?(?:\\*{1,2})?\\s*${escapedHeader}\\s*(?:\\*{1,2})?\\s*\\n([\\s\\S]*?)(?=\\n\\s*(?:#{1,4}\\s*)?(?:\\*{1,2})?\\s*(?:${otherHeaders.join('|')})\\s*(?:\\*{1,2})?\\s*\\n|$)`,
      'i'
    );
    
    const match = content.match(pattern);
    return match ? match[1].trim() : '';
  };

  return {
    brandSummary: getSection('BRAND SUMMARY'),
    queries: getSection('QUERIES'),
    rankingAudit: getSection('RANKING AUDIT'),
    report: getSection('MINI REPORT'),
    connectionMsg: getSection('CONNECTION MESSAGE'),
    followUpMsg: getSection('FOLLOW-UP MESSAGE'),
    revenueImpact: getSection('REVENUE IMPACT')
  };
}
