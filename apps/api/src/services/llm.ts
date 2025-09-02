import OpenAI from 'openai';

// Local type to avoid cross-workspace resolution during dev
export type CIPDesignResult = {
  summary: {
    F1: number;
    F2: number;
    Fmax: number;
    tankGal: number;
    heaterKW: number | null;
    pump: string;
  };
  bom: Array<{
    item: string;
    qty: number;
    specification: string;
    comments?: string;
    unitCost?: number | null;
    extendedCost?: number | null;
  }>;
};

// Lazy client creation to avoid requiring OPENAI_API_KEY in tests/dev without LLM
function createOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

interface LLMEnhancementRequest {
  input: any;
  result: CIPDesignResult;
}

export async function enhanceCIPDesign(request: LLMEnhancementRequest): Promise<CIPDesignResult> {
  const { input, result } = request;
  // Short-circuit in tests or when no API key is configured
  if (process.env.NODE_ENV === 'test') {
    return result;
  }
  const openai = createOpenAI();
  if (!openai) {
    return result;
  }

  const systemPrompt = `You are an expert water treatment system engineer specializing in CIP (Clean-in-Place) systems for reverse osmosis membranes.

Your task is to enhance the specifications and comments in a Bill of Materials (BOM) to make them more professional, detailed, and useful for procurement and installation.

Guidelines:
1. Keep all technical specifications accurate and precise
2. Add relevant industry standards and certifications (ASME, NSF, FDA, AWWA, etc.)
3. Include detailed installation and operational notes
4. Use professional engineering terminology
5. Add safety considerations and warnings where relevant
6. Include typical lead times, vendor alternatives, and availability notes
7. Add quality assurance and testing requirements
8. Include maintenance schedules and replacement intervals
9. Add compliance requirements for different applications (pharma, food, industrial)
10. Include energy efficiency and cost optimization notes
11. Add troubleshooting and commissioning guidance
12. Include dimensional and connection specifications

For each BOM item, enhance:
- Specification: Make it detailed with standards, materials, ratings, and performance criteria
- Comments: Add installation notes, maintenance requirements, alternatives, and best practices

Return the enhanced BOM with comprehensive specifications and practical comments.`;

  const userPrompt = `Please enhance the following CIP system BOM with comprehensive, professional specifications and comments.

System Context:
- System Type: Membrane Cleaning System (CIP for Reverse Osmosis)
- Design Flow: ${result.summary.Fmax} GPM maximum
- Tank Size: ${result.summary.tankGal} gallons
- Heater Power: ${result.summary.heaterKW || 'None'} kW
- Application: Industrial water treatment membrane cleaning

Input Parameters:
${JSON.stringify(input, null, 2)}

Current BOM (to be enhanced):
${JSON.stringify(result.bom, null, 2)}

Please return an enhanced BOM with detailed specifications and comprehensive comments. For each item, include:

Specifications should include:
- Detailed technical specs with materials, ratings, dimensions
- Industry standards (ASME, NSF, FDA, AWWA, API, etc.)
- Performance criteria and operating conditions
- Connection types and sizes
- Quality/grade requirements

Comments should include:
- Installation guidelines and best practices
- Maintenance schedules and procedures
- Safety considerations and warnings
- Vendor alternatives and sourcing notes
- Commissioning and testing requirements
- Typical lead times
- Application-specific compliance notes
- Energy efficiency considerations
- Troubleshooting tips

Return only the enhanced BOM array in valid JSON format. Ensure all JSON is properly escaped.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using GPT-4o-mini as GPT-5 is not yet available
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const enhancedBomText = completion.choices[0]?.message?.content;
    if (!enhancedBomText) {
      throw new Error('No response from OpenAI');
    }

    // Try to parse the enhanced BOM
    let enhancedBom;
    try {
      // Extract JSON from the response (in case it's wrapped in markdown)
      const jsonMatch = enhancedBomText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        enhancedBom = JSON.parse(jsonMatch[0]);
      } else {
        enhancedBom = JSON.parse(enhancedBomText);
      }
    } catch (parseError) {
      console.error('Failed to parse enhanced BOM:', parseError);
      // Fall back to original result if parsing fails
      return result;
    }

    // Validate that the enhanced BOM has the correct structure
    if (!Array.isArray(enhancedBom)) {
      console.error('Enhanced BOM is not an array');
      return result;
    }

    // Ensure all required fields are present
    const validatedBom = enhancedBom.map((item, index) => ({
      item: item.item || result.bom[index]?.item || 'Unknown Item',
      qty: item.qty || result.bom[index]?.qty || 1,
      unitCost: item.unitCost || result.bom[index]?.unitCost || null,
      extendedCost: item.extendedCost || result.bom[index]?.extendedCost || null,
      specification: item.specification || result.bom[index]?.specification || '',
      comments: item.comments || result.bom[index]?.comments || '',
    }));

    return {
      ...result,
      bom: validatedBom,
    };

  } catch (error) {
    console.error('OpenAI enhancement failed:', error);
    // Return original result if enhancement fails
    return result;
  }
}
