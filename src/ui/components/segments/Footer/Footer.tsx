import styles from "./Footer.module.scss";
import { observer } from "mobx-react-lite";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { CSSProperties, useState } from "react";
import { getScrollBarWidth } from "src/shared/utils/getScrollbarWidth.ts";
import { useNavigate } from "react-router-dom";
import { telegramContactLink } from "src/ui/components/pages/ErrorPage/ErrorPage.tsx";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";

interface Props {
    style?: CSSProperties;
}

export const Footer = observer((props: Props) => {
    const [scrollbarWidth] = useState(() => getScrollBarWidth());
    const [showReportOverlay, setShowReportOverlay] = useState(false);
    const [showImprovementOverlay, setShowImprovementOverlay] = useState(false);
    const navigate = useNavigate();

    const isDevBranch = () => {
        return window.location.hostname.includes("dev.build");
    };

    return (
        <div
            className={styles.footer}
            style={{
                ...props.style,
                marginRight: `-${scrollbarWidth}px`,
            }}
        >
            <Button
                href={telegramContactLink}
                target={"_blank"}
                type={"text"}
                mode={"neutral"}
                size={"small"}
                pale={true}
            >
                Связаться с нами
            </Button>
            <Button
                onClick={() => navigate("/documentation/")}
                type={"text"}
                mode={"neutral"}
                size={"small"}
                pale={true}
            >
                Правовая информация
            </Button>
            <Button
                type={"text"}
                mode={"neutral"}
                size={"small"}
                pale={true}
                onClick={() => {
                    setShowReportOverlay(true);
                }}
            >
                Сообщить об ошибке
            </Button>
            <Button
                type={"text"}
                mode={"neutral"}
                size={"small"}
                pale={true}
                onClick={() => {
                    setShowImprovementOverlay(true);
                }}
            >
                Предложить улучшение
            </Button>
            <Typo
                variant={"bodyXL"}
                mode={"neutral"}
                type={"quaternary"}
                className={styles.version}
            >
                {import.meta.env.VITE_APP_VERSION}
                {isDevBranch() && "-dev"}
            </Typo>
        </div>
    );
});
