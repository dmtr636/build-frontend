import s from "./mock.module.scss";

export default function MobileMock() {
    return (
        <div className={s.mockRoot}>
            <div className={s.device}>
                <iframe
                    className={s.iframe}
                    src={"http://localhost:3000/admin/journal"}
                    allow="clipboard-write *"
                />
                <div aria-hidden className={s.frameOverlay} />
            </div>
        </div>
    );
}
