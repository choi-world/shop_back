export interface PaymentVerification {
  success: boolean;
}

export interface PaymentGateway {
  // 클라이언트가 PG와 직접 통신해서 받아온 결제 키를 백엔드가 서버-대-서버로
  // 재검증한다. 클라이언트가 보낸 "성공했다"는 주장을 그대로 믿지 않기 위함이다.
  verify(paymentKey: string): Promise<PaymentVerification>;
}
