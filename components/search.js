import { searchMovies } from "../api/api.js";
import { createMovieCard } from "./movieCard.js";
import { setupCarousel } from "./carousel.js";

// 검색 기능 설정
export function setupSearch(
  searchForm,
  searchInput,
  searchResults,
  favorites,
  onFavoriteChange,
  openMovieModal
) {
  // 검색 폼 제출 이벤트 (엔터키 또는 버튼 클릭)
  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();

    if (query.length === 0) {
      hideSearchResults(searchResults);
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

  // ESC 키 누르면 검색 결과 닫기
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideSearchResults(searchResults);
    }
  });
}

// 검색 결과 숨기기
function hideSearchResults(searchResults) {
  const searchSection = document.querySelector(".search-results-section");
  if (searchSection) {
    searchSection.remove();
  }
}

// 검색 실행 함수
async function performSearch(
  query,
  searchResults,
  favorites,
  onFavoriteChange,
  openMovieModal
) {
  // 기존 검색 결과 제거
  hideSearchResults(searchResults);

  // 로딩 상태 표시
  const loadingEl = document.createElement("div");
  loadingEl.className = "loading";
  loadingEl.textContent = "검색 중...";
  searchResults.appendChild(loadingEl);

  try {
    const results = await searchMovies(query);
    displaySearchResults(
      query,
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

// 검색 결과 표시 - 인기작 섹션과 유사한 형태로 변경
function displaySearchResults(
  query,
  results,
  searchResults,
  favorites,
  onFavoriteChange,
  openMovieModal
) {
  // 로딩 메시지 제거
  searchResults.innerHTML = "";

  if (!results || results.length === 0) {
    searchResults.innerHTML = `
      <div class="no-results">
        <p>검색 결과가 없습니다.</p>
      </div>
    `;
    return;
  }

  // 검색 결과 섹션 생성
  const searchSection = document.createElement("section");
  searchSection.className = "search-results-section";
  searchSection.id = "search-results-section";

  // 검색 결과 제목 추가 (인기작 섹션과 유사한 스타일)
  const sectionTitle = document.createElement("h2");
  sectionTitle.className = "section-title";
  sectionTitle.innerHTML = `"${query}" <span class="highlight">검색 결과</span>`;
  searchSection.appendChild(sectionTitle);

  // 캐러셀 구조 생성
  const carousel = document.createElement("div");
  carousel.className = "movie-carousel";
  carousel.innerHTML = `
    <div class="carousel-container">
      <div class="carousel-track" id="search-carousel-slides"></div>
    </div>
    <div class="carousel-buttons">
      <button id="search-btn-prev">←</button>
      <button id="search-btn-next">→</button>
    </div>
  `;
  searchSection.appendChild(carousel);

  // 검색 결과 섹션을 인기작 섹션 위에 삽입
  const popularMoviesSection = document.getElementById("popular-movies");
  popularMoviesSection.parentNode.insertBefore(
    searchSection,
    popularMoviesSection
  );

  const carouselTrack = carousel.querySelector(".carousel-track");

  // 영화 카드 추가
  results.forEach((movie) => {
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
  setupCarousel(carousel, results);

  // 검색 결과 섹션으로 스크롤
  searchSection.scrollIntoView({ behavior: "smooth" });
}

// 검색 결과 스타일 추가
export function addSearchStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .search-results-section {
      margin: 2rem 0;
      animation: fadeIn 0.5s ease;
    }
    
    .no-results {
      padding: 2rem;
      text-align: center;
      background-color: var(--dark-gray);
      border-radius: 8px;
      color: var(--light-gray);
      margin: 1rem 0;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}
