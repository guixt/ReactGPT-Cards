import React, { useState, useEffect } from 'react';
import "./styles.css";
import Card from "./Card";
import card1 from './images/card_1.webp';
import card2 from './images/card_2.webp';
import card3 from './images/card_3.webp';
import card4 from './images/card_4.webp';
import card5 from './images/card_5.webp';

import { generateImage, generater_flux_image, getPixabayImageAsBase64, updateApiKeys, getOpenAIKey, getPixabayKey, getFalKey } from './openaiservice';

export const add_card = (card, setCardData, setCardCount) => {
  let totalCards; // Deklariere totalCards hier

  setCardData(prevCardData => {
    const newCardData = [...prevCardData, card];
    totalCards = newCardData.length-1; // Berechne totalCards hier
    setCardCount(totalCards);
    return newCardData;
  });
  const formattedCardInfo = formatCardInfo(card);

  return {
    status: `This info is not for the user: One card added successfully. Total number of cards: ${totalCards}.
     \n\nCard Details:\n${formattedCardInfo}\n\nThe card has been successfully added and is now visible on the interface.`,
  };
};

export const delete_all_cards = (setCardData, setCardCount) => {
  setCardData(prevCardData => {
    const newCardData = prevCardData.slice(0, 1);  // Keep only the first card  
    setCardCount(newCardData.length - 1); // Set card count excluding the initial card
    return newCardData;
  });

  return {
    status: `This info is not for the user: All cards deleted successfully. Total number of cards: 0.`,
  };
};

export const generate_card_image = async (prompt) => {
  // Flux schnell
  let imageDate = await generater_flux_image(prompt);  
  return imageDate;
};


export const delete_card = (title, setCardData, setCardCount) => {
  let totalCards; // Deklariere totalCards hier

  setCardData(prevCardData => {
    const newCardData = prevCardData.filter(card => card.title !== title);
    totalCards = newCardData.length - 1; // Berechne totalCards hier
    setCardCount(totalCards);
    return newCardData;
  });

  return {
    status: `This info is not for the user: Card deleted successfully. Total number of cards: ${totalCards}.`,
  };
};

const ReStart = () => {
  window.location.reload(false);
};
const initialCardData = [
  {
    title: "Willkommen zu deiner kreativen Reise",
    imageUrl: card1,
    headerText: "Starte deine Ideen, Projekte oder Geschichten",
    footerText: "Startkarte",
    inputPlaceholder: "Was möchtest du erkunden oder erschaffen?",
    buttonText: "Weiter",   
    backContent: {
      title: "Projekt-Einstellungen",
      textOnBackOfCard: "Dies ist die Startkarte. Nutze Sie als Ausgangspunkt, um weitere Karten zu erstellen.",
      fields: [
        { label: "Komplexität:", type: "select", options: ["", "Einfach", "Mittel", "Komplex"], placeholder: "Wähle die Komplexität aus" },
        { label: "Technischer Schwerpunkt:", type: "select", options: ["", "Ja", "Nein"], placeholder: "Soll es technisch sein?" },
        { label: "Kreativer Stil:", type: "select", options: ["", "Formell", "Locker", "Künstlerisch"], placeholder: "Wähle den Stil" },
        { label: "Zeitrahmen:", type: "select", options: ["", "Kurzfristig", "Mittelfristig", "Langfristig"], placeholder: "Zeitrahmen für das Projekt" }
      ]
    }
  }
];


const formatCardInfo = (card) => {
  const {
    title,
    imagePrompt,
    headerText,
    footerText,
    inputPlaceholder,
    buttonText,
    backContent
  } = card;

  const backContentFields = backContent?.fields?.map(field => {
    return `  - ${field.label}: ${field.placeholder || 'N/A'}`;
  }).join('\n') || 'No additional fields';

  return `
    Title: ${title || 'N/A'}
    Image Prompt: ${imagePrompt || 'N/A'}
    Header Text: ${headerText || 'N/A'}
    Footer Text: ${footerText || 'N/A'}
    Input Placeholder: ${inputPlaceholder || 'N/A'}
    Button Text: ${buttonText || 'N/A'}
    Back Content:
      Title: ${backContent?.title || 'N/A'}
      Text on Back: ${backContent?.textOnBackOfCard || 'N/A'}
      Fields:
      ${backContentFields}
  `;
};



