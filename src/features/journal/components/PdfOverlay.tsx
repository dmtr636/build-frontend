import { Document, Page, pdfjs } from "react-pdf";
import { useState } from "react";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
).toString();
type PdfOverlayProps = {
    file: File;
    onClose: () => void;
};

export const PdfOverlay: React.FC<PdfOverlayProps> = ({ file, onClose }: PdfOverlayProps) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState(1);

    const onDocumentLoadSuccess = (payload: { numPages: number }) => {
        setNumPages(payload.numPages);
    };

    return (
        <div className="overlay-background">
            <div className="overlay-content">
                <button onClick={onClose}>Закрыть</button>
                <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                    <Page pageNumber={pageNumber} />
                </Document>
                <div>
                    <button
                        disabled={pageNumber <= 1}
                        onClick={() => setPageNumber(pageNumber - 1)}
                    >
                        Назад
                    </button>
                    <span>
                        {pageNumber} / {numPages}
                    </span>
                    <button
                        disabled={pageNumber >= numPages}
                        onClick={() => setPageNumber(pageNumber + 1)}
                    >
                        Вперёд
                    </button>
                </div>
            </div>
        </div>
    );
};
