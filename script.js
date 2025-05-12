// // Function to fetch food prices from API
// async function fetchFoodPrices(foodItem = "") {
//     let resultsDiv = document.getElementById("results");
//     resultsDiv.innerHTML = "<p>Searching...</p>";
    
//     console.log("Searching for:", foodItem);
    
//     // Always fetch all prices, then filter on the frontend
//     let url = "http://127.0.0.1:5000/compare_all_prices";

//     console.log("Fetching from URL:", url);

//     try {
//         const response = await fetch(url, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//         });

//         console.log("Response status:", response.status);

//         if (!response.ok) {
//             throw new Error(`Server responded with status: ${response.status}`);
//         }

//         const responseText = await response.text();
//         console.log("Raw response:", responseText);

//         let data;
//         try {
//             data = responseText ? JSON.parse(responseText) : {};
//         } catch (parseError) {
//             throw new Error("Failed to parse response as JSON: " + parseError.message);
//         }
//         console.log("Parsed data:", data);

//         resultsDiv.innerHTML = "";

//         if (!responseText || Object.keys(data).length === 0) {
//             resultsDiv.innerHTML = "<p>No results found for your search. Please try another term.</p>";
//             clearChart();
//             return;
//         }

//         let labels = [];
//         let swiggyPrices = [];
//         let zomatoPrices = [];

//         // Pre-process data to group by food name
//         let foodPrices = {};
//         for (let key in data) {
//             let platform = key.includes("(Swiggy)") ? "Swiggy" : key.includes("(Zomato)") ? "Zomato" : null;
//             if (!platform) {
//                 // If no platform in key, assume data[key] is an array of items
//                 let food = key.trim();
//                 if (!foodPrices[food]) {
//                     foodPrices[food] = { Swiggy: "N/A", Zomato: "N/A", SwiggyRestaurant: "N/A", ZomatoRestaurant: "N/A" };
//                 }
//                 // Iterate over the array of items
//                 let items = data[key];
//                 if (Array.isArray(items)) {
//                     for (let item of items) {
//                         let itemPlatform = item.platform;
//                         if (itemPlatform === "Swiggy" || itemPlatform === "Zomato") {
//                             foodPrices[food][itemPlatform] = item.price || "N/A";
//                             foodPrices[food][`${itemPlatform}Restaurant`] = item.restaurant || "N/A";
//                         }
//                     }
//                 }
//             } else {
//                 // Handle the old format (if it ever appears)
//                 let food = key.replace(` (${platform})`, "").trim();
//                 if (!foodPrices[food]) {
//                     foodPrices[food] = { Swiggy: "N/A", Zomato: "N/A", SwiggyRestaurant: "N/A", ZomatoRestaurant: "N/A" };
//                 }
//                 foodPrices[food][platform] = data[key].price;
//                 foodPrices[food][`${platform}Restaurant`] = data[key].restaurant || "N/A";
//             }
//         }
//         console.log("Grouped food prices:", foodPrices);

//         // Filter based on search term
//         let filteredFoodPrices = {};
//         let isRestaurantSearch = false;

//         // Check if the search term matches a restaurant name
//         if (foodItem) {
//             let searchTerm = foodItem.trim().toLowerCase();
//             console.log(`Normalized search term: "${searchTerm}"`);
//             for (let food in foodPrices) {
//                 let swiggyRestaurant = foodPrices[food].SwiggyRestaurant;
//                 let zomatoRestaurant = foodPrices[food].ZomatoRestaurant;
//                 let swiggyRestaurantLower = swiggyRestaurant !== "N/A" ? swiggyRestaurant.toLowerCase() : "N/A";
//                 let zomatoRestaurantLower = zomatoRestaurant !== "N/A" ? zomatoRestaurant.toLowerCase() : "N/A";
//                 console.log(`Checking food: ${food}, Swiggy Restaurant: ${swiggyRestaurantLower}, Zomato Restaurant: ${zomatoRestaurantLower}`);
//                 if ((swiggyRestaurant !== "N/A" && swiggyRestaurantLower.includes(searchTerm)) ||
//                     (zomatoRestaurant !== "N/A" && zomatoRestaurantLower.includes(searchTerm))) {
//                     console.log(`Restaurant match found for "${searchTerm}" in ${food}: Swiggy Restaurant: ${swiggyRestaurant}, Zomato Restaurant: ${zomatoRestaurant}`);
//                     filteredFoodPrices[food] = foodPrices[food];
//                     isRestaurantSearch = true;
//                 } else {
//                     console.log(`No restaurant match for "${searchTerm}" in ${food}`);
//                 }
//             }
//             console.log(`Restaurant search result for "${searchTerm}":`, isRestaurantSearch ? "Matches found" : "No matches");
//         }

