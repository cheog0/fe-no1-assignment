import { getTrendingMovies, searchMovies, getImageUrl } from "./api/api.js";
import { getFavorites, toggleFavorite } from "./utils/favorites.js";
import { setupCarousel } from "./components/carousel.js";
import { closeMovieModal, openMovieModal } from "./components/modal.js";
// DOM 요소 가져오기
const searchForm = document.querySelector(".movie-search-form");
const searchInput = searchForm.querySelector("input");
const searchResults = document.querySelector(".search-results");
const favoritesGrid = document.querySelector(".favorites-grid");
const popularMoviesSection = document.getElementById("popular-movies");

// 로컬 스토리지에서 즐겨찾기 가져오기
const favorites = getFavorites();
let trendingMovies = []; // 인기 영화 데이터를 저장할 변수

// 페이지 로드 시 실행
document.addEventListener("DOMContentLoaded", async () => {
  // 모달 컨테이너 추가
  createModalContainer();

  await loadTrendingMovies();
  renderFavorites();
  setupEventListeners();
});

// 모달 컨테이너 생성
function createModalContainer() {
  const modalContainer = document.createElement("div");
  modalContainer.id = "movie-modal-container";
  modalContainer.className = "modal-container";
  modalContainer.style.display = "none";

  document.body.appendChild(modalContainer);
}

// 인기 영화 데이터 로드
async function loadTrendingMovies() {
  // 기존 내용 제거
  const existingCarousel =
    popularMoviesSection.querySelector(".movie-carousel");
  if (existingCarousel) {
    existingCarousel.remove();
  }

  // 로딩 상태 표시
  const loadingEl = document.createElement("div");
  loadingEl.className = "loading";
  loadingEl.textContent = "영화 데이터를 불러오는 중...";
  popularMoviesSection.appendChild(loadingEl);

  try {
    trendingMovies = await getTrendingMovies();
    // 로딩 요소 제거
    const loadingElement = popularMoviesSection.querySelector(".loading");
    if (loadingElement) {
      loadingElement.remove();
    }
    renderPopularMovies();
  } catch (error) {
    console.error("영화 데이터를 불러오는 중 오류가 발생했습니다:", error);
    // 로딩 요소 제거
    const loadingElement = popularMoviesSection.querySelector(".loading");
    if (loadingElement) {
      loadingElement.remove();
    }

    const errorEl = document.createElement("div");
    errorEl.className = "error";
    errorEl.textContent = "영화 데이터를 불러오는 중 오류가 발생했습니다.";
    popularMoviesSection.appendChild(errorEl);
  }
}

