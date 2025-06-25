export const responseSchema = {
  "type": "json_schema",
  "json_schema": {
    "name": "response_schema",
    "strict": true,
    "schema": {
      "type": "object",
      "required": [
        "categories"
      ],
      "properties": {
        "categories": {
          "type": "array",
          "items": {
            "type": "object",
            "required": [
              "category_name",
              "category_id"
            ],
            "properties": {
              "category_name": {
                "type": "string",
                "description": "Category name"
              },
              "category_id": {
                "type": "string",
                "description": "Existing category id. If the category is not found, use NEW keyword as a category id."
              }
            },
            "additionalProperties": false
          },
          "description": "Categories to categorize this lecture"
        }
      },
      "additionalProperties": false
    }
  }
}