//         // If not a restaurant search, filter by food name
//         if (!isRestaurantSearch && foodItem) {
//             console.log("No restaurant match, falling back to food name search");
//             let searchTerm = foodItem.trim().toLowerCase();
//             for (let food in foodPrices) {
//                 if (food.toLowerCase().includes(searchTerm)) {
//                     console.log(`Food name match found for "${searchTerm}": ${food}`);
//                     filteredFoodPrices[food] = foodPrices[food];
//                 } else {
//                     console.log(`No food name match for "${searchTerm}" in ${food}`);
//                 }
//             }
//         }

//         // If no search term (Show All), use all items
//         if (!foodItem) {
//             console.log("No search term, showing all items");
//             filteredFoodPrices = foodPrices;
//         }

//         console.log("Filtered food prices:", filteredFoodPrices);

//         // If no matches found, show a message
//         if (Object.keys(filteredFoodPrices).length === 0) {
//             resultsDiv.innerHTML = "<p>No items found for your search. Please try another term.</p>";
//             clearChart();
//             return;
//         }

//         // Use filtered data in the original loop
//         for (let food in filteredFoodPrices) {
//             let foodDiv = document.createElement("div");
//             foodDiv.classList.add("food-item");

//             let swiggyPrice = filteredFoodPrices[food].Swiggy;
//             let zomatoPrice = filteredFoodPrices[food].Zomato;
//             let swiggyRestaurant = filteredFoodPrices[food].SwiggyRestaurant;
//             let zomatoRestaurant = filteredFoodPrices[food].ZomatoRestaurant;

//             foodDiv.innerHTML = `
//                 <p><strong>${food}</strong></p>
//                 <p><span style="color: green;">Swiggy: ₹${swiggyPrice} (${swiggyRestaurant})</span></p>
//                 <p><span style="color: red;">Zomato: ₹${zomatoPrice} (${zomatoRestaurant})</span></p>
//             `;
//             resultsDiv.appendChild(foodDiv);

//             labels.push(food);
//             swiggyPrices.push(typeof swiggyPrice === 'number' ? swiggyPrice : 0);
//             zomatoPrices.push(typeof zomatoPrice === 'number' ? zomatoPrice : 0);
//         }

//         if (labels.length > 0) {
//             renderCircularChart(labels, swiggyPrices, zomatoPrices);
//         } else {
//             clearChart();
//         }

//     } catch (error) {
//         console.error("Error fetching data:", error);
//         resultsDiv.innerHTML = `<p>Error: ${error.message}. Please ensure the server is running and try again.</p>`;
//         clearChart();
//     }
// }

// // Function to clear the chart
// function clearChart() {
//     if (window.priceChartInstance) {
//         window.priceChartInstance.destroy();
//         window.priceChartInstance = null;
//     }
    
//     const chartContainer = document.getElementById('chartContainer');
//     if (chartContainer) {
//         chartContainer.style.display = 'none';
//     }
// }

// // Function to create chart container
// function createChartContainer() {
//     const existingContainer = document.getElementById('chartContainer');
//     if (existingContainer) {
//         existingContainer.style.display = 'block';
//         return document.getElementById('priceChart');
//     }
    
//     const container = document.createElement('div');
//     container.id = 'chartContainer';
//     container.style.width = '350px';
//     container.style.height = '350px';
//     container.style.margin = '20px auto';
    
//     const canvas = document.createElement('canvas');
//     canvas.id = 'priceChart';
//     container.appendChild(canvas);
    
//     const resultsDiv = document.getElementById('results');
//     resultsDiv.parentNode.insertBefore(container, resultsDiv.nextSibling);
    
//     return canvas;
// }

