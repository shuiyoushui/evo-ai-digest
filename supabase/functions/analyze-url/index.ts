import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Read AI config from database
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: config } = await supabaseAdmin
      .from("ai_config")
      .select("*")
      .eq("config_key", "analyze_url")
      .single();

    if (!config?.enabled) {
      return new Response(JSON.stringify({ error: "AI analysis is currently disabled" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const model = config?.model || "google/gemini-3-flash-preview";
    const systemPrompt = config?.system_prompt || "你是一个AI产品分析专家。";

    // Step 1: Try to scrape URL with Firecrawl
    let pageContent = "";
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");

    if (FIRECRAWL_API_KEY) {
      try {
        let formattedUrl = url.trim();
        if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
          formattedUrl = `https://${formattedUrl}`;
        }
        console.log("Scraping URL with Firecrawl:", formattedUrl);

        const scrapeResp = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: formattedUrl,
            formats: ["markdown"],
            onlyMainContent: true,
          }),
        });

        if (scrapeResp.ok) {
          const scrapeData = await scrapeResp.json();
          pageContent = scrapeData?.data?.markdown || scrapeData?.markdown || "";
          console.log("Scraped content length:", pageContent.length);
        } else {
          console.warn("Firecrawl scrape failed:", scrapeResp.status);
        }
      } catch (e) {
        console.warn("Firecrawl error:", e);
      }
    } else {
      console.log("FIRECRAWL_API_KEY not set, skipping scrape");
    }

    // Step 2: Call Lovable AI with tool calling for structured output
    const userMessage = pageContent
      ? `请分析以下网页内容，提取产品信息。\n\nURL: ${url}\n\n网页内容:\n${pageContent.slice(0, 15000)}`
      : `请根据这个URL推测并分析产品信息: ${url}`;

    console.log("Calling AI with model:", model);

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        tools: [
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
        ],
        tool_choice: { type: "function", function: { name: "extract_product_info" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "AI 请求频率过高，请稍后再试" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI 额度不足，请充值后再试" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, errText);
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResp.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("AI did not return structured data");
    }

    const productInfo = JSON.parse(toolCall.function.arguments);
    console.log("Extracted product info:", productInfo.name);

    return new Response(JSON.stringify({ success: true, data: productInfo }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-url error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
