/**
 * 숫자를 3자리마다 콤마를 찍어 포맷팅
 * @param price 가격 (숫자)
 * @returns 포맷팅된 문자열 (예: "15,000")
 */
export function formatPrice(price: number): string {
  return price.toLocaleString("ko-KR");
}

/**
 * 숫자를 원화 형식으로 포맷팅
 * @param price 가격 (숫자)
 * @returns 포맷팅된 문자열 (예: "15,000원")
 */
export function formatCurrency(price: number): string {
  return `${formatPrice(price)}원`;
}