// // Function to render the circular chart
// function renderCircularChart(labels, swiggyPrices, zomatoPrices) {
//     createChartContainer();
    
//     let ctx = document.getElementById('priceChart').getContext('2d');

//     if (window.priceChartInstance) {
//         window.priceChartInstance.destroy();
//     }

//     window.priceChartInstance = new Chart(ctx, {
//         type: 'doughnut',
//         data: {
//             labels: labels,
//             datasets: [
//                 {
//                     label: 'Swiggy Price',
//                     data: swiggyPrices,
//                     backgroundColor: ['#f39c12', '#e67e22', '#d35400', '#e74c3c', '#c0392b'],
//                     borderWidth: 1
//                 },
//                 {
//                     label: 'Zomato Price',
//                     data: zomatoPrices,
//                     backgroundColor: ['#3498db', '#2980b9', '#1abc9c', '#16a085', '#27ae60'],
//                     borderWidth: 1
//                 }
//             ]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: true,
//             plugins: {
//                 legend: {
//                     position: 'bottom',
//                     labels: {
//                         boxWidth: 15,
//                         font: {
//                             size: 11
//                         }
//                     }
//                 },
//                 title: {
//                     display: true,
//                     text: 'Price Comparison',
//                     font: {
//                         size: 16
//                     }
//                 }
//             }
//         }
//     });
// }

// // Function to search food
// function searchFood() {
//     let query = document.getElementById("searchBox").value.trim();
//     console.log("Search function called with query:", query);
    
//     if (query) {
//         fetchFoodPrices(query);
//     } else {
//         document.getElementById("results").innerHTML = "<p>Please enter a food item to search.</p>";
//         clearChart();
//     }
// }

// // Function to show welcome message on page load
// function showWelcomeMessage() {
//     let resultsDiv = document.getElementById("results");
//     resultsDiv.innerHTML = `
//         <div class="welcome-message" style="text-align: center; margin: 20px;">
//             <h2>Welcome to Meal-Match</h2>
//             <p>Compare food prices between Swiggy and Zomato.</p>
//             <p>Enter a food item in the search box above to get started.</p>
//         </div>
//     `;
    
//     clearChart();
// }

// // Function to handle "Show All Food Prices" button
// function showAllFoodPrices() {
//     console.log("Show All button clicked");
//     fetchFoodPrices(""); // Empty string will fetch all prices
// }

// // Initialize the page when it loads
// window.onload = function() {
//     console.log("Page loaded - initializing...");
    
//     showWelcomeMessage();
    
//     const searchBox = document.getElementById("searchBox");
//     if (searchBox) {
//         searchBox.addEventListener("keypress", function(event) {
//             if (event.key === "Enter") {
//                 searchFood();
//             }
//         });
//     }
    
//     const showAllButton = document.getElementById("showAllButton");
//     if (showAllButton) {
//         showAllButton.addEventListener("click", showAllFoodPrices);
//     }
    
