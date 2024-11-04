import axios from 'axios';
import * as fal from "@fal-ai/serverless-client";

const key = process.env.REACT_APP_API_KEY;

const openai = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${key}`,
  },
});

export const getChatResponse = async (messages,functions) => {
    try {
      const response = await openai.post('/chat/completions', {
        model: 'gpt-4o-mini', // Verwende den korrekten Modellnamen
        messages: messages, // Hier die übergebene Nachrichtenstruktur verwenden
        max_tokens: 5000,
        functions: functions, // Include functions in the request
      });
      return response.data;
    } catch (error) {
      console.error('Error response:', error.response.data);
      throw error;
    }
};


// Funktion für die Bildgenerierung
export const generateImage = async (prompt) => {
  try {
    const response = await openai.post('/images/generations', {
      prompt: prompt, // Prompt für die Bildgenerierung
      model: 'dall-e-2',
      response_format: "b64_json",
      n: 1, // Anzahl der zu generierenden Bilder
      size: '512x512', // Größe des generierten Bildes
    });
    const imgSrc = `data:image/jpeg;base64,${response.data.data[0].b64_json}`; // Bildquelle als Base64-String erstellen
    return imgSrc; // Base64-String zurückgeben
   
  } catch (error) {
    console.error('Error response:', error.response.data);
    throw error;
  }
};



// const PIXABAY_API_KEY = '19848820-f3823119fc2995824f63bb9a2'; // Replace with your Pixabay API key
const PIXABAY_API_KEY = process.env.REACT_APP_PIXABAY_KEY;


// Function to search Pixabay for images
async function searchPixabay(query) {
    const response = await fetch(`https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo`);
    const data = await response.json();
    if (data.hits && data.hits.length > 0) {
        return data.hits[0].webformatURL; // Return the URL of the first image found
    } else {
        throw new Error('No images found');
    }
}

// Function to fetch image and convert to base64
async function fetchImageAsBase64(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Combined function to search Pixabay and convert the image to base64
export async function getPixabayImageAsBase64(query) {
    try {
        const imageUrl = await searchPixabay(query);
        const base64Image = await fetchImageAsBase64(imageUrl);
        return base64Image;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}


const flux_key = process.env.REACT_APP_FAL_KEY;

fal.config({
  credentials: flux_key
});
// Funktion für die Bildgenerierung und Umwandlung in Base64
export const generater_flux_image = async (prompt) => {
  try {
    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: prompt,
        num_images: 1,
        num_inference_steps: 4,
        enable_safety_checker: true,
        image_size: 'square'
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    // Überprüfen, ob Bilder vorhanden sind
    if (!result.images || result.images.length === 0) {
      throw new Error("No images were generated.");
    }

    // Die URL des ersten generierten Bildes
    const imageUrl = result.images[0].url;

    // Bild von der URL herunterladen
    const response = await axios.get(imageUrl, {
      responseType: 'blob',
    });

    // Blob in Base64 umwandeln
    const blob = response.data;
    const reader = new FileReader();

    const base64Image = await new Promise((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    return base64Image; // Base64-String des Bildes zurückgeben

  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};