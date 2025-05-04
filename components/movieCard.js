import { getImageUrl } from "../api/api.js";
import { toggleFavorite } from "../utils/favorites.js";
import { showToast } from "../utils/toasts.js";

// 영화 카드 생성 함수
export function createMovieCard(
  movie,
  isFavorite,
  favorites,
  onFavoriteChange,
  openMovieModal
) {
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
    toggleFavorite(movie, favorites, showToast);
    if (onFavoriteChange) onFavoriteChange();
  });

  // 카드 클릭 시 상세 정보 모달 표시
  card.addEventListener("click", () => {
    openMovieModal(movie.id);
  });

  return card;
}

// 영화 카드 스타일 추가
export function addMovieCardStyles() {
  const style = document.createElement("style");
  style.textContent = `
    /* 영화 카드 스타일 */
    .movie-card {
      flex: 0 0 auto;
      width: 200px;
      height: 300px;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      transition: transform var(--transition-speed);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
      cursor: pointer;
    }
    
    .movie-card:hover {
      transform: translateY(-10px) scale(1.03);
      z-index: 5;
    }
    
    .movie-poster {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: filter var(--transition-speed);
    }
    
    .movie-card:hover .movie-poster {
      filter: brightness(0.7);
    }
    
    .movie-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1rem;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.8) 50%, rgba(0, 0, 0, 0.9));
      transform: translateY(100%);
      transition: transform var(--transition-speed);
    }
    
    .movie-card:hover .movie-info {
      transform: translateY(0);
    }
    
    .movie-title {
      font-size: 1rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    
    .movie-rating {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.9rem;
    }
    
    .favorite-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.6);
      border: none;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transition: opacity var(--transition-speed), background-color var(--transition-speed);
      z-index: 10;
    }
    
    .movie-card:hover .favorite-btn {
      opacity: 1;
    }
    
    .favorite-btn:hover {
      background-color: var(--primary-color);
    }
  `;
  document.head.appendChild(style);
}

// 검색 결과 아이템 생성 함수
export function createSearchResultItem(
  movie,
  isFavorite,
  favorites,
  onFavoriteChange,
  openMovieModal
) {
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "미정";

  const resultItem = document.createElement("div");
  resultItem.className = "result-item";
  resultItem.innerHTML = `
    <img src="${getImageUrl(movie.poster_path)}" alt="${
    movie.title
  }" class="result-poster">
    <div class="result-info">
      <h3>${movie.title}</h3>
      <p>⭐ ${
        movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"
      } | ${releaseYear}</p>
    </div>
    <button class="result-favorite-btn" data-id="${movie.id}">
      ${isFavorite ? "❤️" : "🤍"}
    </button>
  `;

  // 즐겨찾기 버튼 이벤트 리스너
  const favoriteBtn = resultItem.querySelector(".result-favorite-btn");
  favoriteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFavorite(movie, favorites, showToast);
    if (onFavoriteChange) onFavoriteChange();
  });

  // 검색 결과 클릭 시 상세 정보 모달 표시
  resultItem.addEventListener("click", () => {
    openMovieModal(movie.id);
  });

  return resultItem;
}
