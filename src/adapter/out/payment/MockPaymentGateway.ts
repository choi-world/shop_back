import { PaymentGateway, PaymentVerification } from '../../../domain/port/out/PaymentGateway';

// 실제로는 여기서 PG 서버에 paymentKey로 조회해서 결제 상태/금액을 확인해야 한다.
// 지금은 결제 자체가 모킹되어 있어 항상 성공으로 처리한다.
export class MockPaymentGateway implements PaymentGateway {
  async verify(_paymentKey: string): Promise<PaymentVerification> {
    return { success: true };
  }
}
