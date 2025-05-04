// 로컬 스토리지에서 즐겨찾기 가져오기
export function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

// 즐겨찾기 저장하기
export function saveFavorites(favorites) {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

// 즐겨찾기 토글 함수
export function toggleFavorite(movie, favorites, showToast) {
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
  saveFavorites(favorites);

  return favorites;
}
