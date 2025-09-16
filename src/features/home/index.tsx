import { observer } from "mobx-react-lite";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { Helmet } from "react-helmet";

export const HomePage = observer(() => {
    return (
        <div>
            <Helmet>
                <title>Главная – Build</title>
            </Helmet>
            <Typo variant={"h1"}>Главная страница</Typo>
        </div>
    );
});
