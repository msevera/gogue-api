export const responseSchema = {
  "type": "json_schema",
  "json_schema": {
    "name": "response_schema",
    "strict": true,
    "schema": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string",
          "description": "The title of the lecture."
        },
        "topic": {
          "type": "string",
          "description": "The overall topic of the lecture."
        },
        "overview": {
          "type": "string",
          "description": "Brief overview of the entire lecture. Must contain at least 2 sentences."
        },
        "total_word_count": {
          "type": "integer",
          "description": "Total word count of the lecture plan, calculated from all section content fields.",
          "minimum": 0
        },
        "voice_instructions": {
          "type": "string",
          "description": "Instructions for voice delivery for the entire lecture (e.g., tone, emphasis)."
        },
        "key_insights": {
          "type": "array",
          "description": "List of core insights, succinctly summarizing the most important ideas from the lecture.",
          "items": {
            "type": "string",
            "description": "A core insight or take-away from the lecture."
          }
        },
        "sections": {
          "type": "array",
          "description": "Ordered list of sections in the lecture.",
          "items": {
            "$ref": "#/$defs/section"
          }
        },
        "workbook": {
          "type": "array",
          "description": "Array of workbook tasks based on user data and book content that the user can complete in order to get the most out of the book. Answers will be analyzed by AI later.",
          "items": {
            "$ref": "#/$defs/workbook_task"
          }
        }
      },
      "required": [
        "title",
        "topic",
        "overview",
        "total_word_count",
        "voice_instructions",
        "key_insights",
        "sections",
        "workbook"
      ],
      "additionalProperties": false,
      "$defs": {
        "section": {
          "type": "object",
          "properties": {
            "title": {
              "type": "string",
              "description": "The section title (e.g. Introduction, Conclusion, or a main section title)."
            },
            "word_count": {
              "type": "integer",
              "description": "Word count for this section, calculated from the content field.",
              "minimum": 0
            },
            "overview": {
              "type": "string",
              "description": "Brief overview of what this section covers."
            },
            "objective": {
              "type": "string",
              "description": "Learning objective for this section."
            },
            "takeaway": {
              "type": "string",
              "description": "Core lesson or insight students should retain from this section."
            },
            "activity_prompt": {
              "anyOf": [
                {
                  "type": "string",
                  "description": "Optional prompt for activity related to the section."
                },
                {
                  "type": "null",
                  "description": "If no activity prompt is provided."
                }
              ]
            },
            "content": {
              "type": "string",
              "description": "Main written content for the section."
            }
          },
          "required": [
            "title",
            "word_count",
            "overview",
            "objective",
            "takeaway",
            "activity_prompt",
            "content"
          ],
          "additionalProperties": false
        },
        "workbook_task": {
          "type": "object",
          "properties": {
            "task_id": {
              "type": "string",
              "description": "Unique identifier for the task."
            },
            "prompt": {
              "type": "string",
              "description": "The workbook task or question, tailored to the user and the book content."
            },
            "instructions": {
              "type": "string",
              "description": "Instructions for how to complete the task."
            },
            "expected_format": {
              "type": "string",
              "description": "Description of the expected answer format (e.g., short answer, essay, bullet points)."
            }
          },
          "required": [
            "task_id",
            "prompt",
            "instructions",
            "expected_format"
          ],
          "additionalProperties": false
        }
      }
    }
  }
}