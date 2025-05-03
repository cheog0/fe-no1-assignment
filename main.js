// 영화 데이터 (실제로는 API에서 가져올 데이터)
const movieData = [
  {
    id: 1,
    title: "인셉션",
    poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    rating: 8.8,
    year: 2010,
  },
  {
    id: 2,
    title: "인터스텔라",
    poster: "https://image.tmdb.org/t/p/w500/7AGm6eoYh58OcDsxcbIE9MhKJsT.jpg",
    rating: 8.6,
    year: 2014,
  },
  {
    id: 3,
    title: "어벤져스: 엔드게임",
    poster: "https://image.tmdb.org/t/p/w500/n78LK2t1uQP68Ud0VXHRe0HmKOp.jpg",
    rating: 8.4,
    year: 2019,
  },
  {
    id: 4,
    title: "기생충",
    poster: "https://image.tmdb.org/t/p/w500/igw938inb6Fy0YVcwIyxQ7Lu5FO.jpg",
    rating: 8.5,
    year: 2019,
  },
  {
    id: 5,
    title: "조커",
    poster: "https://image.tmdb.org/t/p/w500/wrCwH6WOvXQvVuqcKNUrLDCDxdw.jpg",
    rating: 8.2,
    year: 2019,
  },
  {
    id: 6,
    title: "매트릭스",
    poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    rating: 8.7,
    year: 1999,
  },
  {
    id: 7,
    title: "다크 나이트",
    poster: "https://image.tmdb.org/t/p/w500/1hRoyzDtpgMU7Dz4JF22RANzQO7.jpg",
    rating: 9.0,
    year: 2008,
  },
  {
    id: 8,
    title: "어바웃 타임",
    poster: "https://image.tmdb.org/t/p/w500/3Mz2CK79EnQiNe9XUhQnNNm9qR4.jpg",
    rating: 8.3,
    year: 2013,
  },
];

// DOM 요소 가져오기
const carouselTrack = document.getElementById("carousel-slides");
const prevButton = document.getElementById("btn-prev");
const nextButton = document.getElementById("btn-next");
const searchForm = document.querySelector(".movie-search-form");
const searchInput = searchForm.querySelector("input");
const searchResults = document.querySelector(".search-results");
const favoritesGrid = document.querySelector(".favorites-grid");

// 로컬 스토리지에서 즐겨찾기 가져오기
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// 페이지 로드 시 실행
document.addEventListener("DOMContentLoaded", () => {
  renderPopularMovies();
  renderFavorites();
  setupCarousel();
  setupEventListeners();
});

// 인기 영화 렌더링
function renderPopularMovies() {
  carouselTrack.innerHTML = "";

  movieData.forEach((movie) => {
    const isFavorite = favorites.some((fav) => fav.id === movie.id);
    const movieCard = createMovieCard(movie, isFavorite);
    carouselTrack.appendChild(movieCard);
  });
}

// 즐겨찾기 영화 렌더링
function renderFavorites() {
  favoritesGrid.innerHTML = "";

  if (favorites.length === 0) {
    favoritesGrid.innerHTML = `
        <div class="empty-favorites">
          <p>아직 찜한 영화가 없습니다.</p>
          <p>마음에 드는 영화를 찜해보세요!</p>
        </div>
      `;
    return;
  }

  favorites.forEach((movie) => {
    const movieCard = createMovieCard(movie, true);
    favoritesGrid.appendChild(movieCard);
  });
}

// 영화 카드 생성 함수
function createMovieCard(movie, isFavorite) {
  const card = document.createElement("div");
  card.className = "movie-card";
  card.dataset.id = movie.id;

  card.innerHTML = `
      <img src="${movie.poster}" alt="${
    movie.title
  } 포스터" class="movie-poster">
      <div class="movie-info">
        <h3 class="movie-title">${movie.title}</h3>
        <div class="movie-rating">
          ⭐ ${movie.rating} | ${movie.year}
        </div>
      </div>
      <button class="favorite-btn" data-id="${movie.id}">
        ${isFavorite ? "❤️" : "🤍"}
      </button>
    `;

  // 즐겨찾기 버튼 이벤트 리스너
  const favoriteBtn = card.querySelector(".favorite-btn");
  favoriteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFavorite(movie);
  });

  return card;
}

// 즐겨찾기 토글 함수
function toggleFavorite(movie) {
  const index = favorites.findIndex((fav) => fav.id === movie.id);

  if (index === -1) {
    // 즐겨찾기에 추가
    favorites.push(movie);
    showToast(`"${movie.title}" 영화를 찜했습니다!`);
  } else {
    // 즐겨찾기에서 제거
    favorites.splice(index, 1);
    showToast(`"${movie.title}" 영화를 찜 목록에서 제거했습니다.`);
  }

  // 로컬 스토리지 업데이트
  localStorage.setItem("favorites", JSON.stringify(favorites));

  // UI 업데이트
  renderPopularMovies();
  renderFavorites();
}

