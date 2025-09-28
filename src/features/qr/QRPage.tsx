import { observer } from "mobx-react-lite";
import { QRCodeSVG } from "qrcode.react";
import styles from "./QRPage.module.scss";
import { useParams } from "react-router-dom";
import { useLayoutEffect, useState } from "react";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";
import { FlexColumn } from "src/ui/components/atoms/FlexColumn/FlexColumn.tsx";
import { Spacing } from "src/ui/components/atoms/Spacing/Spacing.tsx";
import LZString from "lz-string";
import { Helmet } from "react-helmet";

function decodeQRUrl(encodedString: string) {
    try {
        const decompressed = LZString.decompressFromEncodedURIComponent(encodedString);
        return JSON.parse(decompressed);
    } catch (error) {
        throw new Error("Неверный формат данных");
    }
}

export const QRPage = observer(() => {
    const { key } = useParams();
    const [parsedKey, setParsedKey] = useState<any>({});
    const [qrKey, setQrKey] = useState(() => btoa(`${new Date().toISOString()}_${parsedKey.id}`));
    const [error, setError] = useState(false);

    useLayoutEffect(() => {
        const interval = setInterval(() => {
            setQrKey(btoa(`${new Date().toISOString()}_${parsedKey.id}`));
        }, 5000);
        return () => {
            clearInterval(interval);
        };
    }, [key]);

    useLayoutEffect(() => {
        if (!key) {
            return;
        }
        try {
            const parsedKey = decodeQRUrl(key);
            setParsedKey(parsedKey);
            if (!parsedKey.number) {
                setError(true);
            }
        } catch (e) {
            console.error(e);
            setError(true);
        }
    }, [key]);

    if (error) {
        throw new Error("недействительная ссылка на QR");
    }

    if (!parsedKey.number) {
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.qrContainer}>
                <FlexColumn>
                    <Typo variant={"bodyXL"} style={{ maxWidth: 254, textAlign: "center" }}>
                        {parsedKey.name}
                    </Typo>
                    <Spacing height={4} />
                    <Typo
                        variant={"bodyM"}
                        style={{ maxWidth: 254, color: "rgba(0, 0, 0, 0.39)", textAlign: "center" }}
                    >
                        № {parsedKey.number.toString().slice(0, 3)}-
                        {parsedKey.number.toString().slice(3, 6)}
                    </Typo>
                    <Spacing height={8} />
                    <Typo
                        variant={"bodyXL"}
                        type={"tertiary"}
                        mode={"neutral"}
                        style={{ maxWidth: 254, textAlign: "center" }}
                    >
                        {parsedKey.address}
                    </Typo>
                </FlexColumn>
                <div className={styles.qrImageContainer}>
                    <QRCodeSVG
                        value={qrKey}
                        style={{
                            width: "100%",
                            height: "100%",
                        }}
                    />
                </div>
                <Typo
                    variant={"subheadL"}
                    type={"tertiary"}
                    mode={"neutral"}
                    style={{
                        marginBottom: 115,
                    }}
                >
                    QR-код активен 5 секунд
                </Typo>
            </div>
            <Helmet>
                <title>{`QR - ${parsedKey.name ?? ""}`}</title>
            </Helmet>
        </div>
    );
});
