
import fs from 'fs';
import path from 'path';
import tableAgentPrompt from '../../prompt/base_table_agent_plugin.md'
import pageAgentPrompt from '../../prompt/base_page_agent_plugin.md'
import dashboardAgentPrompt from '../../prompt/base_dashboard_agent_plugin.md'
import workflowAgentPrompt from '../../prompt/base_workflow_agent_plugin.md'
import baseAgentPrompt from '../../prompt/base_main.md'
import { codeGeneratorDef } from './tools'
import { workflowFnDef, dashboardFnDef, tableFnDef, pageCreatorFnDef } from './tools'
import { LLM } from './llm';
import { runCode, runCodeSync } from '@/app/code_runner';
import { BaseAISDK } from '../base-ai-sdk/base-ai-sdk';
import { ReminderTriggerUnit } from '../base-ai-sdk/workflowStruct';
// Assuming you have a similar structure for your tools in TypeScript
// This requires your tools to be exported from a single file or an index file in a directory

export function readJsons(toolDir: string): any[] {
    const mergedData: any[] = [];

    // Get all files in the given directory
    const files = fs.readdirSync(toolDir);

    // Filter out all .json files
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    // Read each json file and add its data to the merged data
    for (const jsonFile of jsonFiles) {
        const data = JSON.parse(fs.readFileSync(path.join(toolDir, jsonFile), 'utf-8'));
        mergedData.push(data);
    }

    return mergedData;
}


export function printToolCall(functionCall: any): void {
    const arr = ["TOOL CALL: ", functionCall.name];
    const functionArgs = JSON.parse(functionCall.arguments);

    // Adding each key-value pair to arr
    for (const [key, value] of Object.entries(functionArgs)) {
        arr.push(`${key}: ${value}`);
    }

    printBox(arr.join('\n'));
}
export function printBox(s: string): void {
    const terminalSize = process.stdout.columns;
    const maxLength = Math.floor(terminalSize * 0.8);

    const lines = s.match(new RegExp(`.{1,${maxLength}}`, 'g')) || [];

    console.log('-'.repeat(maxLength));
    for (const line of lines) {
        const padding = ' '.repeat(maxLength - line.length);
        console.log(`| ${line}${padding} |`);
    }
    console.log('-'.repeat(maxLength));
}

export function parseAgentName(s: string): string | null {
    const parts = s.split('tell_');
    if (parts.length === 2) {
        return parts[1];
    }
    return null;
}

export function runFunc(dir: string, funcName: string, args: any): any {
    // Assuming your tool files are TypeScript modules
    const modulePath = path.join(dir, 'tools');
    const module = require(modulePath); // This is a synchronous operation in Node.js

    const func = module[funcName];
    return func(...args);
}

export function getVar(dir: string, varName: string): any {
    const modulePath = path.join(dir, 'tools');
    const module = require(modulePath);

    return module[varName];
}

class SimpleAgent extends LLM {


    constructor(dir: string, prompt: string) {
        const tools = [codeGeneratorDef];
        super(prompt, tools);
    }

    async callTool(functionName: string, functionArgs: Record<string, any>): Promise<string> {
        if (functionName == 'gen_javascript_code') {
            console.log('————————subAgent receiverd Call!————————\n')
            let result: string = ""
            try {
              const code : string = functionArgs['code']
              console.log('————————subAgent generated code————————\n', code)
              //执行代码
              result = await runCode(code, { BaseAISDK })
              console.log("____result____\n", result)
            } catch (e) {
              result = "生成失败"
              console.log('err', e)
            }
            return result
        }
        return 'function没有被正确调用'
    }


}

export class Agent extends LLM {
    agents: Record<string, SimpleAgent>;
    constructor() {
        const tools = [pageCreatorFnDef, dashboardFnDef, tableFnDef, workflowFnDef]
        super(baseAgentPrompt, tools);
        this.agents = {
            'dashboard_agent': new SimpleAgent('dashboard_agent', dashboardAgentPrompt),
            'workflow_agent': new SimpleAgent('workflow_agent', workflowAgentPrompt),
            'table_agent': new SimpleAgent('table_agent', tableAgentPrompt),
            'page_agent': new SimpleAgent('page_agent', pageAgentPrompt)
        };
    }
    
    async sendMessage(agent: SimpleAgent, message: string): Promise<any> {
        return agent.run(message);
    }
    async callTool(functionName: string, functionArgs: Record<string, any>): Promise<string> {
        const agentName = parseAgentName(functionName);
        if (agentName && this.agents[agentName]) {
            const agent = this.agents[agentName];
            return this.sendMessage(agent, functionArgs.message);
        } else {
            return `the function ${functionName} is not found`;
        }
    }
    
}



