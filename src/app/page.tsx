import { InstallPrompt } from './_component/WebPush/InstallPrompt';
import { PushNotificationManager } from './_component/WebPush/PushNotificationManager';

export default function Page() {
  return (
    <div>
      <PushNotificationManager />
      <InstallPrompt />
    </div>
  );
}
