import {
  getTrendingMovies,
  searchMovies,
  getMovieDetails,
  getImageUrl,
  getBackdropUrl,
} from "./api/api.js";

// DOM 요소 가져오기
const searchForm = document.querySelector(".movie-search-form");
const searchInput = searchForm.querySelector("input");
const searchResults = document.querySelector(".search-results");
const favoritesGrid = document.querySelector(".favorites-grid");
const popularMoviesSection = document.getElementById("popular-movies");

// 로컬 스토리지에서 즐겨찾기 가져오기
const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
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
  setupCarousel(carousel);
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
    toggleFavorite(movie);
  });

  // 카드 클릭 시 상세 정보 모달 표시
  card.addEventListener("click", () => {
    openMovieModal(movie.id);
  });

  return card;
}

// 영화 상세 정보 모달 열기
async function openMovieModal(movieId) {
  const modalContainer = document.getElementById("movie-modal-container");

  // 로딩 상태 표시
  modalContainer.innerHTML = `
    <div class="modal-content modal-loading">
      <div class="loading">영화 상세 정보를 불러오는 중...</div>
    </div>
  `;
  modalContainer.style.display = "flex";

  try {
    // 영화 상세 정보 가져오기
    const movieDetails = await getMovieDetails(movieId);

    // 장르 목록 생성
    const genres = movieDetails.genres.map((genre) => genre.name).join(", ");

    // 출연진 목록 (최대 5명)
    const cast = movieDetails.credits?.cast || [];
    const castList = cast
      .slice(0, 5)
      .map((actor) => actor.name)
      .join(", ");

    // 감독 찾기
    const director = movieDetails.credits?.crew.find(
      (person) => person.job === "Director"
    );
    const directorName = director ? director.name : "정보 없음";

    // 예고편 키 찾기
    const trailer = movieDetails.videos?.results.find(
      (video) => video.type === "Trailer" && video.site === "YouTube"
    );

    // 모달 내용 업데이트
    modalContainer.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-backdrop" style="background-image: url('${getBackdropUrl(
          movieDetails.backdrop_path
        )}')">
          <div class="modal-backdrop-overlay"></div>
        </div>
        <div class="modal-body">
          <div class="modal-poster">
            <img src="${getImageUrl(movieDetails.poster_path)}" alt="${
      movieDetails.title
    } 포스터">
          </div>
          <div class="modal-info">
            <h2 class="modal-title">${movieDetails.title}</h2>
            <div class="modal-meta">
              <span class="modal-year">${
                movieDetails.release_date
                  ? new Date(movieDetails.release_date).getFullYear()
                  : "미정"
              }</span>
              <span class="modal-rating">⭐ ${
                movieDetails.vote_average
                  ? movieDetails.vote_average.toFixed(1)
                  : "N/A"
              }</span>
              <span class="modal-runtime">${
                movieDetails.runtime ? `${movieDetails.runtime}분` : ""
              }</span>
            </div>
            <div class="modal-genres">${genres}</div>
            <div class="modal-overview">
              <h3>줄거리</h3>
              <p>${movieDetails.overview || "줄거리 정보가 없습니다."}</p>
            </div>
            <div class="modal-credits">
              <p><strong>감독:</strong> ${directorName}</p>
              <p><strong>출연:</strong> ${castList || "정보 없음"}</p>
            </div>
            ${
              trailer
                ? `
              <div class="modal-trailer">
                <a href="https://www.youtube.com/watch?v=${trailer.key}" target="_blank" class="trailer-btn">
                  <span>▶</span> 예고편 보기
                </a>
              </div>
            `
                : ""
            }
          </div>
        </div>
      </div>
    `;

    // 닫기 버튼 이벤트 리스너 추가
    const closeBtn = modalContainer.querySelector(".modal-close-btn");
    closeBtn.addEventListener("click", closeMovieModal);

    // 모달 외부 클릭 시 닫기
    modalContainer.addEventListener("click", (e) => {
      if (e.target === modalContainer) {
        closeMovieModal();
      }
    });

    // ESC 키 누르면 모달 닫기
    document.addEventListener("keydown", handleEscKeyPress);
  } catch (error) {
    console.error("영화 상세 정보를 불러오는 중 오류가 발생했습니다:", error);
    modalContainer.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="error">영화 상세 정보를 불러오는 중 오류가 발생했습니다.</div>
        </div>
      </div>
    `;

    // 닫기 버튼 이벤트 리스너 추가
    const closeBtn = modalContainer.querySelector(".modal-close-btn");
    closeBtn.addEventListener("click", closeMovieModal);
  }
}

// ESC 키 누르면 모달 닫기
function handleEscKeyPress(e) {
  if (e.key === "Escape") {
    closeMovieModal();
  }
}

// 영화 상세 정보 모달 닫기
function closeMovieModal() {
  const modalContainer = document.getElementById("movie-modal-container");
  modalContainer.style.display = "none";

  // ESC 키 이벤트 리스너 제거
  document.removeEventListener("keydown", handleEscKeyPress);
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

// 캐러셀 설정 - 완전히 재작성
function setupCarousel(carouselElement) {
  const carouselTrack = carouselElement.querySelector(".carousel-track");
  const prevButton = carouselElement.querySelector("#btn-prev");
  const nextButton = carouselElement.querySelector("#btn-next");
  const container = carouselElement.querySelector(".carousel-container");

  let currentIndex = 0;
  const cardWidth = 200; // 카드 너비
  const cardGap = 16; // 카드 간격
  const cardFullWidth = cardWidth + cardGap; // 카드 전체 너비 (간격 포함)

  // 초기 상태 설정
  updateCarouselState();

  // 이전 버튼 클릭 이벤트
  prevButton.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarouselState();
    }
  });

  // 다음 버튼 클릭 이벤트
  nextButton.addEventListener("click", () => {
    const containerWidth = container.clientWidth;
    const visibleCards = Math.floor(containerWidth / cardFullWidth);
    const maxIndex = Math.max(0, trendingMovies.length - visibleCards);

    if (currentIndex < maxIndex) {
      currentIndex++;
      updateCarouselState();
    }
  });

  // 캐러셀 상태 업데이트
  function updateCarouselState() {
    // 트랙 위치 업데이트
    carouselTrack.style.transform = `translateX(-${
      currentIndex * cardFullWidth
    }px)`;

    // 버튼 상태 업데이트
    prevButton.disabled = currentIndex <= 0;

    const containerWidth = container.clientWidth;
    const visibleCards = Math.floor(containerWidth / cardFullWidth);
    const maxIndex = Math.max(0, trendingMovies.length - visibleCards);

    nextButton.disabled = currentIndex >= maxIndex;
  }

  // 윈도우 리사이즈 이벤트
  window.addEventListener("resize", () => {
    // 현재 인덱스가 유효한지 확인하고 필요시 조정
    const containerWidth = container.clientWidth;
    const visibleCards = Math.floor(containerWidth / cardFullWidth);
    const maxIndex = Math.max(0, trendingMovies.length - visibleCards);

    if (currentIndex > maxIndex) {
      currentIndex = maxIndex;
    }

    updateCarouselState();
  });
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
      toggleFavorite(movie);
    });

    // 검색 결과 클릭 시 상세 정보 모달 표시
    resultItem.addEventListener("click", () => {
      openMovieModal(movie.id);
    });

    resultsContainer.appendChild(resultItem);
  });

  searchResults.appendChild(resultsContainer);
}

// CSS 스타일 추가 (검색 결과)
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
  
  /* 모달 스타일 */
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
  
  /* 반응형 모달 */
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
