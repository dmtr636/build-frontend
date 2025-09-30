import { makeAutoObservable } from "mobx";
import { NotificationDTO } from "src/features/notification/types/notification.ts";
import axios from "axios";
import { endpoints } from "src/shared/api/endpoints.ts";

export class NotificationStore {
    notifications: NotificationDTO[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    async fetchAllNotifications() {
        const response = await axios.get(endpoints.notifications);
        this.notifications = response.data;
    }

    async fetchUnreadNotifications() {
        const response = await axios.get(`${endpoints.notifications}/unread`);
        this.notifications = response.data;
    }

    async notificationIsRead(id: string) {
        await axios.patch(`${endpoints.notifications}/${id}/read`);
        this.fetchUnreadNotifications();
    }
}
