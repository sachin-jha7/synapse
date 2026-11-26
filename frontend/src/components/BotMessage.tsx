// import Markdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
// import rehypeRaw from "rehype-raw";
// // import rehypeSanitize, {defaultSchema} from "rehype-sanitize";
// // import type { Schema } from 'hast-util-sanitize'; 
// // import type, {Schema} from "rehype-sanitize"
// import remarkMath from "remark-math";
// import rehypeKatex from "rehype-katex";
// import "katex/dist/katex.min.css";
// // import type { Pluggable } from 'unified';
// import { sanitizeWithKatex } from '../plugin';

// export default function BotMessage({ msg, idx }) {
    
//     return (
        
//         <div key={idx} className="left-msg">
//             <Markdown
//                 remarkPlugins={[remarkGfm, remarkMath]}
//                 rehypePlugins={[rehypeRaw, rehypeKatex, sanitizeWithKatex]}
//                 components={{
//                     code({ node, className, children, ...props }) {
//                         const match = /language-(\w+)/.exec(className || "");

//                         return match ? (
//                             <SyntaxHighlighter
//                                 style={vscDarkPlus}
//                                 language={match[1]}
//                                 PreTag="div"
//                             >
//                                 {String(children).replace(/\n$/, "")}
//                             </SyntaxHighlighter>
//                         ) : (
//                             <code className={className} {...props}>
//                                 {children}
//                             </code>
//                         );
//                     }
//                 }}
//             >
//                 {msg}
//             </Markdown>
//         </div>
        

//     )
// }



import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { sanitizeWithKatex } from "../plugin";

interface BotMessageProps {
    msg: string;
    idx: number;
}

export default function BotMessage({ msg, idx }: BotMessageProps) {
    return (
        <div key={idx} className="left-msg">
            <Markdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeRaw, rehypeKatex, sanitizeWithKatex]}
                components={{
                    code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");

                        return match ? (
                            <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1] ?? "text"}
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
    );
}
