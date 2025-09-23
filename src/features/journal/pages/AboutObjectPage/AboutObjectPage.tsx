import React, { useState } from "react";
import styles from "./AboutObjectPage.module.scss";
import { IconApartment, IconBasket } from "src/ui/assets/icons";
import { Media } from "src/ui/components/solutions/Media/Media.tsx";
import { fileUrl } from "src/shared/utils/file.ts";
import { appStore, eventsStore } from "src/app/AppStore.ts";
import { Input } from "src/ui/components/inputs/Input/Input.tsx";
import { Button } from "src/ui/components/controls/Button/Button.tsx";
import { Autocomplete } from "src/ui/components/inputs/Autocomplete/Autocomplete.tsx";
import { DateInput } from "src/ui/components/inputs/DateInput/DateInput.tsx";
import { DatePicker } from "src/ui/components/inputs/DatePicker/DatePicker.tsx";
import { extractImageMetadata } from "src/shared/utils/extractMeta.ts";
import exifr from "exifr";
import { Typo } from "src/ui/components/atoms/Typo/Typo.tsx";

function getDaysBetween(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const diff = end.getTime() - start.getTime();
    const days = Math.abs(Math.floor(diff / (1000 * 60 * 60 * 24)));

    const getDayWord = (n: number): string => {
        const lastDigit = n % 10;
        const lastTwo = n % 100;

        if (lastTwo >= 11 && lastTwo <= 14) return "дней";
        if (lastDigit === 1) return "день";
        if (lastDigit >= 2 && lastDigit <= 4) return "дня";
        return "дней";
    };

    return `${days} ${getDayWord(days)}`;
}

const AboutObjectPage = () => {
    const project = {
        name: "Стройка Центрального района",
        number: "CP-2025-002",
        address: "ул. Ленина, д. 14",
        district: "Центральный",
        latitude: 55.7558,
        longitude: 37.6173,
        responsibleUserId: "59cf95ac-261e-4c05-ab86-43e699d7b7d6",
        customerOrganizationId: "fd649e29-757b-4f89-bf0a-6350bd778e99",
        contractorOrganizationId: "7c4a300e-a83c-4bcd-98ab-8d610a7ee065",
        startDate: "2025-10-01",
        endDate: "2026-12-31",
        imageId: null,
    };
    const constructionObjects = [
        { value: "park", name: "Парк" },
        { value: "residential_complex", name: "ЖК" },
        { value: "school", name: "Школа" },
        { value: "shopping_mall", name: "ТЦ" },
    ];
    const [type, setType] = useState<string | null>(null);
    const [objPreview, setObjPreview] = useState<string | null>(null);
    const [objName, setObjName] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    console.log(startDate);
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.iconHeader}>
                    <IconApartment />
                </div>
                Об объекте
            </div>
            <div className={styles.objectForm}>
                <Media
                    type={"image"}
                    style={{ width: 213, height: 310 }}
                    url={fileUrl(objPreview)}
                    onSelectFile={async (file) => {
                        await exifr.parse(file).then((output) => console.log(output));
                        const imageId = await appStore.accountStore.uploadMediaFile(
                            file,
                            "PROFILE_IMAGE",
                        );
                        setObjPreview(imageId);
                    }}
                    onRemoveFile={() => {
                        setObjPreview(null);
                    }}
                    resolution={[213, 310]}
                    maxSizeMB={100}
                />
                <div className={styles.formContainer}>
                    <div className={styles.formHead}>
                        <div style={{ width: "100%" }}>
                            <Input
                                onChange={(e) => setObjName(e.target.value)}
                                value={objName}
                                required={true}
                                placeholder={"Введите название объекта"}
                                size={"large"}
                                formName={"Название объекта"}
                            />
                        </div>
                        <div>
                            <Button
                                type={"secondary"}
                                mode={"negative"}
                                size={"large"}
                                iconBefore={<IconBasket />}
                            >
                                Удалить объект
                            </Button>
                        </div>
                    </div>
                    <div className={styles.containerType}>
                        <div style={{ width: "100%" }}>
                            <Autocomplete
                                size={"large"}
                                placeholder={"Введите тип или выберите из списка"}
                                formName={"Тип"}
                                options={constructionObjects}
                                value={type}
                                onValueChange={setType}
                            />
                        </div>
                        <div style={{ width: 157 }}>
                            <Input
                                size={"large"}
                                formName={"Номер объекта"}
                                onChange={() => {}}
                                value={"564-543"}
                                readonly={true}
                            />
                        </div>
                    </div>
                    <div className={styles.containerDate}>
                        <DatePicker
                            value={startDate}
                            onChange={(value) => setStartDate(value)}
                            width={312}
                            placeholder={"ДД.ММ.ГГГГ"}
                            size={"large"}
                            disableTime={true}
                            formName={"Плановая дата начала работ"}
                        ></DatePicker>
                        <DatePicker
                            value={endDate}
                            onChange={(value) => setEndDate(value)}
                            width={312}
                            placeholder={"ДД.ММ.ГГГГ"}
                            size={"large"}
                            disableTime={true}
                            formName={"Плановая дата завершения"}
                        ></DatePicker>
                        {startDate && endDate && (
                            <div className={styles.dateCounter}>
                                <Typo
                                    variant={"subheadM"}
                                    type={"quaternary"}
                                    style={{ opacity: 0.7 }}
                                >
                                    Между датами
                                </Typo>
                                <Typo variant={"actionXL"}>
                                    {getDaysBetween(startDate, endDate)}
                                </Typo>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutObjectPage;
