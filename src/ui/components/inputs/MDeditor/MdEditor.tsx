import "@mdxeditor/editor/style.css";
import "./mdEditor.scss";
import {
    BlockTypeSelect,
    BoldItalicUnderlineToggles,
    codeBlockPlugin,
    codeMirrorPlugin,
    CreateLink,
    headingsPlugin,
    InsertCodeBlock,
    linkDialogPlugin,
    linkPlugin,
    listsPlugin,
    ListsToggle,
    MDXEditor,
    MDXEditorMethods,
    tablePlugin,
    toolbarPlugin,
    UndoRedo,
} from "@mdxeditor/editor";
import { useEffect, useMemo, useRef } from "react";
import styles from "./MdEditor.module.scss";
import { clsx } from "clsx";

const ToolbarContents = () => (
    <>
        <UndoRedo />
        <BoldItalicUnderlineToggles />
        <BlockTypeSelect />
        {/*
        <ChangeCodeMirrorLanguage />,
*/}
        <CreateLink />
        <ListsToggle options={["number", "bullet"]} />
        <InsertCodeBlock />
        {/* <InsertTable />*/}
    </>
);

interface MdEditorProps {
    value?: string;
    className?: string;
    readOnly?: boolean;
    onChange?: (value: string) => void;
}

export const MdEditor = ({ value, className, readOnly = false, onChange }: MdEditorProps) => {
    const mdxEditorRef = useRef<MDXEditorMethods>(null);

    const plugins = useMemo(
        () => [
            toolbarPlugin({
                toolbarClassName: clsx(styles.toolbar, {
                    [styles.toolbarHide]: readOnly,
                }),
                toolbarContents: ToolbarContents,
            }),
            headingsPlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            listsPlugin(),

            codeBlockPlugin({ defaultCodeBlockLanguage: "js" }),
            codeMirrorPlugin({
                codeBlockLanguages: { js: "JavaScript", css: "CSS", python: "Python" },
            }),
            tablePlugin(),
        ],
        [readOnly],
    );

    useEffect(() => {
        mdxEditorRef.current?.setMarkdown(value || "");
    }, [value]);

    return (
        <div className={clsx(styles.editorWrapper, className)}>
            <MDXEditor
                contentEditableClassName={readOnly ? "codeMirrorToolbar" : "qwe"}
                ref={mdxEditorRef}
                onChange={onChange}
                className={styles.editor}
                markdown={value || ""}
                readOnly={readOnly}
                plugins={plugins}
            />
        </div>
    );
};
