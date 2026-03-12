/**
 * analyze-url — Node.js 版本（阿里云函数计算 FC 兼容）
 *
 * 原始版本: supabase/functions/analyze-url/index.ts (Deno)
 * 部署方式: 阿里云 FC HTTP 触发器
 *
 * 环境变量:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *   LOVABLE_API_KEY, FIRECRAWL_API_KEY (或由 ai_config 表中的 key name 决定)
 */

const { createClient } = require("@supabase/supabase-js");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── Scraper ────────────────────────────────────────────────────
async function scrapeUrl({ endpoint, apiKeyName, url }) {
  const apiKey = process.env[apiKeyName];
  if (!apiKey) {
    console.log(`${apiKeyName} not set, skipping scrape`);
    return "";
  }

  let formattedUrl = url.trim();
  if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
    formattedUrl = `https://${formattedUrl}`;
  }

  try {
    const resp = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: formattedUrl, formats: ["markdown"], onlyMainContent: true }),
    });

    if (resp.ok) {
      const data = await resp.json();
      return data?.data?.markdown || data?.markdown || "";
    }
    console.warn("Scraper failed:", resp.status);
    return "";
  } catch (e) {
    console.warn("Scraper error:", e);
    return "";
  }
}

// ─── AI ─────────────────────────────────────────────────────────
async function callAI({ endpoint, apiKeyName, model, systemPrompt, userMessage }) {
  const apiKey = process.env[apiKeyName];
  if (!apiKey) throw new Error(`${apiKeyName} is not configured`);

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
            tags: { type: "array", items: { type: "string" }, description: "Product tags" },
            founderName: { type: "string", description: "Founder/maker name" },
            founderTitle: { type: "string", description: "Founder title" },
            companyName: { type: "string", description: "Company name" },
            companyFounded: { type: "string", description: "Year founded" },
            companyLocation: { type: "string", description: "Company location" },
            companyFunding: { type: "string", description: "Funding stage" },
          },
          required: ["name", "slogan", "description", "category", "tags"],
        },
      },
    },
  ];

  const resp = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      tools,
      tool_choice: { type: "function", function: { name: "extract_product_info" } },
    }),
  });

  if (!resp.ok) {
    if (resp.status === 429) throw { status: 429, message: "AI 请求频率过高，请稍后再试" };
    if (resp.status === 402) throw { status: 402, message: "AI 额度不足，请充值后再试" };
    throw new Error("AI analysis failed");
  }

  const data = await resp.json();

  // Strategy 1: Standard OpenAI tool_calls
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (toolCall?.function?.arguments) {
    return JSON.parse(toolCall.function.arguments);
  }

  // Strategy 2: JSON in message content (some providers)
  const content = data.choices?.[0]?.message?.content;
  if (content) {
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || content.match(/(\{[\s\S]*\})/);
    if (jsonMatch?.[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1].trim());
        if (parsed.name && parsed.description) return parsed;
      } catch { /* fall through */ }
    }
  }

  // Strategy 3: DashScope native format
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

// ─── Handler ────────────────────────────────────────────────────
/**
 * 阿里云 FC HTTP 触发器入口
 * @param {object} req - { httpMethod, body, ... }
 * @param {object} res - FC response object
 */
module.exports.handler = async (req, res) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.setStatusCode(204);
    Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
    res.send("");
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { url } = body;
    if (!url) {
      res.setStatusCode(400);
      res.setHeader("Content-Type", "application/json");
      Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
      res.send(JSON.stringify({ error: "URL is required" }));
      return;
    }

    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: config } = await supabaseAdmin
      .from("ai_config")
      .select("*")
      .eq("config_key", "analyze_url")
      .single();

    const aiConfig = {
      enabled: config?.enabled ?? true,
      model: config?.model || "google/gemini-3-flash-preview",
      system_prompt: config?.system_prompt || "你是一个AI产品分析专家。",
      ai_endpoint: config?.ai_endpoint || "https://ai.gateway.lovable.dev/v1/chat/completions",
      scraper_endpoint: config?.scraper_endpoint || "https://api.firecrawl.dev/v1/scrape",
      ai_api_key_name: config?.ai_api_key_name || "LOVABLE_API_KEY",
      scraper_api_key_name: config?.scraper_api_key_name || "FIRECRAWL_API_KEY",
    };

    if (!aiConfig.enabled) {
      res.setStatusCode(503);
      res.setHeader("Content-Type", "application/json");
      Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
      res.send(JSON.stringify({ error: "AI analysis is currently disabled" }));
      return;
    }

    const pageContent = await scrapeUrl({
      endpoint: aiConfig.scraper_endpoint,
      apiKeyName: aiConfig.scraper_api_key_name,
      url,
    });

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

    res.setStatusCode(200);
    res.setHeader("Content-Type", "application/json");
    Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
    res.send(JSON.stringify({ success: true, data: productInfo }));
  } catch (e) {
    const status = e?.status || 500;
    const message = e?.message || "Unknown error";
    res.setStatusCode(status);
    res.setHeader("Content-Type", "application/json");
    Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
    res.send(JSON.stringify({ error: message }));
  }
};
