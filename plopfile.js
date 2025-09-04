export default function (plop) {
    plop.setGenerator("component", {
        description: "React component",
        prompts: [
            {
                type: "input",
                name: "path",
                message: "Component path",
                suffix: " src/",
            },
            {
                type: "input",
                name: "name",
                message: "Component name",
            },
        ],
        actions: [
            {
                type: "add",
                path: "src/{{path}}/{{name}}/{{name}}.tsx",
                templateFile: ".templates/component/component.tsx.hbs",
            },
            {
                type: "add",
                path: "src/{{path}}/{{name}}/{{name}}.module.scss",
                templateFile: ".templates/component/component.module.scss.hbs",
            },
        ],
    });
}
