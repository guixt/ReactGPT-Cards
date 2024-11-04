import React, { useState } from 'react';
import "./styles.css";
import logo from './logo.png';
import loadingGif from './loading.gif';
import { getChatResponse } from './openaiservice';
import rotateIcon from './images/rotate.png';
import {
  functions,
  createPlaceholderImage
} from './chatgptfunctions.js';

import card1 from './images/card_1.webp';

const Card = ({
  title,
  imageUrl = card1,
  headerText,
  footerText,
  inputPlaceholder,
  buttonText,
  textOnBackOfCard,
  onResponse,
  backContent,
  onCardInputChange,
  gatherAllCardInputs,
  messages,
  setMessages,
  add_card,
  delete_all_cards,
  generate_card_image,
  delete_card

}) => {
  const [input, setInput] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [backContentValues, setBackContentValues] = useState({});
  const [isFirstSubmission, setIsFirstSubmission] = useState(true);
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);

  const handleButtonClick = () => {
    onResponse(`<img src="${loadingGif}" alt="Loading..." style="width:120px; height: 120px; margin-right: 8px;" />`);
    handleSubmit();
  };
  const contextStartMessage = `
  Deine Aufgabe ist es, dem Benutzer bei der Verwaltung und Erstellung von Karten zu helfen. 
  Der Benutzer startet mit einer allgemeinen Karte, auf der er Eingaben machen kann. 
  Basierend auf diesen Eingaben kannst du neue, spezifische Karten generieren, wenn es sinnvoll erscheint. 
  Du sollst auch die Möglichkeit haben, Karten zu löschen, wenn dies notwendig ist.

  Der Fokus liegt darauf, auf die Eingaben des Benutzers zu reagieren und entsprechende Karten zu erstellen, 
  aber nicht jedes Mal eine Karte zu generieren. Die Ausgabe sollte hauptsächlich in Textform oder mit einfachen HTML-Elementen erfolgen, 
  ohne komplexe Kartenelemente zu erstellen. 

  Alle Antworten sollten in einfachem, klarem HTML formatiert werden, unter Verwendung von Tags wie <b>, <blockquote>, <br>, und <p>, 
  um die Lesbarkeit zu verbessern. Verwende gerne ansprechende CSS-Stile, um das Layout zu optimieren. 

  **Falls es im Kontext nützlich ist, verwende auch <ul>, <ol> und <li> für Aufzählungen.**

  **Wandle jeglichen Text, der in doppelte Sternchen (**) eingeschlossen ist, in <p>-Tags, angeführt und abgeschlossen mit je einem <br>**
  Bitte keine Formulare oder andere UI Elemente in der Textausgabe generieren. 
  **Verwende kein kompliziertes CSS und verändere nicht das gesamte Seitenlayout. Falls CSS erforderlich ist, sollte es nur direkt bei den betreffenden Elementen angewendet werden.**

  Falls es im Kontext nützlich ist, füge bitte auch ein paar hilfreiche Links am Ende deiner Antwort hinzu.

  Generiere weitere Karten, wenn es sinnvoll erscheint. 
  Frage nicht nach, ob du eine Karte erstellen sollst, sondern tue es einfach. 

  Gebe nicht aus, was auf der Karte steht, sondern gebe Hinweise, wie sie verwendet werden kann. 
  Wichtig: Versuche jeweils eine Antwort zu generieren, die unter Einbeziehung der bisherigen Fragen und Antworten sowie eingegebenen Daten 
  des Benutzers auf den Karten eine sinnvolle Fortsetzung für den Benutzer generiert und ermöglicht.

  Generiere maximal fünf Karten auf einmal. Beachte, falls angegeben, die zu generierende Anzahl an Karten genau!
  Du kannst auf der Rückseite der Karte normale Eingabefelder, aber auch <select> und <range> erstellen. 

  Nachdem die Karten erstellt wurden, gib diese bitte nicht im HTML nochmal an. 
  Überlege dir vielmehr, was der Benutzer nun mit der Kombination der generierten Karten als nächstes tun könnte. 
`;




  const handleSubmit = async () => {
    try {
      const callFunction = async (name, args) => {
        switch (name) {


          case 'add_card':
            let imgSrc;
            if (args.imagePrompt && args.imagePrompt.trim() !== '') {
              imgSrc = await generate_card_image(args.imagePrompt);
            } else {
              imgSrc = 'data:image/jpeg;base64,' + createPlaceholderImage();
            }
            args.imageUrl = imgSrc;
            return add_card(args);

          case 'delete_card':
            return delete_card(args.title);
         

          case 'delete_all_cards':
            return delete_all_cards();
          default:
            throw new Error(`Function ${name} not implemented`);
        }
      };

      const allCardInputs = gatherAllCardInputs();

      const systemMessageContent = `
      Der Benutzer interagiert mit einer interaktiven Karte, die verschiedene Eingabemöglichkeiten im Kontext von "${title}" bietet. 
      Der Benutzer hat auf den Button mit dem Text "${buttonText}" geklickt und folgende Informationen eingegeben:

      ${allCardInputs}
      `;

      const contextMessage = {
        role: 'system',
        type: 'text',
        content: contextStartMessage
      };

      const systemMessage = {
        role: 'system',
        type: 'text',
        content: systemMessageContent
      };

      const userMessageContent = input ? `${input}` : `${buttonText}`;

      const userMessage = {
        role: 'user',
        type: 'text',
        content: userMessageContent
      };

      let newMessages = [...messages, systemMessage, userMessage];

      if (isFirstSubmission) {
        newMessages = [...messages, contextMessage, systemMessage, userMessage];
        setIsFirstSubmission(false);
      }

      let isCompleted = false;
      let iterationCount = 0;
      const maxIterations = 50;

      do {
        const aiResponse = await getChatResponse(newMessages, functions);
        const message = aiResponse.choices[0].message;

        if (message.function_call) {
          const functionName = message.function_call.name;
          const functionArgs = JSON.parse(message.function_call.arguments);
          const functionResult = await callFunction(functionName, functionArgs);
          newMessages.push({ role: 'function', name: functionName, content: JSON.stringify(functionResult) });
          iterationCount++;
          continue;
        }

        isCompleted = true;
        const assistantMessage = {
          role: 'assistant',
          type: 'text',
          content: message.content,
        };

        setMessages([...newMessages, assistantMessage]);
        onResponse(message.content);

      } while (!isCompleted && iterationCount < maxIterations);

    } catch (error) {
      console.error('Error fetching OpenAI response:', error);
    }
  };

  const handleBackContentChange = (label, value) => {
    setBackContentValues(prevValues => ({
      ...prevValues,
      [label]: value
    }));
    onCardInputChange(label, value);
  };

  return (
    <div className={`card ${isFlipped ? 'flipped' : ''}`}>
      <div className="card-inner">
        <div className="card-front">
          <div className="card-header" onClick={() => setIsFlipped(!isFlipped)}>
            <img src={currentImageUrl} alt="Card Image" />
            <div className="card-headerText">{headerText}</div>
          </div>
          <div className="card-body">
            <h1 className="card-title">{title}</h1>
            <textarea
              className="card-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={inputPlaceholder}
            />
            <button className="card-button" onClick={handleButtonClick}>{buttonText}</button>
          </div>
          <div className="card-footer">
            <div className="text-image">{footerText}</div>
            <img src={logo} alt="Logo" />
          </div>
        </div>

        <div className="card-back">
          <img src={rotateIcon} alt="Rotate" className="rotate-icon" onClick={() => setIsFlipped(!isFlipped)} />
          <div className="card-body">
            <h1 className="card-title">{backContent.title}</h1>
           
            {backContent.fields.map((field, index) => (
              <div key={index}>
                <label className="card-label">{field.label}</label>
                {field.type === 'select' ? (
                  <select className="card-input" onChange={(e) => handleBackContentChange(field.label, e.target.value)}>
                    {field.options.map((option, i) => (
                      <option key={i} value={option}>{option}</option>
                    ))}
                  </select>
                ) : field.type === 'range' ? (
                  <div>
                    <input
                      type="range"
                      className="card-slider"
                      min={field.min}
                      max={field.max}
                      value={backContentValues[field.label] || field.min}
                      onChange={(e) => handleBackContentChange(field.label, e.target.value)}
                    />
                    <span className='card-range-value'>{backContentValues[field.label] || field.min}</span>
                  </div>
                ) : (
                  <input
                    type={field.type}
                    className="card-input"
                    placeholder={field.placeholder}
                    value={backContentValues[field.label] || ''}
                    onChange={(e) => handleBackContentChange(field.label, e.target.value)}
                  />
                )}
               

              </div>
            ))}
             <div className="card-scrollable-text">
                  <p>{backContent.textOnBackOfCard}</p>
                </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;