import { StructuredTool } from '@langchain/core/tools';
import axios from 'axios';
import { z } from 'zod';

const schema = z.object({
  skills: z.array(z.string()).optional(),
  category: z.string().optional(),
  experience: z.string().optional(),
});

export class GetMatchedGigsTool extends StructuredTool<typeof schema> {
  name = 'get_matched_gigs_tool';
  description = 'Finds gigs/jobs that match user profile and preferences';
  schema = schema;
  
  constructor(private apiBaseUrl: string, private authToken: string, private mockMode: boolean = false) {
    super();
  }

  protected async _call(params: z.infer<typeof schema>): Promise<string> {
    if (this.mockMode) {
      return JSON.stringify({
        success: true,
        message: 'Matched gigs retrieved successfully (mock)',
        data: {
          gigs: [
            { id: 1, title: 'Full Stack Developer', skills: params.skills || [] },
            { id: 2, title: 'Frontend Engineer', skills: params.skills || [] }
          ]
        }
      });
    }

    try {
      const response = await axios.get(
        `${this.apiBaseUrl}/api/gigs/matches`,
        {
          params,
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
        }
      );
      return JSON.stringify({
        success: true,
        message: 'Matched gigs retrieved successfully',
        data: response.data
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get matched gigs',
      });
    }
  }
}
