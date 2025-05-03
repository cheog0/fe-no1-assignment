const API_KEY =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNWY0Zjk2ZDYxNTIxYjQ2YmM1ZGE2MzA3MmE1YzRjMSIsIm5iZiI6MS43NDYyNDMzMzcxOTM5OTk4ZSs5LCJzdWIiOiI2ODE1OGYwOTIyMWRmMjRkNzc5MDdmYzYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.wAl8zOCJozvi5a_weaZv5Q0Fmfrfdm31yE095HL_UbE";

const OPTION = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const BASE_URL = "https://api.themoviedb.org/3";
const LANGUAGE = "ko-KR";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

// 인기 영화 가져오기
export async function getTrendingMovies() {
  try {
    const response = await fetch(
      `${BASE_URL}/trending/movie/day?language=${LANGUAGE}`,
      OPTION
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("인기 영화를 가져오는 중 오류 발생:", error);
    return [];
  }
}

// 영화 검색하기
export async function searchMovies(query) {
  try {
    const response = await fetch(
      `${BASE_URL}/search/movie?query=${encodeURIComponent(
        query
      )}&language=${LANGUAGE}`,
      OPTION
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("영화 검색 중 오류 발생:", error);
    return [];
  }
}

// 영화 상세 정보 가져오기
export async function getMovieDetails(movieId) {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}?language=${LANGUAGE}&append_to_response=credits,videos`,
      OPTION
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("영화 상세 정보를 가져오는 중 오류 발생:", error);
    throw error;
  }
}

// 이미지 URL 생성
export function getImageUrl(path) {
  if (!path) return "/placeholder.svg?height=750&width=500";
  return `${IMAGE_BASE_URL}${path}`;
}

// 배경 이미지 URL 생성 (더 큰 이미지)
export function getBackdropUrl(path) {
  if (!path) return "/placeholder.svg?height=500&width=900";
  return `https://image.tmdb.org/t/p/w1280${path}`;
}

export { BASE_URL, LANGUAGE, OPTION };
