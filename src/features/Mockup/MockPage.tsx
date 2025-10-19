import s from "./mock.module.scss";
import { Helmet } from "react-helmet";

export default function MobileMock() {
    return (
        <div className={s.mockRoot}>
            <Helmet>
                <title>Mockup</title>
            </Helmet>
            <div className={s.device}>
                <iframe
                    className={s.iframe}
                    src={`${window.location.origin}/admin/journal`}
                    allow="clipboard-write *"
                />
                <div aria-hidden className={s.frameOverlay} />
            </div>
        </div>
    );
}
