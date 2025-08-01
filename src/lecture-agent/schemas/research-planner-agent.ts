export const responseSchema = {
  "name": "response_schema",
  "type": "json_schema",
  "strict": true,
  "schema": {
    "type": "object",
    "properties": {
      "topic": {
        "type": "string",
        "description": "The research topic input."
      },
      "research_items": {
        "type": "array",
        "description": "A list of research items covering various aspects of the topic.",
        "minItems": 1,
        "maxItems": 5,
        "items": {
          "type": "object",
          "properties": {
            "title": {
              "type": "string",
              "description": "Concise name of what to research."
            },
            "description": {
              "type": "string",
              "description": "Explanation of what should specifically be investigated for this item."
            },
            "category": {
              "type": "string",
              "description": "Category of research (e.g., background, trends, data, opinions, etc.)."
            }
          },
          "required": [
            "title",
            "description",
            "category"
          ],
          "additionalProperties": false
        }
      }
    },
    "required": [
      "topic",
      "research_items"
    ],
    "additionalProperties": false
  }
}