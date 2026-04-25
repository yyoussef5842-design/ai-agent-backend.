import OpenAI from 'openai'
import { logger } from '../utils/logger.js'
import { searchService } from './search.js'

export class AIService {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }

  async generateResponse(params) {
    const { messages, model = 'gpt-4-turbo-preview', temperature = 0.7, maxTokens = 1000, systemPrompt } = params

    try {
      const tools = [
        {
          type: 'function',
          function: {
            name: 'search_online',
            description: 'البحث في جوجل للحصول على أحدث المعلومات والأسعار والتريندات',
            parameters: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'موضوع البحث باللغة العربية أو الإنجليزية' }
              },
              required: ['query']
            }
          }
        }
      ]

      const instructionHeader = `
### IMPORTANT RULES FOR YOUR IDENTITY AND BEHAVIOR:
1. STRICT ADHERENCE: You must follow the user's "Specific Instructions" below with 100% precision.
2. PERSONALITY: You must maintain the persona defined in the settings at all times.
3. LANGUAGE: Always reply in Egyptian Arabic unless asked otherwise.
4. KNOWLEDGE LIMITS: Use the provided knowledge base first. If not found and search is enabled, search online.
`
      const finalSystemPrompt = `${instructionHeader}\n\n### USER'S SPECIFIC INSTRUCTIONS:\n${systemPrompt || 'No specific instructions.'}\n\n### KNOWLEDGE CONTEXT:\n${params.context || ''}`

      const currentMessages = [{ role: 'system', content: finalSystemPrompt }, ...messages]

      const completion = await this.openai.chat.completions.create({
        model,
        messages: currentMessages,
        tools,
        tool_choice: 'auto',
        temperature,
        max_tokens: maxTokens
      })

      const responseMessage = completion.choices[0].message

      // التحقق إذا كان الذكاء الاصطناعي يريد استخدام أداة البحث
      if (responseMessage.tool_calls) {
        const toolCall = responseMessage.tool_calls[0]
        const functionArgs = JSON.parse(toolCall.function.arguments)

        logger.info(`AI decided to search online for: ${functionArgs.query}`)
        const searchResult = await searchService.search(functionArgs.query)

        // إرسال نتائج البحث مرة أخرى للذكاء الاصطناعي ليقوم بصياغة الرد النهائي
        const secondCompletion = await this.openai.chat.completions.create({
          model,
          messages: [
            ...currentMessages,
            responseMessage,
            {
              tool_call_id: toolCall.id,
              role: 'tool',
              name: 'search_online',
              content: searchResult
            }
          ]
        })

        return {
          text: secondCompletion.choices[0].message.content,
          usage: secondCompletion.usage,
          model: secondCompletion.model,
          searched: true
        }
      }

      return {
        text: responseMessage.content,
        usage: completion.usage,
        model: completion.model
      }
    } catch (error) {
      logger.error('OpenAI error:', error.message)
      throw new Error('AI service unavailable')
    }
  }

  async analyzeSentiment(text) {
    const prompt = `Analyze sentiment of this Arabic text. Return JSON: {score: -1 to 1, label: "positive"|"negative"|"neutral", emotions: [], urgency: "low"|"medium"|"high"}\n\nText: "${text}"`

    try {
      const result = await this.generateResponse({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        maxTokens: 200
      })
      return JSON.parse(result.text)
    } catch (error) {
      return { score: 0, label: 'neutral', emotions: [], urgency: 'low' }
    }
  }

  async extractEntities(text) {
    const prompt = `Extract from text. Return JSON: {products: [], intents: [], quantities: [], dates: []}\n\nText: "${text}"`

    try {
      const result = await this.generateResponse({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        maxTokens: 300
      })
      return JSON.parse(result.text)
    } catch (error) {
      return { products: [], intents: [], quantities: [], dates: [] }
    }
  }
}