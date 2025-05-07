export const responseSchema = {
  "type": "json_schema",
  "json_schema": {
    "name": "response_schema",
    "strict": true,
    "schema": {
      "type": "object",
      "required": [
        "emoji",
        "title",
        "topic"        
      ],
      "properties": {
        "emoji": {
          "type": "string",
          "description": "Only one emoji which will be used to represent the lecture"
        },
        "title": {
          "type": "string",
          "description": "Lecture short title (max 3 words)"
        },
        "topic": {
          "type": "string",
          "description": "Lecture expanded topic"
        }
      },
      "additionalProperties": false
    }
  }
}