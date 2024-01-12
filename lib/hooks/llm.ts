import OpenAI from 'openai';
import { printBox } from './baseAgent';
import { printToolCall } from './baseAgent';
import { Message, CreateMessage, ChatRequestOptions } from 'ai';

const client = new OpenAI({ apiKey: 'sk-9ntmpR5D3Oxf0NbQ1IVCL5JfWIzM9cpYrzn4un5VlHYKri9G', baseURL: 'https://api.openai-proxy.org/v1' })
// interface message {
// id: string;
// createdAt?: Date;
// content: string;
// ui?: string | JSX.Element | JSX.Element[] | null | undefined;
// role: 'system' | 'user' | 'assistant' | 'function';
// /**
//  * If the message has a role of `function`, the `name` field is the name of the function.
//  * Otherwise, the name field should not be set.
//  */
// name?: string;
// /**
//  * If the assistant role makes a function call, the `function_call` field
//  * contains the function call name and arguments. Otherwise, the field should
//  * not be set.
//  */
// function_call?: string | FunctionCall;
// }
// interface FunctionCall {
//     /**
//      * The arguments to call the function with, as generated by the model in JSON
//      * format. Note that the model does not always generate valid JSON, and may
//      * hallucinate parameters not defined by your function schema. Validate the
//      * arguments in your code before calling your function.
//      */
//     arguments?: string;
//     /**
//      * The name of the function to call.
//      */
//     name?: string;
// }
export abstract class LLM {
    systemPrompt: string;
    tools: any;
    messages: any;


    constructor(systemPrompt: string, tools: any = null) {
        this.systemPrompt = systemPrompt;
        this.tools = tools;
        this.messages = [{ role: "system", content: this.systemPrompt }];
        this.isLoading = false;
        this.input = ''
    }

    abstract callTool(functionName: string, functionArgs: string[]): void;

    // 新增方法
    async append(message: Message | CreateMessage, chatRequestOptions?: ChatRequestOptions): Promise<string | null | undefined> {
        this.messages.push(message);
        return message.content
    }
    async reload(chatRequestOptions?: ChatRequestOptions): Promise<string | null | undefined> {
        return this.messages[this.messages.length - 1]
    }
    stop(): void {

    }
    isLoading: boolean;
    input: string;
    /** setState-powered method to update the input value */
    abstract setInput: React.Dispatch<React.SetStateAction<string>>;


    async run(newMessage: string): Promise<string> {
        this.isLoading = true
        this.input = newMessage
        this.messages.push({ role: "user", content: newMessage });
        let content: string | null = null;
        let functionCall: any = '';
        let response: any;
        while (functionCall !== null) {
            if (this.tools !== null) {
                response = await client.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: this.messages,
                    functions: this.tools
                });

            }
            else {
                response = await client.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: this.messages,
                });
            }
            const responseMessage = response.choices[0].message
            this.messages.push(responseMessage);
            functionCall = responseMessage.function_call
            content = responseMessage.content;
            if (content)
                printBox('Agent:' + content)
            if (functionCall)
                printToolCall(functionCall)
            const functionName = functionCall.name
            const functionArgs = JSON.parse(functionCall.arguments)
            const resp = this.callTool(functionName, functionArgs)
            this.messages.push(
                {
                    "role": "function",
                    "name": functionName,
                    "content": resp,
                }
            )
        }
        this.isLoading = false;
        return content || 'content为空';
    }
}