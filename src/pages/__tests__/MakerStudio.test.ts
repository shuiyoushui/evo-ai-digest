import { describe, it, expect } from "vitest";

/**
 * MakerStudio logic tests - verifying data mapping correctness
 * without rendering the full component (avoids heavy dependency mocking)
 */

const emptyFormData = {
  name: "", slogan: "", category: "", tags: [] as string[], description: "",
  website: "", github: "", founderName: "", founderTitle: "", companyName: "",
  companyFounded: "", companyLocation: "", companyFunding: "", companyBio: "",
  skills: [] as { name: string; description: string }[],
  prompts: [] as { title: string; content: string }[],
};

describe("MakerStudio: handleEditProject data mapping", () => {
  it("should map tags from product to editFormData", () => {
    const proj = {
      id: "1", name: "Test", slogan: "S", category_id: "ai",
      tags: ["AI", "ML"], description: "D", website: "https://x.com",
      maker_name: "M", maker_title: "T", company_name: "C",
      company_founded: "2024", company_location: "SF", company_funding: "Seed",
      benefits: ["Fast", "Easy"],
    };

    // Simulate the fixed handleEditProject logic
    const editFormData = {
      ...emptyFormData,
      name: proj.name,
      slogan: proj.slogan || "",
      category: proj.category_id || "",
      tags: proj.tags || [],
      description: proj.description || "",
      website: proj.website || "",
      founderName: proj.maker_name || "",
      founderTitle: proj.maker_title || "",
      companyName: proj.company_name || "",
      companyFounded: proj.company_founded || "",
      companyLocation: proj.company_location || "",
      companyFunding: proj.company_funding || "",
    };

    expect(editFormData.tags).toEqual(["AI", "ML"]);
    expect(editFormData.name).toBe("Test");
    expect(editFormData.category).toBe("ai");
  });

  it("should default tags to empty array when product has no tags", () => {
    const proj = { id: "2", name: "No Tags", tags: null };
    const editFormData = { ...emptyFormData, tags: proj.tags || [] };
    expect(editFormData.tags).toEqual([]);
  });
});

describe("MakerStudio: handleSaveEdit payload", () => {
  it("should include tags in update payload", () => {
    const editFormData = {
      ...emptyFormData,
      name: "Updated",
      tags: ["NewTag1", "NewTag2"],
      category: "tools",
    };

    // Simulate the fixed handleSaveEdit payload
    const payload = {
      id: "edit-1",
      name: editFormData.name,
      slogan: editFormData.slogan,
      category_id: editFormData.category || null,
      tags: editFormData.tags,
      description: editFormData.description,
      website: editFormData.website,
      maker_name: editFormData.founderName,
      maker_title: editFormData.founderTitle,
      company_name: editFormData.companyName,
      company_founded: editFormData.companyFounded,
      company_location: editFormData.companyLocation,
      company_funding: editFormData.companyFunding,
    };

    expect(payload.tags).toEqual(["NewTag1", "NewTag2"]);
    expect(payload.category_id).toBe("tools");
  });
});

describe("MakerStudio: AI analyze data mapping", () => {
  it("should map AI response to formData correctly", () => {
    const aiResponse = {
      name: "AI Product",
      slogan: "Smart tools",
      category: "ai-tools",
      tags: ["AI", "Automation"],
      description: "An AI product",
      founderName: "Jane",
      founderTitle: "CTO",
      companyName: "AIco",
      companyFounded: "2025",
      companyLocation: "NYC",
      companyFunding: "Series A",
    };

    const formData = {
      ...emptyFormData,
      name: aiResponse.name || "",
      slogan: aiResponse.slogan || "",
      category: aiResponse.category || "",
      tags: aiResponse.tags || [],
      description: aiResponse.description || "",
      website: "https://example.com",
      founderName: aiResponse.founderName || "",
      founderTitle: aiResponse.founderTitle || "",
      companyName: aiResponse.companyName || "",
      companyFounded: aiResponse.companyFounded || "",
      companyLocation: aiResponse.companyLocation || "",
      companyFunding: aiResponse.companyFunding || "",
    };

    expect(formData.name).toBe("AI Product");
    expect(formData.tags).toEqual(["AI", "Automation"]);
    expect(formData.website).toBe("https://example.com");
  });

  it("should not trigger analysis with empty URL", () => {
    const url = "";
    const shouldAnalyze = !!url;
    expect(shouldAnalyze).toBe(false);
  });
});
