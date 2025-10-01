import { LayoutStore } from "src/features/layout/LayoutStore.ts";
import { AccountStore } from "src/features/users/stores/AccountStore.ts";
import { UserStore } from "src/features/users/stores/UserStore.ts";
import { EventsStore } from "src/features/events/EventsStore.ts";
import { OrganizationsStore } from "src/features/organizations/OrganizationsStore.ts";
import { WebsocketStore } from "src/features/websocket/stores/WebsocketStore.ts";
import { RegistryStore } from "src/features/registry/RegistryStore.ts";
import { ObjectStore } from "src/features/journal/stores/objectStore.ts";
import { ViolationStore } from "src/features/journal/stores/violationStore.ts";
import { WorksStore } from "src/features/journal/pages/WorksPage/ProjectWorksStore.ts";
import { VisitsStore } from "src/features/journal/pages/VisitsPage/VisitsStore.ts";
import { NotificationStore } from "src/features/notification/store/notificationStore.ts";
import { MaterialsStore } from "src/features/journal/pages/MaterialsPage/MaterialsStore.ts";

export const layoutStore = new LayoutStore();
export const accountStore = new AccountStore();
export const userStore = new UserStore();
export const eventsStore = new EventsStore();
export const organizationsStore = new OrganizationsStore();
export const websocketStore = new WebsocketStore();
export const registryStore = new RegistryStore();
export const objectStore = new ObjectStore();
export const violationStore = new ViolationStore();
export const worksStore = new WorksStore();
export const visitsStore = new VisitsStore();
export const notificationStore = new NotificationStore();
export const materialsStore = new MaterialsStore();
export const appStore = {
    layoutStore,
    violationStore,
    accountStore,
    userStore,
    eventsStore,
    organizationsStore,
    websocketStore,
    registryStore,
    objectStore,
    worksStore,
    notificationStore,
    visitsStore,
    materialsStore,
};
