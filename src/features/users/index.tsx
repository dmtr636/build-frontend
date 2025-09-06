import { observer } from "mobx-react-lite";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { appStore } from "src/app/AppStore.ts";
import UserItemCard from "src/features/users/components/UserItemCard/UserItemCard.tsx";
import UserItemList from "src/features/users/components/UserItemList/UserItemList.tsx";
import styles from "./UsersPage.module.scss";

export const UsersPage = observer(() => {
    const users = appStore.userStore.users;
    console.log(users);
    return (
        <div className={styles.container}>
            <UserItemList users={users} />
        </div>
    );
});