// 인기 영화 렌더링 - 캐러셀 구조 완전히 재작성
function renderPopularMovies() {
  // 기존 내용 제거 (로딩 메시지나 에러 메시지 포함)
  const existingElements = popularMoviesSection.querySelectorAll(
    ".movie-carousel, .loading, .error"
  );
  existingElements.forEach((el) => el.remove());

  if (!trendingMovies || trendingMovies.length === 0) {
    const errorEl = document.createElement("div");
    errorEl.className = "error";
    errorEl.textContent = "표시할 영화가 없습니다.";
    popularMoviesSection.appendChild(errorEl);
    return;
  }

  // 새로운 캐러셀 구조 생성
  const carousel = document.createElement("div");
  carousel.className = "movie-carousel";
  carousel.innerHTML = `
    <div class="carousel-container">
      <div class="carousel-track" id="carousel-slides"></div>
    </div>
    <div class="carousel-buttons">
      <button id="btn-prev">←</button>
      <button id="btn-next">→</button>
    </div>
  `;
  popularMoviesSection.appendChild(carousel);

  const carouselTrack = carousel.querySelector(".carousel-track");

  // 영화 카드 추가
  trendingMovies.forEach((movie) => {
    const isFavorite = favorites.some((fav) => fav.id === movie.id);
    const movieCard = createMovieCard(movie, isFavorite);
    carouselTrack.appendChild(movieCard);
  });

  // 캐러셀 기능 설정
  setupCarousel(carousel, trendingMovies);
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

  // 출시 연도 추출
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "미정";

  card.innerHTML = `
    <img src="${getImageUrl(movie.poster_path)}" alt="${
    movie.title
  } 포스터" class="movie-poster">
    <div class="movie-info">
      <h3 class="movie-title">${movie.title}</h3>
      <div class="movie-rating">
        ⭐ ${
          movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"
        } | ${releaseYear}
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
    toggleFavorite(movie, favorites);
  });

  // 카드 클릭 시 상세 정보 모달 표시
  card.addEventListener("click", () => {
    openMovieModal(movie.id);
  });

  return card;
}

// ESC 키 누르면 모달 닫기
function handleEscKeyPress(e) {
  if (e.key === "Escape") {
    closeMovieModal();
  }
}

// 검색 기능 설정
function setupEventListeners() {
  // 검색 폼 제출 이벤트
  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();

    if (query.length === 0) {
      searchResults.innerHTML = "";
      return;
    }

    await performSearch(query);
  });
}

// 검색 실행 함수
async function performSearch(query) {
  // 로딩 상태 표시
  searchResults.innerHTML = '<div class="loading">검색 중...</div>';

  try {
    const results = await searchMovies(query);
    displaySearchResults(results);
  } catch (error) {
    console.error("영화 검색 중 오류가 발생했습니다:", error);
    searchResults.innerHTML =
      '<div class="error">검색 중 오류가 발생했습니다.</div>';
  }
  document.addEventListener("click", (e) => {
    const searchForm = document.querySelector(".movie-search-form");
    const searchResults = document.querySelector(".search-results");

    if (searchForm.contains(e.target)) return; // 클릭한 게 검색창 내부면 무시
    searchResults.innerHTML = ""; // 바깥 클릭하면 초기화
  });
}

// 검색 결과 표시
function displaySearchResults(results) {
  searchResults.innerHTML = "";

  if (!results || results.length === 0) {
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
    const card = createMovieCard(movie, isFavorite); //카드 기반 ui
    card.classList.add("search-result-card");
    resultsContainer.appendChild(card);
  });

  searchResults.appendChild(resultsContainer);
}

// CSS 스타일 추가 (검색 결과)
const style = document.createElement("style");
style.textContent = `
  .results-container {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-top: 1.5rem;
    justify-content: flex-start;
 }
  .search-result-card {
    flex: 0 0 auto !important;
    width: 180px !important;
  }

  .no-results {
    text-align: center;
    padding: 2rem;
    color: #aaa;
    font-size: 1.1rem;
  }

  .toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 24px;
    border-radius: 4px;
    z-index: 1000;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .modal-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 20px;
    overflow-y: auto;
  }

  .modal-content {
    position: relative;
    width: 100%;
    max-width: 900px;
    background-color: var(--dark-bg);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }

  .modal-loading {
    padding: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .modal-header {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 10;
    padding: 15px;
  }

  .modal-close-btn {
    background: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color var(--transition-speed);
  }

  .modal-close-btn:hover {
    background-color: var(--primary-color);
  }

  .modal-backdrop {
    height: 300px;
    background-size: cover;
    background-position: center;
    position: relative;
  }

  .modal-backdrop-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(20, 20, 20, 0.5) 0%, var(--dark-bg) 100%);
  }

  .modal-body {
    padding: 0 30px 30px;
    display: flex;
    flex-wrap: wrap;
    gap: 30px;
    position: relative;
    margin-top: -150px;
  }

  .modal-poster {
    flex: 0 0 200px;
  }

  .modal-poster img {
    width: 100%;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  }

  .modal-info {
    flex: 1;
    min-width: 300px;
  }

  .modal-title {
    font-size: 2rem;
    margin-bottom: 10px;
    color: white;
  }

  .modal-meta {
    display: flex;
    gap: 15px;
    margin-bottom: 15px;
    color: #aaa;
  }

  .modal-genres {
    margin-bottom: 20px;
    color: var(--primary-color);
    font-weight: 500;
  }

  .modal-overview {
    margin-bottom: 20px;
  }

  .modal-overview h3 {
    font-size: 1.2rem;
    margin-bottom: 10px;
    color: #ddd;
  }

  .modal-overview p {
    line-height: 1.6;
    color: #bbb;
  }

  .modal-credits {
    margin-bottom: 20px;
    color: #aaa;
  }

  .modal-credits p {
    margin-bottom: 5px;
  }

  .modal-trailer {
    margin-top: 20px;
  }

  .trailer-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background-color: var(--primary-color);
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: 500;
    transition: background-color var(--transition-speed);
  }

  .trailer-btn:hover {
    background-color: #ff0a16;
  }

  @media (max-width: 768px) {
    .modal-body {
      flex-direction: column;
      margin-top: -100px;
    }

    .modal-poster {
      flex: 0 0 auto;
      width: 180px;
      margin: 0 auto;
    }

    .modal-title {
      font-size: 1.5rem;
    }
  }
`;
document.head.appendChild(style);
export { renderPopularMovies, renderFavorites };
