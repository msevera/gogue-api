export const responseSchema = {
  "type": "json_schema",
  "json_schema": {
    "name": "response_schema",
    "strict": true,
    "schema": {
      "type": "object",
      "required": [
        "queries"
      ],
      "properties": {
        "queries": {
          "type": "array",
          "items": {
            "type": "object",
            "required": [
              "topic_id",
              "query_text"
            ],
            "properties": {
              "topic_id": {
                "type": "string",
                "description": "Topic Id"
              },
              "query_text": {
                "type": "string",
                "description": "Text of the query."
              }
            },
            "additionalProperties": false
          },
          "description": "Queries to use for creating lectures"
        }
      },
      "additionalProperties": false
    }
  }
}