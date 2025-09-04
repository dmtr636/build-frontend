import { observer } from "mobx-react-lite";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";

export const HomePage = observer(() => {
    return <Typo variant={"h1"}>Главная страница</Typo>;
});
