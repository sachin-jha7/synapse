import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";
// import rehypeSanitize, {defaultSchema} from "rehype-sanitize";
// import type { Schema } from 'hast-util-sanitize'; 
// import type, {Schema} from "rehype-sanitize"
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
// import type { Pluggable } from 'unified';
import { sanitizeWithKatex } from '../plugin';

export default function BotMessage({ msg, idx }) {
    // const katexSchema: Schema = {
    //     ...defaultSchema,
    //     tagNames: [...defaultSchema.tagNames, 'span'],
    //     attributes: {
    //         ...defaultSchema.attributes,
    //         span: ['class', 'style', 'data-fragment-index', 'aria-label'],
    //     },
    // };
    // const sanitizeWithKatex = rehypeSanitize(katexSchema as any);
    // const sanitizeWithKatex = rehypeSanitize(katexSchema) as unknown as Pluggable;

    // const sanitizeWithKatex: Plugin<any[], any, any> = rehypeSanitize(katexSchema as any);
    return (
        // <div key={idx + Math.random() * 10} className="left-msg">
        //     <Markdown
        //         remarkPlugins={[remarkGfm]}
        //         components={{
        //             code({ node, className, children, ...props }) {
        //                 const match = /language-(\w+)/.exec(className || "");

        //                 return match ? (
        //                     <SyntaxHighlighter
        //                         style={vscDarkPlus}
        //                         language={match[1]}
        //                         PreTag="div"
        //                     >
        //                         {String(children).replace(/\n$/, "")}
        //                     </SyntaxHighlighter>
        //                 ) : (
        //                     <code className={className} {...props}>
        //                         {children}
        //                     </code>
        //                 );
        //             }
        //         }}
        //     >
        //         {msg}
        //     </Markdown>
        // </div>
        // <div key={idx} className="left-msg">
        //     <Markdown
        //         remarkPlugins={[remarkGfm]}
        //         rehypePlugins={[rehypeRaw, rehypeSanitize]}
        //         components={{
        //             code({ node, className, children, ...props }) {
        //                 const match = /language-(\w+)/.exec(className || "");

        //                 return match ? (
        //                     <SyntaxHighlighter
        //                         style={vscDarkPlus}
        //                         language={match[1]}
        //                         PreTag="div"
        //                     >
        //                         {String(children).replace(/\n$/, "")}
        //                     </SyntaxHighlighter>
        //                 ) : (
        //                     <code className={className} {...props}>
        //                         {children}
        //                     </code>
        //                 );
        //             }
        //         }}
        //     >
        //         {msg}
        //     </Markdown>
        // </div>

        <div key={idx} className="left-msg">
            <Markdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeRaw, rehypeKatex, sanitizeWithKatex]}
                components={{
                    code({ node, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");

                        return match ? (
                            <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                            >
                                {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                        ) : (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    }
                }}
            >
                {msg}
            </Markdown>
        </div>


        // <div key={idx} className="left-msg">
        //     <Markdown
        //         remarkPlugins={[remarkGfm, remarkMath]}
        //         rehypePlugins={[rehypeRaw, rehypeKatex, rehypeSanitize]}
        //         components={{
        //             table({ children }) {
        //                 return (
        //                     <div className="table-wrapper">
        //                         <table>{children}</table>
        //                     </div>
        //                 );
        //             },

        //             pre({ children }) {
        //                 return (
        //                     <div className="pre-wrapper">
        //                         {children}
        //                     </div>
        //                 );
        //             },

        //             code({ node, className, children, ...props }) {
        //                 const match = /language-(\w+)/.exec(className || "");

        //                 return match ? (
        //                     <SyntaxHighlighter
        //                         style={vscDarkPlus}
        //                         language={match[1]}
        //                         PreTag="div"
        //                         wrapLongLines={true}
        //                         customStyle={{
        //                             margin: 0,
        //                             maxWidth: "100%",
        //                             overflowX: "scroll",
        //                             boxSizing: "border-box",
        //                             whiteSpace: "pre-wrap",
        //                             overflowWrap: "anywhere"
        //                         }}
        //                     >
        //                         {String(children).replace(/\n$/, "")}
        //                     </SyntaxHighlighter>
        //                 ) : (
        //                     <code className={className} {...props}>
        //                         {children}
        //                     </code>
        //                 );
        //             }
        //         }}
        //     >
        //         {msg}
        //     </Markdown>
        // </div>

    )
}