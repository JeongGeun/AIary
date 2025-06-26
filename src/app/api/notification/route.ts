import webpush from 'web-push';
import { NextResponse } from 'next/server';
import { SimplePushManager } from '../_utils/PushManager';

webpush.setVapidDetails(
  'https://ai-ary.vercel.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST() {
  try {
    // 모든 구독자 가져오기
    const subscriptions = await SimplePushManager.getAllSubscriptions();

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: '전송할 구독자가 없습니다.',
        stats: { sent: 0, failed: 0, total: 0 },
      });
    }

    console.log(`${subscriptions.length}명에게 알림 전송 시작...`);

    // 모든 구독자에게 전송
    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: subscription.keys,
        };

        const payload = JSON.stringify({
          title: 'AI Ary가 알려드려요',
          body: '오늘 하루는 어땠나요?',
          icon: '/web-app-manifest-192x192.png',
          badge: '/web-app-manifest-192x192.png',
        });

        await webpush.sendNotification(pushSubscription, payload);

        return { success: true, endpoint: subscription.endpoint };
      } catch (error) {
        console.error(
          `전송 실패 (${subscription.endpoint.substring(0, 50)}...):`,
          error
        );
        return {
          success: false,
          endpoint: subscription.endpoint,
        };
      }
    });

    await Promise.all(sendPromises);

    return NextResponse.json({
      success: true,
      message: '알림 전송이 완료되었습니다.',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('알림 전송 실패:', error);
    return NextResponse.json(
      {
        error: '알림 전송 실패',
      },
      { status: 500 }
    );
  }
}
