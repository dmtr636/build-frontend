import { observer } from "mobx-react-lite";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";

export const OrganizationsPage = observer(() => {
    return (
        <div>
            <Typo variant={"h1"}>Организации</Typo>
        </div>
    );
});
