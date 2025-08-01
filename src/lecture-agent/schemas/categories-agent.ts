export const responseSchema = {
  "type": "json_schema",
  "json_schema": {
    "name": "response_schema",
    "strict": true,
    "schema": {
      "type": "object",
      "properties": {
        "categories": {
          "type": "array",
          "description": "Categories to categorize this lecture",
          "items": {
            "type": "object",
            "properties": {
              "category_name": {
                "type": "string",
                "description": "Category name. Must be one or two words.",
                "pattern": "^\\w+(?:\\s\\w+)?$"
              },
              "category_id": {
                "anyOf": [
                  {
                    "type": "string",
                    "description": "Existing category id."
                  },
                  {
                    "type": "null",
                    "description": "If no category id is provided."
                  }
                ]
              }
            },
            "required": [
              "category_name",
              "category_id"
            ],
            "additionalProperties": false
          }
        }
      },
      "required": [
        "categories"
      ],
      "additionalProperties": false
    }
  }
}