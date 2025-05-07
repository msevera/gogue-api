export const responseSchema = {
  "type": "json_schema",
  "json_schema": {
    "name": "response_schema",
    "strict": true,
    "schema": {
      "type": "object",
      "required": [
        "title",
        "checkpoint"
      ],
      "properties": {
        "title": {
          "type": "string",
          "description": "Section title where the checkpoint starts"
        },
        "checkpoint": {
          "type": "string",
          "description": "Sentence from section where the lecture had been stopped"
        }
      },
      "additionalProperties": false
    }
  }
}