//     console.log("Initialization complete!");
// };
// script.js
// Function to fetch food prices from API
async function fetchFoodPrices(foodItem = "") {
    let resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<p>Searching...</p>";
    
    console.log("Searching for:", foodItem);
    
    // Always fetch all prices, then filter on the frontend
    let url = "http://127.0.0.1:5000/compare_all_prices";

    console.log("Fetching from URL:", url);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const responseText = await response.text();
        console.log("Raw response:", responseText);

        let data;
        try {
            data = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
            throw new Error("Failed to parse response as JSON: " + parseError.message);
        }
        console.log("Parsed data:", data);

        resultsDiv.innerHTML = "";

        if (!responseText || Object.keys(data).length === 0) {
            resultsDiv.innerHTML = "<p>No results found for your search. Please try another term.</p>";
            clearChart();
            return;
        }

        let labels = [];
        let swiggyPrices = [];
        let zomatoPrices = [];

        // Pre-process data to group by food name
        let foodPrices = {};
        for (let key in data) {
            let food = key.trim();
            if (!foodPrices[food]) {
                foodPrices[food] = { 
                    Swiggy: "N/A", 
                    Zomato: "N/A", 
                    SwiggyRestaurant: "N/A", 
                    ZomatoRestaurant: "N/A",
                    SwiggyRating: "N/A",  // Added for Swiggy rating
                    ZomatoRating: "N/A"   // Added for Zomato rating
                };
            }
            let items = data[key];
            if (Array.isArray(items)) {
                for (let item of items) {
                    let itemPlatform = item.platform;
                    if (itemPlatform === "Swiggy" || itemPlatform === "Zomato") {
                        foodPrices[food][itemPlatform] = item.price || "N/A";
                        foodPrices[food][`${itemPlatform}Restaurant`] = item.restaurant || "N/A";
                        foodPrices[food][`${itemPlatform}Rating`] = item.rating !== null ? item.rating : "N/A";  // Store rating
                    }
                }
            }
        }
        console.log("Grouped food prices:", foodPrices);

        // Filter based on search term
        let filteredFoodPrices = {};
        let isRestaurantSearch = false;

        // Check if the search term matches a restaurant name
        if (foodItem) {
            let searchTerm = foodItem.trim().toLowerCase();
            console.log(`Normalized search term: "${searchTerm}"`);
            for (let food in foodPrices) {
                let swiggyRestaurant = foodPrices[food].SwiggyRestaurant;
                let zomatoRestaurant = foodPrices[food].ZomatoRestaurant;
                let swiggyRestaurantLower = swiggyRestaurant !== "N/A" ? swiggyRestaurant.toLowerCase() : "N/A";
                let zomatoRestaurantLower = zomatoRestaurant !== "N/A" ? zomatoRestaurant.toLowerCase() : "N/A";
                console.log(`Checking food: ${food}, Swiggy Restaurant: ${swiggyRestaurantLower}, Zomato Restaurant: ${zomatoRestaurantLower}`);
                if ((swiggyRestaurant !== "N/A" && swiggyRestaurantLower.includes(searchTerm)) ||
                    (zomatoRestaurant !== "N/A" && zomatoRestaurantLower.includes(searchTerm))) {
                    console.log(`Restaurant match found for "${searchTerm}" in ${food}: Swiggy Restaurant: ${swiggyRestaurant}, Zomato Restaurant: ${zomatoRestaurant}`);
                    filteredFoodPrices[food] = foodPrices[food];
                    isRestaurantSearch = true;
                } else {
                    console.log(`No restaurant match for "${searchTerm}" in ${food}`);
                }
            }
            console.log(`Restaurant search result for "${searchTerm}":`, isRestaurantSearch ? "Matches found" : "No matches");
        }

        // If not a restaurant search, filter by food name
        if (!isRestaurantSearch && foodItem) {
            console.log("No restaurant match, falling back to food name search");
            let searchTerm = foodItem.trim().toLowerCase();
            for (let food in foodPrices) {
                if (food.toLowerCase().includes(searchTerm)) {
                    console.log(`Food name match found for "${searchTerm}": ${food}`);
                    filteredFoodPrices[food] = foodPrices[food];
                } else {
                    console.log(`No food name match for "${searchTerm}" in ${food}`);
                }
            }
        }

        // If no search term (Show All), use all items
        if (!foodItem) {
            console.log("No search term, showing all items");
            filteredFoodPrices = foodPrices;
        }

        console.log("Filtered food prices:", filteredFoodPrices);

        // If no matches found, show a message
        if (Object.keys(filteredFoodPrices).length === 0) {
            resultsDiv.innerHTML = "<p>No items found for your search. Please try another term.</p>";
            clearChart();
            return;
        }

        // Use filtered data in the original loop
        for (let food in filteredFoodPrices) {
            let foodDiv = document.createElement("div");
            foodDiv.classList.add("food-item");

            let swiggyPrice = filteredFoodPrices[food].Swiggy;
            let zomatoPrice = filteredFoodPrices[food].Zomato;
            let swiggyRestaurant = filteredFoodPrices[food].SwiggyRestaurant;
            let zomatoRestaurant = filteredFoodPrices[food].ZomatoRestaurant;
            let swiggyRating = filteredFoodPrices[food].SwiggyRating;  // Get Swiggy rating
            let zomatoRating = filteredFoodPrices[food].ZomatoRating;  // Get Zomato rating

            foodDiv.innerHTML = `
                <p><strong>${food}</strong></p>
                <p><span style="color: green;">Swiggy: ₹${swiggyPrice} (${swiggyRestaurant})${swiggyRating !== "N/A" ? ` - Rating: ${swiggyRating}/5` : ''}</span></p>
                <p><span style="color: red;">Zomato: ₹${zomatoPrice} (${zomatoRestaurant})${zomatoRating !== "N/A" ? ` - Rating: ${zomatoRating}/5` : ''}</span></p>
            `;
            resultsDiv.appendChild(foodDiv);

            labels.push(food);
            swiggyPrices.push(typeof swiggyPrice === 'number' ? swiggyPrice : 0);
            zomatoPrices.push(typeof zomatoPrice === 'number' ? zomatoPrice : 0);
        }

        if (labels.length > 0) {
            renderCircularChart(labels, swiggyPrices, zomatoPrices);
        } else {
            clearChart();
        }

    } catch (error) {
        console.error("Error fetching data:", error);
        resultsDiv.innerHTML = `<p>Error: ${error.message}. Please ensure the server is running and try again.</p>`;
        clearChart();
    }
}

