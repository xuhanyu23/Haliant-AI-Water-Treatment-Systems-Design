import OpenAI from 'openai';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface SystemContext {
  systemType: string;
  currentParameters?: any;
  designResults?: any;
}

// Lazy client creation to avoid requiring OPENAI_API_KEY in tests/dev without AI
function createOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

export class AIChatService {
  private openai: OpenAI | null;

  constructor() {
    this.openai = createOpenAI();
  }

  private getSystemPrompt(systemContext: SystemContext): string {
    const { systemType, currentParameters, designResults } = systemContext;
    
    let systemPrompt = `You are an expert water treatment system engineer specializing in ${systemType.toUpperCase()} systems. 

Core Expertise:
- Membrane cleaning (CIP) systems for reverse osmosis
- Ion exchange systems for softening and demineralization  
- Media filtration systems (multimedia, activated carbon)
- Ultrafiltration membrane systems

Your role is to provide helpful, accurate, and practical guidance to engineers designing water treatment systems.

Guidelines:
1. Give specific, actionable advice with concrete values when possible
2. Explain the "why" behind recommendations with engineering principles
3. Reference industry standards (AWWA, NSF, FDA) when relevant
4. Consider safety, efficiency, and cost optimization
5. Use professional terminology but explain complex concepts clearly
6. Provide troubleshooting help for common issues

Current Context:
- System Type: ${this.getSystemDisplayName(systemType)}
- User is working on system design and may need guidance on parameters, specifications, or optimization`;

    if (currentParameters) {
      systemPrompt += `\n- Current Parameters: ${JSON.stringify(currentParameters, null, 2)}`;
    }

    if (designResults) {
      systemPrompt += `\n- Design Results: ${JSON.stringify(designResults, null, 2)}`;
    }

    systemPrompt += `\n\nAlways be helpful and provide specific guidance. Use emojis sparingly and professionally. Focus on engineering value.`;

    return systemPrompt;
  }

  private getSystemDisplayName(systemType: string): string {
    switch (systemType) {
      case 'cip-ro':
        return 'Membrane Cleaning System (CIP for Reverse Osmosis)';
      case 'ion-exchange':
        return 'Ion Exchange System';
      case 'media-filtration':
        return 'Media Filtration System';
      case 'ultrafiltration':
        return 'Ultrafiltration System';
      default:
        return 'Water Treatment System';
    }
  }

  async generateResponse(
    messages: ChatMessage[],
    systemContext: SystemContext
  ): Promise<string> {
    if (!this.openai) {
      return "❌ AI service is not available. Please check your OpenAI API configuration.";
    }

    try {
      const systemPrompt = this.getSystemPrompt(systemContext);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-10) // Keep last 10 messages for context
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      return completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error('OpenAI chat error:', error);
      return "❌ I encountered an error while processing your request. Please try again in a moment.";
    }
  }

  async *generateStreamingResponse(
    messages: ChatMessage[],
    systemContext: SystemContext
  ): AsyncGenerator<string> {
    if (!this.openai) {
      yield "❌ AI service is not available. Please check your OpenAI API configuration.";
      return;
    }

    try {
      const systemPrompt = this.getSystemPrompt(systemContext);
      
      const stream = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-10)
        ],
        temperature: 0.7,
        max_tokens: 800,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      console.error('OpenAI streaming error:', error);
      yield "❌ I encountered an error while processing your request. Please try again in a moment.";
    }
  }

  validateParameters(parameters: any, systemType: string): string[] {
    const warnings: string[] = [];
    
    if (systemType === 'cip-ro') {
      // Flow rate validation
      if (parameters.perVesselFlowGPM) {
        if (parameters.perVesselFlowGPM < 30) {
          warnings.push("⚠️ Flow rate below 30 GPM may result in poor cleaning efficiency");
        }
        if (parameters.perVesselFlowGPM > 60) {
          warnings.push("⚠️ Flow rate above 60 GPM may cause membrane damage");
        }
      }

      // Temperature validation
      if (parameters.targetTempC && parameters.targetTempC > 45) {
        warnings.push("🌡️ Target temperature above 45°C may damage RO membranes");
      }

      // Vessel count optimization
      if (parameters.vesselsStage1 && parameters.vesselsStage2) {
        const ratio = parameters.vesselsStage1 / parameters.vesselsStage2;
        if (ratio < 1.2 || ratio > 2.0) {
          warnings.push("📊 Consider optimizing stage 1:stage 2 vessel ratio (typically 1.2-2.0:1)");
        }
      }
    }

    return warnings;
  }
}