export default function App() {
  const [response, setResponse] = useState('');
  const [cardInputs, setCardInputs] = useState({});
  const [messages, setMessages] = useState([]); // Messages auf App-Ebene
  const [cardData, setCardData] = useState(initialCardData);
  const [cardCount, setCardCount] = useState(initialCardData.length - 1); // State for card count
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [openAIKey, setOpenAIKey] = useState('');
  const [pixabayKey, setPixabayKey] = useState('');
  const [falKey, setFalKey] = useState('');

  useEffect(() => {
    setCardCount(cardData.length - 1); // Initialize card count excluding the initial card
  }, [cardData]);

  useEffect(() => {
    const missing = !getOpenAIKey() || !getPixabayKey() || !getFalKey();
    setOpenAIKey(getOpenAIKey() || '');
    setPixabayKey(getPixabayKey() || '');
    setFalKey(getFalKey() || '');
    if (missing) {
      setShowKeyDialog(true);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('cardState');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCardData(parsed.cardData || initialCardData);
        setCardInputs(parsed.cardInputs || {});
      } catch (e) {
        console.error('Fehler beim Laden der gespeicherten Karten', e);
      }
    }
  }, []);

  const handleResponse = (responseText) => {
    setResponse(responseText);
  };

  const handleCardInputChange = (cardTitle, label, value) => {
    setCardInputs(prevInputs => ({
      ...prevInputs,
      [cardTitle]: {
        ...prevInputs[cardTitle],
        [label]: value
      }
    }));
  };

  const gatherAllCardInputs = () => {
    return cardData.map(card => {
      const inputs = cardInputs[card.title] || {};
      return `
        Karte: ${card.title}
        - Kartenüberschrift: ${card.headerText}
        - Zusätzliche Informationen: ${card.contextInfo || ''}
        - Rückseitenüberschrift: ${card.backContent.title}
        - Felder und Werte:
        ${card.backContent.fields.map(field => `  - ${field.label}: ${inputs[field.label] || 'N/A'}`).join('\n')}
      `;
    }).join('\n\n');
  };

  const openKeyDialog = () => {
    setOpenAIKey(getOpenAIKey() || '');
    setPixabayKey(getPixabayKey() || '');
    setFalKey(getFalKey() || '');
    setShowKeyDialog(true);
  };

  const saveKeys = () => {
    updateApiKeys({ openAIKey, pixabayKey, falKey });
    setShowKeyDialog(false);
  };

  const saveCards = () => {
    const data = { cardData, cardInputs };
    localStorage.setItem('cardState', JSON.stringify(data));
    alert('Karten gespeichert');
  };

  const loadCards = () => {
    const stored = localStorage.getItem('cardState');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCardData(parsed.cardData || initialCardData);
        setCardInputs(parsed.cardInputs || {});
        alert('Gespeicherte Karten geladen');
      } catch (e) {
        console.error('Fehler beim Laden der Karten', e);
      }
    } else {
      alert('Keine gespeicherten Karten gefunden');
    }
  };

  return (
    <div className="App">
      <button className="reset-button" onClick={() => ReStart()}>
        Neu anfangen
      </button>
      <button className="key-button" onClick={openKeyDialog}>
        API Schlüssel
      </button>
      <button className="save-button" onClick={saveCards}>
        Karten speichern
      </button>
      <button className="load-button" onClick={loadCards}>
        Karten laden
      </button>

      <div className="cards-container ">
        
        <div className="cards-wrapper">
          {cardData.map((card, index) => (
            <Card
              key={index}
              title={card.title}
              imageUrl={card.imageUrl}
              headerText={card.headerText}
              footerText={card.footerText}
              inputPlaceholder={card.inputPlaceholder}
              buttonText={card.buttonText}
              contextInfo={card.contextInfo}
              onResponse={handleResponse}
              backContent={card.backContent}
              onCardInputChange={(label, value) => handleCardInputChange(card.title, label, value)}
              gatherAllCardInputs={gatherAllCardInputs}
              messages={messages}
              setMessages={setMessages}
              add_card={(card) => add_card(card, setCardData, setCardCount)}
              delete_all_cards={() => delete_all_cards(setCardData, setCardCount)}
              generate_card_image={generate_card_image}
              delete_card={(title) => delete_card(title, setCardData, setCardCount)}
            />
          ))}
        </div>
      </div>
      
      <div className="response-box" dangerouslySetInnerHTML={{ __html: response }} />

      {showKeyDialog && (
        <div className="key-dialog-overlay">
          <div className="key-dialog">
            <h3>API Schlüssel eingeben</h3>
            <label>OpenAI:</label>
            <input className="key-input" value={openAIKey} onChange={(e) => setOpenAIKey(e.target.value)} />
            <label>Pixabay:</label>
            <input className="key-input" value={pixabayKey} onChange={(e) => setPixabayKey(e.target.value)} />
            <label>FAL:</label>
            <input className="key-input" value={falKey} onChange={(e) => setFalKey(e.target.value)} />
            <div className="key-dialog-buttons">
              <button onClick={saveKeys}>Speichern</button>
              <button onClick={() => setShowKeyDialog(false)}>Schließen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
