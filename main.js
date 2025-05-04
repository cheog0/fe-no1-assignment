import { getTrendingMovies } from "./api/api.js";
import { getFavorites } from "./utils/favorites.js";
import {
  createModalContainer,
  openMovieModal,
  addModalStyles,
} from "./components/modal.js";
import { addMovieCardStyles } from "./components/movieCard.js";
import { setupSearch, addSearchStyles } from "./components/search.js";
import {
  renderPopularMovies,
  renderFavorites,
  addCommonStyles,
} from "./components/render.js";
import { addCarouselStyles } from "./components/carousel.js";

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
  // 스타일 추가
  addCommonStyles();
  addMovieCardStyles();
  addCarouselStyles();
  addModalStyles();
  addSearchStyles();

  // 모달 컨테이너 추가
  createModalContainer();

  // 인기 영화 로드
  await loadTrendingMovies();

  // 즐겨찾기 렌더링
  renderFavorites(
    favoritesGrid,
    favorites,
    handleFavoriteChange,
    openMovieModal
  );

  // 검색 기능 설정
  setupSearch(
    searchForm,
    searchInput,
    searchResults,
    favorites,
    handleFavoriteChange,
    openMovieModal
  );
});

// 즐겨찾기 변경 처리 함수
function handleFavoriteChange() {
  renderFavorites(
    favoritesGrid,
    favorites,
    handleFavoriteChange,
    openMovieModal
  );
  renderPopularMovies(
    popularMoviesSection,
    trendingMovies,
    favorites,
    handleFavoriteChange,
    openMovieModal
  );

  // 검색 결과 섹션이 있으면 업데이트
  const searchSection = document.getElementById("search-results-section");
  if (searchSection) {
    const carouselTrack = searchSection.querySelector(".carousel-track");
    if (carouselTrack) {
      // 모든 영화 카드의 즐겨찾기 상태 업데이트
      const movieCards = carouselTrack.querySelectorAll(".movie-card");
      movieCards.forEach((card) => {
        const movieId = Number.parseInt(card.dataset.id);
        const isFavorite = favorites.some((fav) => fav.id === movieId);
        const favoriteBtn = card.querySelector(".favorite-btn");
        if (favoriteBtn) {
          favoriteBtn.innerHTML = isFavorite ? "❤️" : "🤍";
        }
      });
    }
  }
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
    renderPopularMovies(
      popularMoviesSection,
      trendingMovies,
      favorites,
      handleFavoriteChange,
      openMovieModal
    );
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
