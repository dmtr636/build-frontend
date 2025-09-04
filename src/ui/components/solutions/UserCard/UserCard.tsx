import { IconEdit } from "src/ui/assets/icons";
import { Avatar } from "src/ui/components/solutions/Avatar/Avatar";
import styles from "./UserCard.module.scss";
import { TooltipTypo } from "src/ui/components/info/TooltipTypo/TooltipTypo.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { Contact } from "src/ui/components/solutions/Contact/Contact.tsx";

interface UserCardProps {
    email: string;
    role: string;
    photoUrl?: string;
    fullName?: string | null;
    firstName?: string;
    lastName?: string;
    onEditClick?: () => void;
}

export const UserCard = (props: UserCardProps) => {
    const { email, role, photoUrl, fullName, firstName, lastName }: UserCardProps = props;

    const emailLogin = email.split("@")[0];

    return (
        <div className={styles.card}>
            <Avatar
                userName={firstName && `${firstName} ${lastName}`}
                size={"large"}
                photoUrl={photoUrl}
            />
            <div className={styles.column}>
                <div className={styles.mainInfo}>
                    <div className={styles.name}>
                        {firstName && lastName ? (
                            <>
                                <TooltipTypo variant={"actionXL"}>{firstName}</TooltipTypo>
                                <TooltipTypo variant={"actionXL"}>{lastName}</TooltipTypo>
                            </>
                        ) : (
                            <TooltipTypo variant={"actionXL"}>{fullName || emailLogin}</TooltipTypo>
                        )}
                    </div>
                    <TooltipTypo variant={"actionM"} className={styles.role}>
                        {role}
                    </TooltipTypo>
                </div>
                <div className={styles.email}>
                    <Contact type={"email"} text={email} />
                </div>
            </div>
            {/*{props.onEditClick && (*/}
            <Button
                iconBefore={<IconEdit />}
                type={"secondary"}
                size={"small"}
                className={styles.editButton}
                disabled={!props.onEditClick}
                onClick={props.onEditClick}
            />
            {/*)}*/}
        </div>
    );
};
