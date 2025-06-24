import { redis } from './redis';
import webpush from 'web-push';

export class SimplePushManager {
  static async addSubscription(subscriptionData: webpush.PushSubscription) {
    try {
      const key = `push:${Buffer.from(subscriptionData.endpoint).toString(
        'base64'
      )}`;

      const dataToStore = {
        ...subscriptionData,
        createdAt: Date.now(),
        lastUsed: Date.now(),
      };

      await redis.set(key, JSON.stringify(dataToStore), {
        EX: 3600,
      });
      return { success: true };
    } catch (error) {
      console.error('구독 저장 실패:', error);
      throw error;
    }
  }

  static async removeSubscription(subscriptionData: webpush.PushSubscription) {
    try {
      const key = `push:${Buffer.from(subscriptionData.endpoint).toString(
        'base64'
      )}`;

      const result = await redis.del(key);

      if (result === 1) {
        console.log('구독 삭제 성공:', key);
        return { success: true, deleted: true };
      } else {
        console.log('삭제할 구독을 찾을 수 없음:', key);
        return { success: true, deleted: false };
      }
    } catch (error) {
      console.error('구독 삭제 실패:', error);
      throw error;
    }
  }

  // 간단한 전체 구독 조회
  static async getAllSubscriptions() {
    try {
      // push:로 시작하는 모든 키 조회
      const keys = await redis.keys('push:*');

      if (keys.length === 0) return [];

      // 모든 값을 한번에 가져오기
      const values = await redis.mGet(keys);

      return values
        .map((data) => {
          if (!data) return null;
          try {
            return JSON.parse(data);
          } catch (error) {
            console.error('JSON 파싱 실패:', error);
            return null;
          }
        })
        .filter(Boolean); // null 제거
    } catch (error) {
      console.error('❌ 전체 구독 조회 실패:', error);
      return [];
    }
  }
}
