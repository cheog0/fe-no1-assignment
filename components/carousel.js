// 캐러셀 설정
export function setupCarousel(carouselElement, movies) {
  const carouselTrack = carouselElement.querySelector(".carousel-track");
  const prevButton = carouselElement.querySelector("[id$='btn-prev']"); // id가 btn-prev로 끝나는 요소
  const nextButton = carouselElement.querySelector("[id$='btn-next']"); // id가 btn-next로 끝나는 요소
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
    const maxIndex = Math.max(0, movies.length - visibleCards);

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
    const maxIndex = Math.max(0, movies.length - visibleCards);

    nextButton.disabled = currentIndex >= maxIndex;
  }

  // 윈도우 리사이즈 이벤트
  window.addEventListener("resize", () => {
    // 현재 인덱스가 유효한지 확인하고 필요시 조정
    const containerWidth = container.clientWidth;
    const visibleCards = Math.floor(containerWidth / cardFullWidth);
    const maxIndex = Math.max(0, movies.length - visibleCards);

    if (currentIndex > maxIndex) {
      currentIndex = maxIndex;
    }

    updateCarouselState();
  });
}

// 캐러셀 스타일 추가
export function addCarouselStyles() {
  const style = document.createElement("style");
  style.textContent = `
    /* 캐러셀 관련 스타일 */
    .movie-carousel {
      position: relative;
      width: 100%;
      margin: 2rem 0;
    }
    
    .carousel-container {
      position: relative;
      overflow: hidden;
      width: 100%;
      padding: 1rem 0;
    }
    
    .carousel-track {
      display: flex;
      gap: 16px; /* 카드 간격 */
      transition: transform 0.5s ease;
    }
    
    .carousel-buttons {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none; /* 버튼만 클릭 가능하도록 */
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 10px;
      z-index: 10;
    }
    
    [id$="btn-prev"],
    [id$="btn-next"] {
      background-color: rgba(0, 0, 0, 0.7);
      color: var(--secondary-color);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-speed);
      pointer-events: auto; /* 버튼은 클릭 가능하게 */
    }
    
    [id$="btn-prev"]:hover,
    [id$="btn-next"]:hover {
      background-color: var(--primary-color);
      transform: scale(1.1);
    }
    
    [id$="btn-prev"]:disabled,
    [id$="btn-next"]:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(style);
}
