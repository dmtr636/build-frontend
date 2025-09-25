import { makeAutoObservable } from "mobx";
import { Client } from "@stomp/stompjs";
import { DEBUG, domain } from "src/shared/config/domain.ts";
import { throttle } from "src/shared/utils/throttle.ts";
import { store } from "storybook-dark-mode/dist/ts/Tool";
import {
    accountStore,
    appStore,
    eventsStore,
    organizationsStore,
    registryStore,
    userStore,
} from "src/app/AppStore.ts";
import { User } from "src/features/users/types/User.ts";

export interface IWebsocketEvent {
    type: "CREATE" | "UPDATE" | "DELETE";
    objectName: string;
    data: any;
}

export class WebsocketStore {
    stompClient: Client | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    connectToSocket() {
        const host = domain.split("://")[1];
        this.stompClient = new Client({
            brokerURL: `ws${DEBUG ? "" : "s"}://${host}/api/events/ws`,
        });

        this.stompClient.onConnect = () => {
            this.stompClient?.subscribe("/topic/events", (message) => {
                const event = JSON.parse(message.body) as IWebsocketEvent;
                if (event.objectName === "user") {
                    if (event.type === "CREATE") {
                        userStore.users.push(event.data);
                        const user = event.data as User;
                        if (user.organizationId) {
                            if (
                                !organizationsStore.organizationsMap
                                    .get(user.organizationId)
                                    ?.employees.some((e) => e.id === user.id)
                            ) {
                                const org = organizationsStore.organizationsMap.get(
                                    user.organizationId,
                                );
                                if (org?.employees) {
                                    org.employees.push(user);
                                }
                            }
                        }
                    }
                    if (event.type === "UPDATE") {
                        const oldUserOrgId = userStore.usersMap.get(event.data.id)?.organizationId;
                        userStore.users = userStore.users.map((u) =>
                            u.id === event.data.id ? event.data : u,
                        );
                        if (
                            accountStore.currentUser &&
                            accountStore.currentUser.id === event.data.id
                        ) {
                            accountStore.currentUser = {
                                ...accountStore.currentUser,
                                ...event.data,
                            };
                        }
                        const user = event.data as User;
                        if (user.organizationId) {
                            if (
                                !organizationsStore.organizationsMap
                                    .get(user.organizationId)
                                    ?.employees.some((e) => e.id === user.id)
                            ) {
                                const org = organizationsStore.organizationsMap.get(
                                    user.organizationId,
                                );
                                if (org?.employees) {
                                    org.employees.push(user);
                                }
                            }
                        }
                        if (user.organizationId !== oldUserOrgId && oldUserOrgId) {
                            if (
                                organizationsStore.organizationsMap
                                    .get(oldUserOrgId)
                                    ?.employees.some((e) => e.id === user.id)
                            ) {
                                const org = organizationsStore.organizationsMap.get(oldUserOrgId);
                                if (org?.employees) {
                                    org.employees = org.employees.filter((e) => e.id !== user.id);
                                }
                            }
                        }
                    }
                    if (event.type === "DELETE") {
                        userStore.users = userStore.users.filter((u) => u.id !== event.data.id);
                        const user = event.data as User;
                        if (user.organizationId) {
                            if (
                                organizationsStore.organizationsMap
                                    .get(user.organizationId)
                                    ?.employees.some((e) => e.id === user.id)
                            ) {
                                const org = organizationsStore.organizationsMap.get(
                                    user.organizationId,
                                );
                                if (org?.employees) {
                                    org.employees = org.employees.filter((e) => e.id !== user.id);
                                }
                            }
                        }
                    }
                }
                if (event.objectName === "userStatus") {
                    if (event.type === "UPDATE") {
                        userStore.usersOnline = {
                            ...userStore.usersOnline,
                            ...event.data,
                        };
                    }
                }
                if (
                    event.objectName === "organization" ||
                    event.objectName === "organization-employees"
                ) {
                    if (event.type === "CREATE") {
                        organizationsStore.organizations.push(event.data);
                    }
                    if (event.type === "UPDATE") {
                        organizationsStore.organizations = organizationsStore.organizations.map(
                            (o) => (o.id === event.data.id ? event.data : o),
                        );
                        if (
                            organizationsStore.editingOrganization &&
                            organizationsStore.editingOrganization === event.data.id
                        ) {
                            organizationsStore.editingOrganization = {
                                ...organizationsStore.editingOrganization,
                                ...event.data,
                            };
                        }
                    }
                    if (event.type === "DELETE") {
                        organizationsStore.organizations = organizationsStore.organizations.filter(
                            (o) => o.id !== event.data.id,
                        );
                    }
                }

                if (event.objectName === "normative-document") {
                    if (event.type === "CREATE") {
                        registryStore.documents.push(event.data);
                    }
                    if (event.type === "UPDATE") {
                        registryStore.documents = registryStore.documents.map((o) =>
                            o.id === event.data.id ? event.data : o,
                        );
                    }
                    if (event.type === "DELETE") {
                        registryStore.documents = registryStore.documents.filter(
                            (o) => o.id !== event.data.id,
                        );
                    }
                }

                if (event.objectName === "construction-violation") {
                    if (event.type === "CREATE") {
                        registryStore.violations.push(event.data);
                    }
                    if (event.type === "UPDATE") {
                        registryStore.violations = registryStore.violations.map((o) =>
                            o.id === event.data.id ? event.data : o,
                        );
                    }
                    if (event.type === "DELETE") {
                        registryStore.violations = registryStore.violations.filter(
                            (o) => o.id !== event.data.id,
                        );
                    }
                }

                if (event.objectName === "construction-work") {
                    if (event.type === "CREATE") {
                        registryStore.works.push(event.data);
                    }
                    if (event.type === "UPDATE") {
                        registryStore.works = registryStore.works.map((o) =>
                            o.id === event.data.id ? event.data : o,
                        );
                    }
                    if (event.type === "DELETE") {
                        registryStore.works = registryStore.works.filter(
                            (o) => o.id !== event.data.id,
                        );
                    }
                }

                if (event.objectName === "event") {
                    if (event.type === "CREATE") {
                        eventsStore.events.push(event.data);
                    }
                    if (event.type === "UPDATE") {
                        eventsStore.events = eventsStore.events.map((o) =>
                            o.id === event.data.id ? event.data : o,
                        );
                    }
                    if (event.type === "DELETE") {
                        eventsStore.events = eventsStore.events.filter(
                            (o) => o.id !== event.data.id,
                        );
                    }
                }

                if (event.objectName === "project") {
                    if (event.type === "CREATE") {
                        appStore.objectStore.objects.push(event.data);
                    }
                    if (event.type === "UPDATE") {
                        appStore.objectStore.objects = appStore.objectStore.objects.map((o) =>
                            o.id === event.data.id ? event.data : o,
                        );
                    }
                    if (event.type === "DELETE") {
                        appStore.objectStore.objects = appStore.objectStore.objects.filter(
                            (o) => o.id !== event.data.id,
                        );
                    }
                }
            });
        };

        this.stompClient.onWebSocketError = (error) => {
            console.error("Error with websocket", error);
        };

        this.stompClient.onStompError = (frame) => {
            console.error("Broker reported error: " + frame.headers["message"]);
            console.error("Additional details: " + frame.body);
        };

        this.stompClient.activate();
    }

    closeSocket() {
        this.stompClient?.deactivate();
    }
}
