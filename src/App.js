import React, { useState, useEffect } from "react";
import "./App.css";

const baseUrl = "https://www.themealdb.com/api/json/v1/1/";
const mealsPerPage = 20;

function App() {
  const [meals, setMeals] = useState([]);
  const [displayedMeals, setDisplayedMeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [filter, setFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchAllMeals() {
      try {
        const catRes = await fetch(`${baseUrl}categories.php`);
        const catData = await catRes.json();
        const cats = catData.categories.map(c => c.strCategory);
        setCategories(cats);

        const allMeals = [];
        for (let cat of cats) {
          const res = await fetch(`${baseUrl}filter.php?c=${cat}`);
          const data = await res.json();
          if (data.meals) {
            const mealsWithCat = data.meals.map(meal => ({
              ...meal,
              strCategory: cat
            }));
            allMeals.push(...mealsWithCat);
          }
        }
        setMeals(allMeals);
      } catch (err) {
        console.error("Error fetching meals:", err);
      }
    }

    fetchAllMeals();
  }, []);

  useEffect(() => {
    let filtered = meals;

    if (filter !== "All") {
      filtered = filtered.filter(meal => meal.strCategory === filter);
    }

    if (searchTerm) {
      filtered = filtered.filter(meal =>
        meal.strMeal.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const start = (currentPage - 1) * mealsPerPage;
    const end = currentPage * mealsPerPage;
    setDisplayedMeals(filtered.slice(start, end));
  }, [meals, filter, searchTerm, currentPage]);

  async function fetchMealDetails(id) {
    const res = await fetch(`${baseUrl}lookup.php?i=${id}`);
    const data = await res.json();
    setSelectedMeal(data.meals[0]);
    window.scrollTo(0, 0);
  }

  function handleSearch(e) {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
    setSelectedMeal(null);
  }

  function handleFilterChange(e) {
    setFilter(e.target.value);
    setCurrentPage(1);
    setSelectedMeal(null);
  }

  function prevPage() {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  }

  function nextPage() {
    const totalPages = Math.ceil(
      (filter === "All"
        ? meals.length
        : meals.filter(meal => meal.strCategory === filter).length) /
        mealsPerPage
    );
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  }

  return (
    <div>
      <header id="header">
        <h1 id="logo">Recipe Explorer</h1>
        <nav id="nav">
          <div id="form">
            <input
              type="text"
              id="search"
              placeholder="Search for a meal..."
              value={searchTerm}
              onChange={handleSearch}
              autoComplete="off"
            />
            <button onClick={() => setCurrentPage(1)}>Search</button>
            <select value={filter} onChange={handleFilterChange}>
              <option value="All">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </nav>
      </header>

      <main id="main" className={selectedMeal ? "full" : ""}>
        {selectedMeal ? (
          <div className="meal-details">
            <h2>{selectedMeal.strMeal}</h2>
            <img src={selectedMeal.strMealThumb} alt={selectedMeal.strMeal} />
            <h3>Ingredients:</h3>
            <ul>
              {Array.from({ length: 20 }).map((_, i) => {
                const ingredient = selectedMeal[`strIngredient${i + 1}`];
                const measure = selectedMeal[`strMeasure${i + 1}`];
                if (ingredient && ingredient.trim() !== "")
                  return <li key={i}>{ingredient} - {measure}</li>;
                return null;
              })}
            </ul>
            <h3>Instructions:</h3>
            <p>{selectedMeal.strInstructions}</p>
          </div>
        ) : (
          displayedMeals.map(meal => (
            <div
              className="meal-card"
              key={meal.idMeal}
              onClick={() => fetchMealDetails(meal.idMeal)}
            >
              <img src={meal.strMealThumb} alt={meal.strMeal} />
              <h3>{meal.strMeal}</h3>
            </div>
          ))
        )}
      </main>

      {!selectedMeal && (
        <div id="pagination">
          <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
          <span id="pageNumber">
            Page {currentPage} of {Math.ceil(
              (filter === "All"
                ? meals.length
                : meals.filter(meal => meal.strCategory === filter).length) /
              mealsPerPage
            )}
          </span>
          <button onClick={nextPage} disabled={currentPage === Math.ceil(
            (filter === "All"
              ? meals.length
              : meals.filter(meal => meal.strCategory === filter).length) /
            mealsPerPage
          )}>Next</button>
        </div>
      )}
    </div>
  );
}

export default App;
