import { getMovieDetails, getImageUrl, getBackdropUrl } from "../api/api.js";

// 모달 컨테이너 생성
export function createModalContainer() {
  const modalContainer = document.createElement("div");
  modalContainer.id = "movie-modal-container";
  modalContainer.className = "modal-container";
  modalContainer.style.display = "none";

  document.body.appendChild(modalContainer);
}

// 영화 상세 정보 모달 열기
export async function openMovieModal(movieId) {
  const modalContainer = document.getElementById("movie-modal-container");

  // 로딩 상태 표시(비동기로 영화 상세 정보를 가져오기 전에 로딩 상태 표시)
  modalContainer.innerHTML = `
    <div class="modal-content modal-loading">
      <div class="loading">영화 상세 정보를 불러오는 중...</div>
    </div>
  `;
  modalContainer.style.display = "flex";

  try {
    // 영화 상세 정보 가져오기
    const movieDetails = await getMovieDetails(movieId); // 영화 상세 정보 비동기로 가져오기

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
export function closeMovieModal() {
  const modalContainer = document.getElementById("movie-modal-container");
  modalContainer.style.display = "none";

  // ESC 키 이벤트 리스너 제거
  document.removeEventListener("keydown", handleEscKeyPress); // ESC 키 이벤트 리스너를 제거하여 메모리 누수 방지
}

// 모달 스타일 추가
export function addModalStyles() {
  const style = document.createElement("style");
  style.textContent = `
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
}
