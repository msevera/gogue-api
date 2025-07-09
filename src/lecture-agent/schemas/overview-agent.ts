export const responseSchema = {
  "type": "json_schema",
  "json_schema": {
    "name": "response_schema",
    "strict": true,
    "schema": {
      "type": "object",
      "required": [
        "lecture_title",
        "lecture_overview"
      ],
      "properties": {
        "lecture_title": {
          "type": "string",
          "description": "Lecture title"
        },
        "lecture_overview": {
          "type": "string",
          "description": "Lecture overview. Must be 2 sentences short."
        }        
      },
      "additionalProperties": false
    }
  }
}