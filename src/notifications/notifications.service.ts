import { AuthContextNotificationType, AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from "axios";


export type NotificationBuilderType<T> = {
  type: string;
  authContexts: AuthContextNotificationType[];
  title?: string;
  message: string;
  url: string;
  showWhenOnUrl: boolean;
  interruptionLevel: 'active' | 'passive' | 'time_sensitive' | 'critical',
  badgeType: 'None' | 'SetTo' | 'Increase',
  badgeCount: number
}

export type NotificationType<T> = {
  type: string;
  builder: (authContext: AuthContextType, data: T) => NotificationBuilderType<T>
}


@Injectable()
export class NotificationsService {
  private readonly url: string;

  constructor(private readonly configService: ConfigService) {
    this.url = 'https://api.onesignal.com/notifications?c=push';
  }

  async sendNotification<T>(notification: NotificationType<T>, authContext: AuthContextType, data: T) {
    const notificationBuilder = notification.builder(authContext, data);


    try {
      const response = await axios.post(this.url, {
        app_id: this.configService.get('ONESIGNAL_APP_ID'),
        target_channel: 'push',
        include_aliases: {
          auth_context: notificationBuilder.authContexts.map(c => `${c.workspaceId}-${c.userId}`)
        },
        headings: {
          en: notificationBuilder.title
        },
        contents: {
          en: notificationBuilder.message
        },
        data: {
          type: notificationBuilder.type,
          show_when_on_url: notificationBuilder.showWhenOnUrl
        },
        url: `${this.configService.get('NOTIFICATION_SCHEMA')}${notificationBuilder.url}`,
        ios_interruption_level: notificationBuilder.interruptionLevel,
        ios_badgeType: notificationBuilder.badgeType,
        ios_badgeCount: notificationBuilder.badgeCount
      }, {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'Authorization': `Key ${this.configService.get('ONESIGNAL_API_KEY')}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error sending notification', JSON.stringify(error.response.data, null, 2));
    }
  }
}
