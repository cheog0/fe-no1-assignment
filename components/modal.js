import { getMovieDetails, getBackdropUrl, getImageUrl } from "../api/api.js";

// 모달 닫기 함수 (ESC 키 이벤트 포함)
export function closeMovieModal() {
  const modalContainer = document.getElementById("movie-modal-container");
  modalContainer.style.display = "none";
  document.removeEventListener("keydown", handleEscKeyPress);
}

// ESC 키 이벤트 핸들러
function handleEscKeyPress(e) {
  if (e.key === "Escape") {
    closeMovieModal();
  }
}

// 모달 열기 함수
export async function openMovieModal(movieId) {
  const modalContainer = document.getElementById("movie-modal-container");

  // 로딩 UI
  modalContainer.innerHTML = `
    <div class="modal-content modal-loading">
      <div class="loading">영화 상세 정보를 불러오는 중...</div>
    </div>
  `;
  modalContainer.style.display = "flex";

  try {
    const movieDetails = await getMovieDetails(movieId);

    const genres = movieDetails.genres.map((g) => g.name).join(", ");
    const castList =
      movieDetails.credits?.cast
        ?.slice(0, 5)
        .map((a) => a.name)
        .join(", ") || "정보 없음";
    const director =
      movieDetails.credits?.crew.find((p) => p.job === "Director")?.name ||
      "정보 없음";
    const trailer = movieDetails.videos?.results.find(
      (v) => v.type === "Trailer" && v.site === "YouTube"
    );

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
                movieDetails.vote_average?.toFixed(1) || "N/A"
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
              <p><strong>감독:</strong> ${director}</p>
              <p><strong>출연:</strong> ${castList}</p>
            </div>
            ${
              trailer
                ? `<div class="modal-trailer">
                    <a href="https://www.youtube.com/watch?v=${trailer.key}" target="_blank" class="trailer-btn">
                      <span>▶</span> 예고편 보기
                    </a>
                  </div>`
                : ""
            }
          </div>
        </div>
      </div>
    `;

    modalContainer
      .querySelector(".modal-close-btn")
      .addEventListener("click", closeMovieModal);
    modalContainer.addEventListener("click", (e) => {
      if (e.target === modalContainer) closeMovieModal();
    });
    document.addEventListener("keydown", handleEscKeyPress);
  } catch (err) {
    console.error("영화 상세 정보를 불러오는 중 오류:", err);
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
    modalContainer
      .querySelector(".modal-close-btn")
      .addEventListener("click", closeMovieModal);
  }
}
