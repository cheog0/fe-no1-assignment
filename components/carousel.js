export function setupCarousel(carouselElement, trendingMovies) {
  const carouselTrack = carouselElement.querySelector(".carousel-track");
  const prevButton = carouselElement.querySelector("#btn-prev");
  const nextButton = carouselElement.querySelector("#btn-next");
  const container = carouselElement.querySelector(".carousel-container");

  let currentIndex = 0;
  const cardWidth = 200;
  const cardGap = 16;
  const cardFullWidth = cardWidth + cardGap;

  updateCarouselState();

  prevButton.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarouselState();
    }
  });

  nextButton.addEventListener("click", () => {
    const containerWidth = container.clientWidth;
    const visibleCards = Math.floor(containerWidth / cardFullWidth);
    const maxIndex = Math.max(0, trendingMovies.length - visibleCards);

    if (currentIndex < maxIndex) {
      currentIndex++;
      updateCarouselState();
    }
  });

  window.addEventListener("resize", () => {
    const containerWidth = container.clientWidth;
    const visibleCards = Math.floor(containerWidth / cardFullWidth);
    const maxIndex = Math.max(0, trendingMovies.length - visibleCards);

    if (currentIndex > maxIndex) {
      currentIndex = maxIndex;
    }

    updateCarouselState();
  });

  function updateCarouselState() {
    carouselTrack.style.transform = `translateX(-${
      currentIndex * cardFullWidth
    }px)`;

    prevButton.disabled = currentIndex <= 0;

    const containerWidth = container.clientWidth;
    const visibleCards = Math.floor(containerWidth / cardFullWidth);
    const maxIndex = Math.max(0, trendingMovies.length - visibleCards);

    nextButton.disabled = currentIndex >= maxIndex;
  }
}
