import React, { useEffect, useState } from "react";
import "./App.css";

const apiKey = process.env.REACT_APP_TMDB_API_KEY;
const baseUrl = "https://api.themoviedb.org/3";
const imgPath = "https://image.tmdb.org/t/p/w1280";
const popularApi = `${baseUrl}/movie/popular?api_key=${apiKey}`;
const searchApi = `${baseUrl}/search/movie?api_key=${apiKey}&query=`;

function App() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortValue, setSortValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastUrl, setLastUrl] = useState(popularApi);

  useEffect(() => {getMovies(popularApi, 1);}, []);

  async function getMovies(url, page = 1) {
    try {
      const res = await fetch(`${url}&page=${page}`);
      const data = await res.json();

      setMovies(data.results || []);
      setCurrentPage(data.page);
      setTotalPages(data.total_pages);
      setLastUrl(url);
    } catch (err) {
      console.error("Error fetching movies:", err);
    }
  }

  function handleSearch(e) {
    const value = e.target.value;
    setSearchTerm(value);

    if (value) {
      getMovies(searchApi + encodeURIComponent(value), 1);
    } else {
      getMovies(popularApi, 1);
    }
  }

  function handleSort(e) {
    const value = e.target.value;
    setSortValue(value);

    if (value) {
      getMovies(`${baseUrl}/discover/movie?api_key=${apiKey}&sort_by=${value}`, 1);
    } else {
      getMovies(popularApi, 1);
    }
  }

  function prevPage() {if (currentPage > 1) getMovies(lastUrl, currentPage - 1);}
  function nextPage() {if (currentPage < totalPages) getMovies(lastUrl, currentPage + 1);}

  return (
    <div>
      <header id="header">
        <h1 id="logo">Movie Explorer</h1>

        <nav id="nav">
          <form id="form" onSubmit={(e) => e.preventDefault()}>
            <input type="text" id="search" placeholder="Search for a movie..." value={searchTerm} onChange={handleSearch} autoComplete="off"/>
          </form>

          <select id="sort" value={sortValue} onChange={handleSort}>
            <option value="">Sort By</option>
            <option value="primary_release_date.asc">Release Date (Asc)</option>
            <option value="primary_release_date.desc">Release Date (Desc)</option>
            <option value="vote_average.asc">Rating (Asc)</option>
            <option value="vote_average.desc">Rating (Desc)</option>
          </select>
        </nav>
      </header>

      <main id="main">
        {movies.map((movie, index) => (
          <div className="movie" key={index}>
            <div className="poster">
              <img src={imgPath + movie.poster_path} alt={movie.title}/>
            </div>
            <div className="movieInfo">
              <h2>{movie.title}</h2>
              <p>Release Date: {movie.release_date}</p>
              <span>Rating: {movie.vote_average}</span>
            </div>
          </div>
        ))}
      </main>

      <div id="pagination">
        <button id="prev" onClick={prevPage} disabled={currentPage === 1}>Previous</button>
        <span id="pageNumber">Page {currentPage} of {totalPages}</span>
        <button id="next" onClick={nextPage} disabled={currentPage === totalPages}>Next</button>
      </div>
    </div>
  );
}

export default App;
