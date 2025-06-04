export const functions = [
    {
        "name": "add_card",
        "description": "This function will add exactly one new card with the given attributes",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "description": "The title of the card",
                },
                "imagePrompt":
                {
                    "type": "string",
                    "description": "A prompt for generating the image for the card, maximum of 100 characters",
                },
                "imageUrl": {
                    "type": "string",
                    "description": "URL for the image on the card",
                },
                "headerText": {
                    "type": "string",
                    "description": "Header text for the card",
                },
                "footerText": {
                    "type": "string",
                    "description": "Footer text for the card, maximum of 40 characters",
                },
                "inputPlaceholder": {
                    "type": "string",
                    "description": "Placeholder text for the input field",
                },
                "buttonText": {
                    "type": "string",
                    "description": "Text on the button",
                },
               
                "backContent": {
                    "type": "object",
                    "description": "Content for the back side of the card",
                    "properties": {
                        "title": { "type": "string", "description": "Title on the back side" },
                        "textOnBackOfCard": {"type": "string", "description": "Descriptive text on the back side of the card, 20 to 100 words."},
                        "fields": {
                            "type": "array",
                            "description": "Fields on the back side",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "label": { "type": "string", "description": "Label for the field" },
                                    "type": { "type": "string", "description": "Type of the field" },
                                    "placeholder": { "type": "string", "description": "Placeholder text" },                                   
                                    "options": { "type": "array", "description": "Options for select fields", "items": { "type": "string" } }
                                }
                            }
                        }
                    }
                }
            },
            "required": ["title", "headerText", "buttonText", "textOnBackOfCard", "footerText", "inputPlaceholder","imagePrompt"]
        }
    },
    {
        "name": "delete_all_cards",
        "description": "Delete all cards from the UI",
        "parameters": {
            "type": "object",
            "properties": {}
        }
    },

    {
        "name": "delete_card",
        "description": "Delete a certain card",
        "parameters": {
            "type": "object",
            "properties": {

                "title": {
                    "type": "string",
                    "description": "The title of the card to be deleted",
                }

            }
        }
    },

    


        
];

export function createPlaceholderImage() {
    // Create a simple 1x1 pixel image as a placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;

    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#cccccc'; // Choose a placeholder color
        ctx.fillRect(0, 0, 1, 1);
    }

    if (typeof canvas.toDataURL === 'function') {
        const data = canvas.toDataURL('image/jpeg');
        if (data && data.includes(',')) {
            return data.split(',')[1];
        }
    }
    return '';
}