import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Types ───────────────────────────────────────────────────────────
interface AiConfig {
  enabled: boolean;
  model: string;
  system_prompt: string;
  ai_endpoint: string;
  scraper_endpoint: string;
  ai_api_key_name: string;
  scraper_api_key_name: string;
}

// ─── Modular Scraper Service ─────────────────────────────────────────
async function scrapeUrl(config: {
  endpoint: string;
  apiKeyName: string;
  url: string;
}): Promise<string> {
  const apiKey = Deno.env.get(config.apiKeyName);
  if (!apiKey) {
    console.log(`${config.apiKeyName} not set, skipping scrape`);
    return "";
  }

  let formattedUrl = config.url.trim();
  if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
    formattedUrl = `https://${formattedUrl}`;
  }

  console.log("Scraping URL:", formattedUrl, "via", config.endpoint);

  try {
    const resp = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
    });

    if (resp.ok) {
      const data = await resp.json();
      const content = data?.data?.markdown || data?.markdown || "";
      console.log("Scraped content length:", content.length);
      return content;
    } else {
      console.warn("Scraper failed:", resp.status);
      return "";
    }
  } catch (e) {
    console.warn("Scraper error:", e);
    return "";
  }
}

// ─── Modular AI Service ──────────────────────────────────────────────
async function callAI(config: {
  endpoint: string;
  apiKeyName: string;
  model: string;
  systemPrompt: string;
  userMessage: string;
}): Promise<Record<string, unknown>> {
  const apiKey = Deno.env.get(config.apiKeyName);
  if (!apiKey) {
    throw new Error(`${config.apiKeyName} is not configured`);
  }

  console.log("Calling AI model:", config.model, "via", config.endpoint);

  const tools = [
    {
      type: "function",
      function: {
        name: "extract_product_info",
        description: "Extract structured product information from web page content",
        parameters: {
          type: "object",
          properties: {
            name: { type: "string", description: "Product name" },
            slogan: { type: "string", description: "One-line product tagline/slogan" },
            description: { type: "string", description: "Detailed product description (2-4 sentences)" },
            category: {
              type: "string",
              description: "Product category ID. One of: devcode, visual, agents, efficiency, writing, data, education, business, life, hardware",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Product tags including platform (Web/Mobile App/Desktop/Browser Plugin) and pricing (Free/Paid/Freemium) and other relevant tags",
            },
            founderName: { type: "string", description: "Founder/maker name" },
            founderTitle: { type: "string", description: "Founder title (e.g. CEO)" },
            companyName: { type: "string", description: "Company name" },
            companyFounded: { type: "string", description: "Year founded" },
            companyLocation: { type: "string", description: "Company location" },
            companyFunding: { type: "string", description: "Funding stage (e.g. 种子轮, A轮, etc.)" },
          },
          required: ["name", "slogan", "description", "category", "tags"],
          additionalProperties: false,
        },
      },
    },
  ];

  const resp = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: config.systemPrompt },
        { role: "user", content: config.userMessage },
      ],
      tools,
      tool_choice: { type: "function", function: { name: "extract_product_info" } },
    }),
  });

  if (!resp.ok) {
    if (resp.status === 429) {
      throw { status: 429, message: "AI 请求频率过高，请稍后再试" };
    }
    if (resp.status === 402) {
      throw { status: 402, message: "AI 额度不足，请充值后再试" };
    }
    const errText = await resp.text();
    console.error("AI error:", resp.status, errText);
    throw new Error("AI analysis failed");
  }

  const data = await resp.json();

  // Strategy 1: Standard OpenAI tool_calls (Lovable AI, OpenAI, DeepSeek, DashScope compatible mode)
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (toolCall?.function?.arguments) {
    console.log("Parsed via tool_calls");
    return JSON.parse(toolCall.function.arguments);
  }

  // Strategy 2: Some providers (e.g. older DashScope, Qwen) return JSON in message content
  const content = data.choices?.[0]?.message?.content;
  if (content) {
    console.log("Attempting to parse from message content");
    // Try to extract JSON from content (may be wrapped in markdown code block)
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || content.match(/(\{[\s\S]*\})/);
    if (jsonMatch?.[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1].trim());
        // Validate required fields
        if (parsed.name && parsed.description) {
          return parsed;
        }
      } catch {
        // fall through
      }
    }
  }

  // Strategy 3: DashScope native format (output.text or output.choices)
  const dashOutput = data.output;
  if (dashOutput) {
    const text = dashOutput.text || dashOutput.choices?.[0]?.message?.content;
    if (text) {
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
      if (jsonMatch?.[1]) {
        try {
          const parsed = JSON.parse(jsonMatch[1].trim());
          if (parsed.name && parsed.description) return parsed;
        } catch { /* fall through */ }
      }
    }
  }

  throw new Error("AI did not return structured data");
}

// ─── Main Handler ────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Read config from database
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: config } = await supabaseAdmin
      .from("ai_config")
      .select("*")
      .eq("config_key", "analyze_url")
      .single();

    const aiConfig: AiConfig = {
      enabled: config?.enabled ?? true,
      model: config?.model || "google/gemini-3-flash-preview",
      system_prompt: config?.system_prompt || "你是一个AI产品分析专家。",
      ai_endpoint: config?.ai_endpoint || "https://ai.gateway.lovable.dev/v1/chat/completions",
      scraper_endpoint: config?.scraper_endpoint || "https://api.firecrawl.dev/v1/scrape",
      ai_api_key_name: config?.ai_api_key_name || "LOVABLE_API_KEY",
      scraper_api_key_name: config?.scraper_api_key_name || "FIRECRAWL_API_KEY",
    };

    if (!aiConfig.enabled) {
      return new Response(JSON.stringify({ error: "AI analysis is currently disabled" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 1: Scrape
    const pageContent = await scrapeUrl({
      endpoint: aiConfig.scraper_endpoint,
      apiKeyName: aiConfig.scraper_api_key_name,
      url,
    });

    // Step 2: AI Analysis
    const userMessage = pageContent
      ? `请分析以下网页内容，提取产品信息。\n\nURL: ${url}\n\n网页内容:\n${pageContent.slice(0, 15000)}`
      : `请根据这个URL推测并分析产品信息: ${url}`;

    const productInfo = await callAI({
      endpoint: aiConfig.ai_endpoint,
      apiKeyName: aiConfig.ai_api_key_name,
      model: aiConfig.model,
      systemPrompt: aiConfig.system_prompt,
      userMessage,
    });

    console.log("Extracted product info:", (productInfo as any).name);

    return new Response(JSON.stringify({ success: true, data: productInfo }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("analyze-url error:", e);
    const status = e?.status || 500;
    const message = e?.message || (e instanceof Error ? e.message : "Unknown error");
    return new Response(
      JSON.stringify({ error: message }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
