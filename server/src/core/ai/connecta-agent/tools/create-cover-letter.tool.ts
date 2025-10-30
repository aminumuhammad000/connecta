import { StructuredTool } from '@langchain/core/tools';
import axios from 'axios';
import { z } from 'zod';

// Schema for cover letter parameters
const schema = z.object({
  position: z.string(),
  company: z.string().optional(),
  highlights: z.array(z.string()).optional(),
});

export class CreateCoverLetterTool extends StructuredTool<typeof schema> {
  name = 'create_cover_letter_tool';
  description = 'Creates a cover letter based on user profile and job requirements';
  schema = schema;
  
  constructor(private apiBaseUrl: string, private authToken: string) {
    super();
  }

  protected async _call(params: z.infer<typeof schema>): Promise<string> {
    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/api/cover-letter/generate`,
        params,
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
        }
      );

      return JSON.stringify({
        success: true,
        message: 'Cover letter generated successfully',
        data: response.data
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate cover letter',
      });
    }
  }
}