// Function to clear the chart
function clearChart() {
    if (window.priceChartInstance) {
        window.priceChartInstance.destroy();
        window.priceChartInstance = null;
    }
    
    const chartContainer = document.getElementById('chartContainer');
    if (chartContainer) {
        chartContainer.style.display = 'none';
    }
}

// Function to create chart container
function createChartContainer() {
    const existingContainer = document.getElementById('chartContainer');
    if (existingContainer) {
        existingContainer.style.display = 'block';
        return document.getElementById('priceChart');
    }
    
    const container = document.createElement('div');
    container.id = 'chartContainer';
    container.style.width = '350px';
    container.style.height = '350px';
    container.style.margin = '20px auto';
    
    const canvas = document.createElement('canvas');
    canvas.id = 'priceChart';
    container.appendChild(canvas);
    
    const resultsDiv = document.getElementById('results');
    resultsDiv.parentNode.insertBefore(container, resultsDiv.nextSibling);
    
    return canvas;
}

// Function to render the circular chart
function renderCircularChart(labels, swiggyPrices, zomatoPrices) {
    createChartContainer();
    
    let ctx = document.getElementById('priceChart').getContext('2d');

    if (window.priceChartInstance) {
        window.priceChartInstance.destroy();
    }

    window.priceChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Swiggy Price',
                    data: swiggyPrices,
                    backgroundColor: ['#f39c12', '#e67e22', '#d35400', '#e74c3c', '#c0392b'],
                    borderWidth: 1
                },
                {
                    label: 'Zomato Price',
                    data: zomatoPrices,
                    backgroundColor: ['#3498db', '#2980b9', '#1abc9c', '#16a085', '#27ae60'],
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 15,
                        font: {
                            size: 11
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Price Comparison',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

// Function to search food
function searchFood() {
    let query = document.getElementById("searchBox").value.trim();
    console.log("Search function called with query:", query);
    
    if (query) {
        fetchFoodPrices(query);
    } else {
        document.getElementById("results").innerHTML = "<p>Please enter a food item to search.</p>";
        clearChart();
    }
}

// Function to show welcome message on page load
function showWelcomeMessage() {
    let resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = `
        <div class="welcome-message" style="text-align: center; margin: 20px;">
            <h2>Welcome to Meal-Match</h2>
            <p>Compare food prices between Swiggy and Zomato.</p>
            <p>Enter a food item in the search box above to get started.</p>
        </div>
    `;
    
    clearChart();
}

// Function to handle "Show All Food Prices" button
function showAllFoodPrices() {
    console.log("Show All button clicked");
    fetchFoodPrices(""); // Empty string will fetch all prices
}

// Initialize the page when it loads
window.onload = function() {
    console.log("Page loaded - initializing...");
    
    showWelcomeMessage();
    
    const searchBox = document.getElementById("searchBox");
    if (searchBox) {
        searchBox.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                searchFood();
            }
        });
    }
    
    const showAllButton = document.getElementById("showAllButton");
    if (showAllButton) {
        showAllButton.addEventListener("click", showAllFoodPrices);
    }
    
    console.log("Initialization complete!");
};