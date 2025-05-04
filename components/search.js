import { searchMovies } from "../api/api.js";
import { createSearchResultItem } from "./movieCard.js";

// 검색 기능 설정
export function setupSearch(
  searchForm,
  searchInput,
  searchResults,
  favorites,
  onFavoriteChange,
  openMovieModal
) {
  // 검색 폼 제출 이벤트
  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();

    if (query.length === 0) {
      searchResults.innerHTML = "";
      return;
    }

    await performSearch(
      query,
      searchResults,
      favorites,
      onFavoriteChange,
      openMovieModal
    );
  });

  // 검색어 입력 이벤트 (실시간 검색)
  let debounceTimer;
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim();

    if (query.length === 0) {
      searchResults.innerHTML = "";
      return;
    }

    // 디바운스 처리 (타이핑 중지 후 500ms 후에 검색 실행)
    clearTimeout(debounceTimer);
    if (query.length >= 2) {
      debounceTimer = setTimeout(() => {
        performSearch(
          query,
          searchResults,
          favorites,
          onFavoriteChange,
          openMovieModal
        );
      }, 500);
    }
  });

  // 검색창 외부 클릭 시 결과 숨기기
  document.addEventListener("click", (e) => {
    if (searchForm.contains(e.target)) return; // 클릭한 게 검색창 내부면 무시
    searchResults.innerHTML = ""; // 바깥 클릭하면 초기화
  });
}

// 검색 실행 함수
async function performSearch(
  query,
  searchResults,
  favorites,
  onFavoriteChange,
  openMovieModal
) {
  // 로딩 상태 표시
  searchResults.innerHTML = '<div class="loading">검색 중...</div>';

  try {
    const results = await searchMovies(query);
    displaySearchResults(
      results,
      searchResults,
      favorites,
      onFavoriteChange,
      openMovieModal
    );
  } catch (error) {
    console.error("영화 검색 중 오류가 발생했습니다:", error);
    searchResults.innerHTML =
      '<div class="error">검색 중 오류가 발생했습니다.</div>';
  }
}

// 검색 결과 표시
function displaySearchResults(
  results,
  searchResults,
  favorites,
  onFavoriteChange,
  openMovieModal
) {
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
    const resultItem = createSearchResultItem(
      movie,
      isFavorite,
      favorites,
      onFavoriteChange,
      openMovieModal
    );
    resultsContainer.appendChild(resultItem);
  });

  searchResults.appendChild(resultsContainer);
}

// 검색 결과 스타일 추가
export function addSearchStyles() {
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
      cursor: pointer;
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
