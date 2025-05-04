import { createMovieCard } from "./movieCard.js";
import { setupCarousel } from "./carousel.js";

// 인기 영화 렌더링
export function renderPopularMovies(
  popularMoviesSection,
  trendingMovies,
  favorites,
  onFavoriteChange,
  openMovieModal
) {
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
    const movieCard = createMovieCard(
      movie,
      isFavorite,
      favorites,
      onFavoriteChange,
      openMovieModal
    );
    carouselTrack.appendChild(movieCard);
  });

  // 캐러셀 기능 설정
  setupCarousel(carousel, trendingMovies);
}

// 즐겨찾기 영화 렌더링
export function renderFavorites(
  favoritesGrid,
  favorites,
  onFavoriteChange,
  openMovieModal
) {
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
    const movieCard = createMovieCard(
      movie,
      true,
      favorites,
      onFavoriteChange,
      openMovieModal
    );
    favoritesGrid.appendChild(movieCard);
  });
}

// 공통 스타일 추가
export function addCommonStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .loading,
    .error {
      padding: 2rem;
      text-align: center;
      background-color: var(--dark-gray);
      border-radius: 8px;
      margin: 1rem 0;
    }
    
    .loading {
      color: var(--secondary-color);
    }
    
    .error {
      color: var(--primary-color);
    }
    
    /* 빈 즐겨찾기 상태 */
    .empty-favorites {
      text-align: center;
      padding: 3rem;
      background-color: var(--dark-gray);
      border-radius: 8px;
      color: var(--light-gray);
    }
  `;
  document.head.appendChild(style);
}
