const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Function to add a chat message
function addMessage(text, sender, isHTML = false) {
  const message = document.createElement("div");
  message.classList.add("chat-message", sender);
  if (isHTML) {
    message.innerHTML = text; // Render HTML if needed
  } else {
    message.innerText = text;
  }
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to extract structured data from natural language input
function parseUserInput(inputText) {
  const lowerText = inputText.toLowerCase();

  // Parse BaseSellingPrice: Look for phrases like "base selling price" optionally followed by : or =
  let baseSellingPrice = 6.0; // default
  const basePriceMatch = lowerText.match(/base\s*(?:selling)?\s*price\s*[:=]?\s*(\d+(\.\d+)?)/);
  if (basePriceMatch && basePriceMatch[1]) {
    baseSellingPrice = parseFloat(basePriceMatch[1]);
  }

  // Parse AgeGroup: try to match "aged <number>"
  let ageGroup = "25-34"; // default
  const ageMatch = lowerText.match(/aged\s*(\d+)/);
  if (ageMatch && ageMatch[1]) {
    const age = parseInt(ageMatch[1]);
    if (age >= 18 && age <= 24) {
      ageGroup = "18-24";
    } else if (age >= 25 && age <= 34) {
      ageGroup = "25-34";
    } else if (age >= 35 && age <= 44) {
      ageGroup = "35-44";
    }
  }
  
  // Parse Temperature: look for "temperature" keyword or a number with "°c"
  let temperature = 22; // default
  const tempMatch = lowerText.match(/temperature\s*(\d+)/) || lowerText.match(/(\d+)\s*°c/);
  if (tempMatch && tempMatch[1]) {
    temperature = parseInt(tempMatch[1]);
  }
  
  // Parse DayOfWeek; default to Friday if not found.
  const dayMatch = lowerText.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
  let dayOfWeek = dayMatch ? dayMatch[0] : "friday";
  dayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
  
  return {
    "BaseSellingPrice": baseSellingPrice,
    "UserHistory": lowerText.includes("premium") ? "Premium" : "Regular",
    "AgeGroup": ageGroup,
    "DeviceType": lowerText.includes("mobile") ? "Mobile" : "Desktop",
    "OSType": lowerText.includes("ios") ? "iOS" : "Android",
    "ScreenSize": lowerText.includes("large")
      ? "Large"
      : lowerText.includes("small")
      ? "Small"
      : "Medium",
    "CompetitorPricing": lowerText.includes("higher")
      ? "Higher"
      : lowerText.includes("lower")
      ? "Lower"
      : "Similar",
    "RegionalDemand": lowerText.includes("high demand")
      ? "High"
      : lowerText.includes("low demand")
      ? "Low"
      : "Medium",
    "CustomerRating": lowerText.includes("high rating")
      ? "High"
      : lowerText.includes("low rating")
      ? "Low"
      : "Medium",
    "PaydayProximity": (lowerText.includes("near payday") || lowerText.includes("payday near"))
      ? "Near"
      : "Far",
    "TourismLevel": lowerText.includes("tourist")
      ? "High"
      : lowerText.includes("low tourism")
      ? "Low"
      : "Medium",
    "ProductMarketingStatus": lowerText.includes("low marketing") ? "Low" : "Medium",
    "DayOfWeek": dayOfWeek,
    "DemandIndex": lowerText.includes("high demand")
      ? "High"
      : lowerText.includes("low demand")
      ? "Low"
      : "Medium",
    "SpecialOccasion": lowerText.includes("festival")
      ? "Festival"
      : lowerText.includes("holiday")
      ? "Holiday"
      : "None",
    "Temperature": temperature,
    "WeatherCondition": lowerText.includes("rainy")
      ? "Rainy"
      : lowerText.includes("sunny")
      ? "Sunny"
      : "Cloudy",
    "InventoryLevel": lowerText.includes("high stock")
      ? "High"
      : lowerText.includes("low stock")
      ? "Low"
      : "Medium",
    "CityType": lowerText.includes("rural")
      ? "Rural"
      : lowerText.includes("urban")
      ? "Urban"
      : "Suburban",
    "WeekdayType": lowerText.includes("weekend") ? "Weekend" : "Weekday",
    "DayType": lowerText.includes("holiday") ? "Holiday" : "Regular"
  };
}

sendBtn.addEventListener("click", () => {
  const userText = userInput.value.trim();
  if (!userText) return;

  addMessage(userText, "user");

  const parsedData = parseUserInput(userText);
  console.log("Parsed Data:", parsedData);
  
  addMessage("Processing your request... 🍺", "bot");

  fetch("https://beer-price-prediction-model-production.up.railway.app/invocations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsedData)
  })
  .then(response => {
    console.log("Response received:", response);
    if (!response.ok) {
      return response.text().then(text => {
        throw new Error(`HTTP ${response.status}: ${text}`);
      });
    }
    return response.json();
  })
  .then(data => {
    console.log("API response data:", data);
    addMessage(`Predicted Beer Price: $${data.predicted_price} 🍻`, "bot");
    // Remove any '''html markers from the reasoning message
    let reasoning = data.reasoning.replace(/'''html/g, '');
    addMessage(reasoning, "bot", true);
  })
  .catch(error => {
    console.error("Fetch error:", error);
    addMessage("Error fetching prediction. Please try again.", "bot");
  });
});
