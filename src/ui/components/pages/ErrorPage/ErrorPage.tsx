import { ErrorResponse, useLocation, useNavigate, useRouteError } from "react-router-dom";
import ErrorImage from "./ErrorImage.svg?react";
import ErrorImageMobile from "./ErrorImageMobile.svg?react";
import styles from "./ErrorPage.module.scss";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { IconBack } from "src/ui/assets/icons";
import { useLayoutEffect } from "react";
import { Helmet } from "react-helmet";
import { layoutStore } from "src/app/AppStore.ts";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { useIsMobile } from "src/shared/hooks/useIsMobile.ts";

export const telegramContactLink = "https://t.me/expfolio_support_bot";

export const ErrorPage = () => {
    const error = useRouteError() as ErrorResponse | Error;
    const navigate = useNavigate();
    const location = useLocation();

    console.error(error);

    const is404Error = "status" in error && error.status === 404;

    const isMobile = useIsMobile();

    useLayoutEffect(() => {
        layoutStore.isMobile = isMobile;
    }, [isMobile]);

    const getErrorMessage = () => {
        if (is404Error) {
            return "Ошибка 404";
        }
        if ("message" in error && error.message) {
            return `Неизвестная ошибка (${error.message})`;
        }
        return `Неизвестная ошибка`;
    };

    const getText = () => {
        if (is404Error) {
            return (
                "Возможно, страница была удалена, переехала на другой " +
                "адрес или её никогда не существовало. В любом случае вы " +
                "сможете вернуться обратно в сервис"
            );
        }
        return (
            "Попробуйте выполнить операцию ещё раз. Если ошибка " +
            "повторяется, то свяжитесь с нами и, пожалуйста, сообщите, " +
            "что случилось"
        );
    };

    return (
        <div className={styles.container}>
            <Helmet>
                <meta name="robots" content="noindex" />
            </Helmet>
            {layoutStore.isMobile ? <ErrorImageMobile /> : <ErrorImage />}
            <div
                style={{
                    display: layoutStore.isMobile ? "flex" : undefined,
                    flexGrow: layoutStore.isMobile ? 1 : undefined,
                    flexDirection: layoutStore.isMobile ? "column" : undefined,
                }}
            >
                <Typo
                    variant={"subheadXL"}
                    className={styles.errorDescription}
                    style={{
                        maxWidth: 480,
                    }}
                >
                    {getErrorMessage()}
                </Typo>
                <Typo
                    variant={layoutStore.isMobile ? "h2" : "h1"}
                    className={styles.title}
                    mode={"accent"}
                    type={"primary"}
                >
                    Нам жаль, что это произошло
                </Typo>
                <Typo variant={"bodyXL"} className={styles.text}>
                    {getText()}
                </Typo>
                <div className={styles.actions}>
                    {is404Error ? (
                        <Button
                            size={"large"}
                            iconBefore={<IconBack />}
                            onClick={() =>
                                navigate(location.pathname.includes("/admin") ? "/admin" : "/", {
                                    replace: true,
                                })
                            }
                            mode={"accent"}
                            fullWidth={layoutStore.isMobile}
                        >
                            Вернуться в сервис
                        </Button>
                    ) : layoutStore.isMobile ? (
                        <FlexColumn gap={12} width={"100%"}>
                            <Button
                                size={"large"}
                                href={telegramContactLink}
                                target={"_blank"}
                                mode={"accent"}
                                type={"tertiary"}
                                fullWidth={true}
                            >
                                Связаться с нами
                            </Button>
                            <Button
                                size={"large"}
                                onClick={() => window.location.reload()}
                                mode={"accent"}
                                fullWidth={true}
                            >
                                Перезагрузить страницу
                            </Button>
                        </FlexColumn>
                    ) : (
                        <>
                            <Button
                                size={"large"}
                                onClick={() => window.location.reload()}
                                mode={"accent"}
                            >
                                Перезагрузить страницу
                            </Button>
                            <Button
                                size={"large"}
                                href={telegramContactLink}
                                target={"_blank"}
                                mode={"accent"}
                                type={"tertiary"}
                            >
                                Связаться с нами
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
