// Show or hide loader spinner
function showLoader(show) {
    document.getElementById('loader').classList.toggle('hidden', !show);
}

// Fetch recipes based on search input
async function searchRecipe() {
    const query = document.getElementById('searchInput').value.trim();
    const resultsDiv = document.getElementById('results');

    if (!query) {
        resultsDiv.innerHTML = "<p>Please enter a recipe name.</p>";
        return;
    }

    showLoader(true);
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
        const data = await response.json();
        renderRecipes(data.meals);
    } catch (error) {
        console.error(error);
        resultsDiv.innerHTML = "<p>Something went wrong! Try again later.</p>";
    }
    showLoader(false);
}

// Fetch a random recipe
async function randomRecipe() {
    showLoader(true);
    const resultsDiv = document.getElementById('results');

    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/random.php`);
        const data = await response.json();
        renderRecipes(data.meals);
    } catch (error) {
        console.error(error);
        resultsDiv.innerHTML = "<p>Something went wrong! Try again later.</p>";
    }
    showLoader(false);
}

// Extract ingredients & measures from the recipe object
function getIngredientsList(meal) {
    let ingredients = "";
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== "") {
            ingredients += `<li>${ingredient} - ${measure}</li>`;
        }
    }
    return ingredients;
}

// Render fetched recipes into HTML
function renderRecipes(meals) {
    const resultsDiv = document.getElementById('results');

    if (!meals) {
        resultsDiv.innerHTML = "<p>No recipes found. Try a different search!</p>";
        return;
    }

    resultsDiv.innerHTML = "";
    meals.forEach(meal => {
        const shortInstructions = meal.strInstructions.substring(0, 200);
        const fullInstructions = meal.strInstructions;

        resultsDiv.innerHTML += `
            <div class="recipe-card">
                <h3>${meal.strMeal}</h3>
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">

                <p><strong>Category:</strong> ${meal.strCategory}</p>
                <p><strong>Origin:</strong> ${meal.strArea}</p>

                <h4>Ingredients:</h4>
                <ul>${getIngredientsList(meal)}</ul>

                <h4>Instructions:</h4>
                <p id="text-${meal.idMeal}" data-full="false">
                    ${shortInstructions}... 
                    <a href="#" onclick="toggleInstructions('${meal.idMeal}', \`${fullInstructions}\`); return false;">Show More</a>
                </p>

                ${meal.strYoutube 
                    ? `<p><a href="${meal.strYoutube}" target="_blank">▶️ Watch on YouTube</a></p>` 
                    : ""
                }

                <button onclick="saveToFavorites(${JSON.stringify(meal).replace(/"/g, '&quot;')})">💖 Save to Favorites</button>
            </div>
        `;
    });
}

// Toggle between showing full or short recipe instructions
function toggleInstructions(id, fullText) {
    const paragraph = document.getElementById(`text-${id}`);
    const isExpanded = paragraph.dataset.full === "true";

    if (isExpanded) {
        paragraph.innerHTML = `${fullText.substring(0, 200)}... <a href="#" onclick="toggleInstructions('${id}', \`${fullText}\`); return false;">Show More</a>`;
        paragraph.dataset.full = "false";
    } else {
        paragraph.innerHTML = `${fullText} <a href="#" onclick="toggleInstructions('${id}', \`${fullText}\`); return false;">Show Less</a>`;
        paragraph.dataset.full = "true";
    }
}

// Save selected recipe to favorites (localStorage)
function saveToFavorites(meal) {
    let favorites = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];

    if (favorites.some(item => item.idMeal === meal.idMeal)) {
        showToast(`${meal.strMeal} is already in your favorites!`);
        return;
    }

    favorites.push(meal);
    localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
    showToast(`${meal.strMeal} added to favorites!`);
}


// Show all saved favorite recipes
function showFavorites() {
    const saved = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
    const resultsDiv = document.getElementById('results');

    if (saved.length === 0) {
        resultsDiv.innerHTML = "<p>No favorites saved yet!</p>";
        return;
    }

    resultsDiv.innerHTML = "";
    saved.forEach(meal => {
        const shortInstructions = meal.strInstructions.substring(0, 200);
        const fullInstructions = meal.strInstructions;

        resultsDiv.innerHTML += `
            <div class="recipe-card">
                <h3>${meal.strMeal}</h3>
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">

                <p><strong>Category:</strong> ${meal.strCategory}</p>
                <p><strong>Origin:</strong> ${meal.strArea}</p>

                <h4>Ingredients:</h4>
                <ul>${getIngredientsList(meal)}</ul>

                <h4>Instructions:</h4>
                <p id="text-${meal.idMeal}" data-full="false">
                    ${shortInstructions}... 
                    <a href="#" onclick="toggleInstructions('${meal.idMeal}', \`${fullInstructions}\`); return false;">Show More</a>
                </p>

                ${meal.strYoutube 
                    ? `<p><a href="${meal.strYoutube}" target="_blank">▶️ Watch on YouTube</a></p>` 
                    : ""
                }

                <button onclick="removeFromFavorites('${meal.idMeal}')">🗑️ Remove from Favorites</button>
            </div>
        `;
    });
}

function removeFromFavorites(idMeal) {
    let favorites = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
    const updatedFavorites = favorites.filter(meal => meal.idMeal !== idMeal);

    localStorage.setItem('favoriteRecipes', JSON.stringify(updatedFavorites));
    showToast("Recipe removed from favorites!");

    showFavorites();
}

function clearAllFavorites() {
    localStorage.removeItem('favoriteRecipes');
    showToast("All favorites cleared!");
    showFavorites();
}


function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