// 토스트 메시지 표시 함수
function showToast(message) {
  // 이미 있는 토스트 제거
  const existingToast = document.querySelector(".toast");
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  // 토스트 스타일
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  toast.style.color = "white";
  toast.style.padding = "12px 24px";
  toast.style.borderRadius = "4px";
  toast.style.zIndex = "1000";
  toast.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";

  document.body.appendChild(toast);

  // 3초 후 토스트 제거
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.5s ease";
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// 캐러셀 설정
function setupCarousel() {
  let position = 0;
  const cardWidth = 200 + 16; // 카드 너비 + 마진
  const visibleCards = Math.floor(carouselTrack.clientWidth / cardWidth);
  const maxPosition = (movieData.length - visibleCards) * cardWidth;

  // 이전 버튼 클릭 이벤트
  prevButton.addEventListener("click", () => {
    if (position > 0) {
      position -= cardWidth;
      updateCarouselPosition();
    }
  });

  // 다음 버튼 클릭 이벤트
  nextButton.addEventListener("click", () => {
    if (position < maxPosition) {
      position += cardWidth;
      updateCarouselPosition();
    }
  });

  // 캐러셀 위치 업데이트
  function updateCarouselPosition() {
    carouselTrack.style.transform = `translateX(-${position}px)`;
  }

  // 윈도우 리사이즈 시 캐러셀 조정
  window.addEventListener("resize", () => {
    position = 0;
    updateCarouselPosition();
  });
}

// 검색 기능 설정
function setupEventListeners() {
  // 검색 폼 제출 이벤트
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput.value.trim().toLowerCase();

    if (query.length === 0) {
      searchResults.innerHTML = "";
      return;
    }

    const results = movieData.filter((movie) =>
      movie.title.toLowerCase().includes(query)
    );

    displaySearchResults(results);
  });

  // 검색어 입력 이벤트 (실시간 검색)
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();

    if (query.length === 0) {
      searchResults.innerHTML = "";
      return;
    }

    if (query.length >= 2) {
      const results = movieData.filter((movie) =>
        movie.title.toLowerCase().includes(query)
      );

      displaySearchResults(results);
    }
  });
}

// 검색 결과 표시
function displaySearchResults(results) {
  searchResults.innerHTML = "";

  if (results.length === 0) {
    searchResults.innerHTML = `
        <div class="no-results">
          <p>검색 결과가 없습니다.</p>
        </div>
      `;
    return;
  }

  const resultsContainer = document.createElement("div");
  resultsContainer.className = "results-container";

  results.forEach((movie) => {
    const isFavorite = favorites.some((fav) => fav.id === movie.id);

    const resultItem = document.createElement("div");
    resultItem.className = "result-item";
    resultItem.innerHTML = `
        <img src="${movie.poster}" alt="${movie.title}" class="result-poster">
        <div class="result-info">
          <h3>${movie.title}</h3>
          <p>⭐ ${movie.rating} | ${movie.year}</p>
        </div>
        <button class="result-favorite-btn" data-id="${movie.id}">
          ${isFavorite ? "❤️" : "🤍"}
        </button>
      `;

    // 즐겨찾기 버튼 이벤트 리스너
    const favoriteBtn = resultItem.querySelector(".result-favorite-btn");
    favoriteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(movie);
    });

    resultsContainer.appendChild(resultItem);
  });

  searchResults.appendChild(resultsContainer);

  // 검색 결과 스타일 추가
  const style = document.createElement("style");
  style.textContent = `
      .results-container {
        background-color: var(--dark-gray);
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      }
      
      .result-item {
        display: flex;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #333;
        transition: background-color var(--transition-speed);
      }
      
      .result-item:last-child {
        border-bottom: none;
      }
      
      .result-item:hover {
        background-color: #333;
      }
      
      .result-poster {
        width: 50px;
        height: 75px;
        object-fit: cover;
        border-radius: 4px;
        margin-right: 15px;
      }
      
      .result-info {
        flex: 1;
      }
      
      .result-info h3 {
        font-size: 1rem;
        margin-bottom: 5px;
      }
      
      .result-info p {
        font-size: 0.8rem;
        color: #aaa;
      }
      
      .result-favorite-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.2rem;
      }
      
      .no-results {
        padding: 20px;
        text-align: center;
        color: #aaa;
      }
    `;

  document.head.appendChild(style);
}
